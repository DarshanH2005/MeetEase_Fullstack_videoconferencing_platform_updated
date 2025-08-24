import React from "react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  styled,
  IconButton,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
} from "@mui/material";
import { Badge } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import BugReportIcon from "@mui/icons-material/BugReport";
import ShareIcon from "@mui/icons-material/Share";
// Modern rounded icons
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import VideoCallOutlinedIcon from "@mui/icons-material/VideoCallOutlined";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";
import PresentToAllRoundedIcon from "@mui/icons-material/PresentToAllRounded";
import StopScreenShareRoundedIcon from "@mui/icons-material/StopScreenShareRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CallEndRoundedIcon from "@mui/icons-material/CallEndRounded";
import server from "../environment";
import { useApp } from "../../context/AppContext";
import { FloatingDock } from "../../components/ui/floating-dock";
import { HoverEffect } from "../../components/ui/card-hover-effect";
import { TextHoverEffect } from "../../components/ui/text-hover-effect";
import BlurryBlob from "../../components/ui/BlurryBlob";
import VideoMeetingGrid from "../../components/ui/VideoMeetingGrid";
import {
  useSpeakerDetection,
  useVideoLayoutManager,
  useConnectionQuality,
} from "../../hooks/useMeetingHooks";
import { useToast } from "../../components/hooks/use-toast";
import { LoaderOne, LoaderTwo } from "../../components/ui/loader";

const server_url = server;

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const StyledBox = styled("div")(({ theme }) => ({
  alignSelf: "center",
  marginLeft: "auto",
  marginRight: "auto",
  marginBottom: "150px",
  width: "80%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 400,
  marginTop: theme.spacing(8),
  borderRadius: (theme.vars || theme).shape.borderRadius,
  border: "1px solid",
  borderColor: (theme.vars || theme).palette.grey[300],
  backgroundColor: (theme.vars || theme).palette.background.paper,
  backgroundSize: "cover",
  [theme.breakpoints.up("sm")]: {
    marginTop: theme.spacing(10),
    height: 800,
  },
  ...theme.applyStyles("dark", {
    borderColor: (theme.vars || theme).palette.grey[700],
    backgroundColor: (theme.vars || theme).palette.background.paper,
  }),
}));

const StyledBox2 = styled("div")(({ theme }) => ({
  alignSelf: "center",
  width: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: theme.spacing(0),
  borderRadius: (theme.vars || theme).shape.borderRadius,
  border: "1px solid",
  borderColor: (theme.vars || theme).palette.grey[300],
  backgroundColor: (theme.vars || theme).palette.background.paper,
  backgroundSize: "cover",
  [theme.breakpoints.up("sm")]: {
    marginTop: theme.spacing(10),
    height: 400,
  },
  ...theme.applyStyles("dark", {
    borderColor: (theme.vars || theme).palette.grey[700],
    backgroundColor: (theme.vars || theme).palette.background.paper,
  }),
}));

const StyledBox3 = styled("div")(({ theme }) => ({
  borderRadius: (theme.vars || theme).shape.borderRadius,
  border: "1px solid",
  borderColor: (theme.vars || theme).palette.grey[300],
  backgroundColor: (theme.vars || theme).palette.background.paper,
  backgroundSize: "cover",
  [theme.breakpoints.up("sm")]: {},
  ...theme.applyStyles("dark", {
    borderColor: (theme.vars || theme).palette.grey[700],
    backgroundColor: (theme.vars || theme).palette.background.paper,
  }),
}));

// NEW OVERLAY COMPONENTS FOR UI ARRANGEMENT ONLY

const LocalVideoOverlay = styled("div")({
  position: "fixed",
  right: "20px", // Changed from left calculation to simple right positioning
  bottom: "20px",
  width: "240px",
  height: "135px",
  zIndex: 999, // Slightly lower than floating dock
  overflow: "hidden",
  borderRadius: "12px",
  border: "2px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  backdropFilter: "blur(10px)",
  background: "rgba(0, 0, 0, 0.1)",
  "@media (max-width: 768px)": {
    width: "180px",
    height: "120px",
    right: "10px",
    bottom: "100px", // Above mobile dock
  },
});

// Animated Gradient Wrapper Component - Fixed Chat Overlay
const ChatOverlay = styled("div")(({ theme }) => ({
  position: "fixed",
  top: "15vh", // Fixed top positioning
  bottom: "15vh", // Fixed bottom positioning
  right: "20px",
  width: "380px", // Slightly wider
  maxHeight: "70vh", // Better max height
  height: "auto", // Auto height within constraints
  // Match your card design styling
  borderRadius: "16px", // More rounded
  border: "1px solid rgba(255, 255, 255, 0.1)",
  backgroundColor: "rgba(0, 0, 0, 0.8)", // Consistent with your theme
  backdropFilter: "blur(20px)",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  padding: theme.spacing(2.5),
  overflowY: "auto",
  transition: "all 0.3s ease",
  color: "white",
  zIndex: 999,
  display: "flex",
  flexDirection: "column",
  ...theme.applyStyles("dark", {
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  }),
  "& .MuiTextField-root": {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.3)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255, 255, 255, 0.5)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#667eea",
      },
      "& input": {
        color: "white",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255, 255, 255, 0.7)",
      "&.Mui-focused": {
        color: "#667eea",
      },
    },
  },
  "& h1": {
    margin: "0 0 16px 0",
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "white",
  },
}));
export default function VideoMeet() {
  const { state } = useApp();
  const { toast } = useToast();

  // Refs
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localvideoRef = useRef();
  const chatVideoRef = useRef(); // Separate ref for chat area video
  const videoRef = useRef([]);
  const dockRef = useRef(null);

  // Basic video/audio state
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState();

  // Meeting state
  const [showModal, setModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newMessages, setNewMessages] = useState(3);
  const [askUsername, setAskUsername] = useState(false);
  const [username, setUsername] = useState(state.user.displayName || "Guest");
  const [videos, setVideos] = useState([]);
  const [participants, setParticipants] = useState(new Map());

  // Panel states for Settings and Debug
  const [showSettingsPanel, setSettingsPanel] = useState(false);
  const [showDebugPanel, setDebugPanel] = useState(false);

  // Device management states
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");
  const [speakerDevices, setSpeakerDevices] = useState([]);
  const [selectedSpeakerDevice, setSelectedSpeakerDevice] = useState("");
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);
  const [micTestLevel, setMicTestLevel] = useState(0);

  // Video Grid Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const videosPerPage = 2; // Temporary: Show pagination with just 2 participants for testing
  const totalPages = Math.ceil(videos.length / videosPerPage);

  // Video Loading and Quality States
  const [videoLoadingStates, setVideoLoadingStates] = useState(new Map());
  const [videoErrors, setVideoErrors] = useState(new Map());
  const [connectionQualities, setConnectionQualities] = useState(new Map());
  const [speakingUsers, setSpeakingUsers] = useState(new Set());

  // Calculate current videos to display
  const currentVideos = videos.slice(
    currentPage * videosPerPage,
    (currentPage + 1) * videosPerPage
  );

  // UI state
  // Removed mouse tracking - new dock handles its own animations

  // Enhanced meeting management hooks
  const {
    activeSpeaker,
    audioLevels,
    speakingParticipants,
    isSupported: speakerDetectionSupported,
  } = useSpeakerDetection(
    videos.map((v) => ({
      ...v,
      stream: v.stream,
      audioEnabled: audioAvailable,
      videoEnabled: videoAvailable,
    })),
    {
      threshold: 25,
      debounceTime: 300,
      smoothingFactor: 0.4,
    }
  );

  const {
    viewMode,
    setViewMode,
    spotlightParticipant,
    setSpotlight,
    clearSpotlight,
    pinnedParticipants,
    pinParticipant,
    unpinParticipant,
  } = useVideoLayoutManager(videos);

  const { connectionStats, qualityMetrics } = useConnectionQuality(videos);

  // Enhanced notifications for meeting events - Meeting room specific configuration
  const showToast = (type, title, description, action = null) => {
    toast({
      variant: type,
      title,
      description,
      action,
      duration: 2000, // 2 seconds auto-dismiss for meeting room
      className: "meeting-toast-compact", // Custom class for smaller size
    });
  };

  // Enhanced send message function
  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      const messageText = newMessage.trim();

      // Send message in format backend expects: (data, sender)
      socketRef.current.emit("chat-message", messageText, username);

      // Add to local messages immediately for instant feedback
      const localMessage = {
        sender: username,
        data: messageText,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, localMessage]);
      setNewMessage("");

      // Reduced frequency toast for better UX
      showToast("success", "Sent", "Message sent");
    }
  };

  // Handle participant click for spotlight
  const handleParticipantClick = (participant) => {
    if (spotlightParticipant === participant.socketId) {
      clearSpotlight();
      showToast(
        "default",
        "Spotlight cleared",
        `Removed ${participant.title} from spotlight`
      );
    } else {
      setSpotlight(participant.socketId);
      showToast(
        "success",
        "Spotlight set",
        `${participant.title} is now in spotlight`
      );
    }
  };

  let getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .then((stream) => {})
          .catch((e) => {
            console.log(e);
            showToast(
              "destructive",
              "Screen share failed",
              "Unable to start screen sharing"
            );
          });
      }
    }
  };

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setVideoAvailable(true);
      videoPermission.getTracks().forEach((track) => track.stop());

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      setAudioAvailable(true);
      audioPermission.getTracks().forEach((track) => track.stop());

      showToast(
        "success",
        "Permissions granted",
        "Camera and microphone access enabled"
      );
    } catch (err) {
      console.log(err);
      showToast(
        "destructive",
        "Permission denied",
        "Please enable camera and microphone access"
      );
    }
  };

  const getUserMedia = () => {
    console.log(
      "getUserMedia called - video:",
      video,
      "audio:",
      audio,
      "videoAvailable:",
      videoAvailable,
      "audioAvailable:",
      audioAvailable
    );

    if ((video && videoAvailable) || (audio && audioAvailable)) {
      const constraints = {
        video: video && videoAvailable,
        audio: audio && audioAvailable,
      };

      console.log("Requesting media with constraints:", constraints);

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          console.log("Got user media stream:", stream);
          console.log("Audio tracks:", stream.getAudioTracks());
          console.log("Video tracks:", stream.getVideoTracks());

          getUserMediaSuccess(stream);
        })
        .catch((e) => {
          console.error("getUserMedia error:", e);
          showToast(
            "destructive",
            "Media access failed",
            `Unable to access ${audio ? "microphone" : ""} ${
              video ? "camera" : ""
            }: ${e.message}`
          );
        });
    } else {
      console.log("No media requested - creating silent stream");
      // Create a silent stream if no media is requested
      let blackSilence = (...args) =>
        new MediaStream([black(...args), silence()]);
      const stream = blackSilence();
      getUserMediaSuccess(stream);
    }
  };

  const getUserMediaSuccess = (stream) => {
    try {
      console.log("getUserMediaSuccess called with stream:", stream);
      console.log("Stream audio tracks:", stream.getAudioTracks());
      console.log("Stream video tracks:", stream.getVideoTracks());

      // Ensure audio tracks are enabled if we have them
      stream.getAudioTracks().forEach((track) => {
        console.log(
          "Audio track enabled:",
          track.enabled,
          "readyState:",
          track.readyState
        );
        track.enabled = audio; // Enable/disable based on current audio state
      });

      // Ensure video tracks are enabled if we have them
      stream.getVideoTracks().forEach((track) => {
        console.log(
          "Video track enabled:",
          track.enabled,
          "readyState:",
          track.readyState
        );
        track.enabled = video; // Enable/disable based on current video state
      });

      window.localStream = stream;
      if (localvideoRef.current) {
        localvideoRef.current.srcObject = stream;
      }
      if (chatVideoRef.current) {
        chatVideoRef.current.srcObject = stream;
      }

      // Update existing peer connections with new stream
      Object.keys(connections).forEach((socketId) => {
        if (connections[socketId] && connections[socketId].addStream) {
          try {
            // Remove old stream tracks
            const senders = connections[socketId].getSenders();
            senders.forEach((sender) => {
              if (sender.track) {
                connections[socketId].removeTrack(sender);
              }
            });

            // Add new stream
            connections[socketId].addStream(stream);
            console.log("Updated stream for connection:", socketId);
          } catch (err) {
            console.log("Error updating stream for connection:", socketId, err);
          }
        }
      });
    } catch (e) {
      console.error("getUserMediaSuccess error:", e);
    }
  };

  const getDislayMediaSuccess = (stream) => {
    try {
      window.localStream = stream;
      if (localvideoRef.current) {
        localvideoRef.current.srcObject = stream;
      }
      if (chatVideoRef.current) {
        chatVideoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.log(e);
    }
  };

  const gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  const connectToSocketServer = () => {
    // Compute socket endpoint from API/server URL. environment.server may include
    // an API path like `/api` or `/api/v1` which is not the socket root. Strip it.
    let computedSocketEndpoint = server_url;
    try {
      // Prefer removing any '/api/' segment and anything after it
      const apiSeg = computedSocketEndpoint.indexOf("/api/");
      if (apiSeg !== -1) {
        computedSocketEndpoint = computedSocketEndpoint.substring(0, apiSeg);
      } else {
        // Fallback: remove '/api' if present (covers '/api' or '/api/v1')
        const apiPlain = computedSocketEndpoint.indexOf("/api");
        if (apiPlain !== -1) {
          computedSocketEndpoint = computedSocketEndpoint.substring(
            0,
            apiPlain
          );
        }
      }
      // Trim trailing slash
      computedSocketEndpoint = computedSocketEndpoint.replace(/\/$/, "");
    } catch (e) {
      computedSocketEndpoint = server_url;
    }

    // Prefer same-origin in the browser (helps when frontend & backend are co-located behind same host/proxy)
    const originFallback =
      typeof window !== "undefined" && window.location && window.location.origin
        ? window.location.origin
        : computedSocketEndpoint;

    // Allow an env override for tricky deployments / debugging
    const debugOverride =
      typeof process !== "undefined" &&
      process.env &&
      process.env.NEXT_PUBLIC_SOCKET_OVERRIDE
        ? process.env.NEXT_PUBLIC_SOCKET_OVERRIDE
        : null;

    const socketBase =
      debugOverride || originFallback || computedSocketEndpoint;

    // Connect using explicit path and transports to avoid polling mismatch
    socketRef.current = io(socketBase, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      timeout: 20000,
      secure: (socketBase || "").startsWith("https"),
    });

    // Attach core listeners
    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      console.info(
        "Socket connected",
        socketRef.current.id,
        "endpoint=",
        computedSocketEndpoint
      );
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      showToast("success", "Connected", "Successfully joined the meeting");
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connect_error", err);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.warn("Socket disconnected", reason);
    });

    socketRef.current.on(
      "chat-message",
      (data, sender, socketId, timestamp) => {
        // Avoid duplicate messages (don't add if it's from current user)
        if (sender !== username) {
          const messageObj = {
            sender: sender,
            data: data,
            timestamp: timestamp
              ? new Date(timestamp).toLocaleTimeString()
              : new Date().toLocaleTimeString(),
          };
          setMessages((prevMessages) => [...prevMessages, messageObj]);
          setNewMessages((prevNewMessages) => prevNewMessages + 1);

          // Only show toast for messages from others, not our own
          // Reduced toast frequency to prevent UI disruption
          if (data.length > 20) {
            showToast(
              "default",
              "New message",
              `${sender}: ${data.substring(0, 20)}...`
            );
          } else {
            showToast("default", "New message", `${sender}: ${data}`);
          }
        }
      }
    );

    socketRef.current.on("user-left", (id) => {
      const participantName = participants.get(id) || `User ${id.substr(0, 4)}`;
      setVideos((videos) => videos.filter((video) => video.socketId !== id));
      setParticipants((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      showToast(
        "warning",
        "Participant left",
        `${participantName} has left the meeting`
      );
    });

    socketRef.current.on("user-joined", (id, clients, username) => {
      clients.forEach((socketListId) => {
        if (
          !connections[socketListId] &&
          socketListId !== socketIdRef.current
        ) {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections[socketListId].onaddstream = (event) => {
            console.log("Stream received from:", socketListId, event.stream);

            // Check if this is a valid, unique stream
            if (!event.stream || !event.stream.getVideoTracks().length) {
              console.warn(
                "Invalid or empty stream received from:",
                socketListId
              );
              return;
            }

            var videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videoExists) {
              // Update existing video with new stream
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? {
                        ...video,
                        stream: event.stream,
                        streamId: event.stream.id, // Add unique stream identifier
                        lastUpdated: Date.now(),
                      }
                    : video
                );
                console.log("Updated existing video for:", socketListId);
                return updatedVideos;
              });
            } else {
              // Create new video entry with unique stream
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                streamId: event.stream.id, // Unique stream identifier
                autoplay: true,
                playsinline: true,
                lastUpdated: Date.now(),
              };

              videoRef.current.push(newVideo);
              setVideos((videos) => {
                const newVideos = [...videos, newVideo];
                console.log(
                  "Added new video for:",
                  socketListId,
                  "Total videos:",
                  newVideos.length
                );
                return newVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        }
      });

      if (id === socketIdRef.current) {
        for (let id2 in connections) {
          if (id2 === socketIdRef.current) continue;

          try {
            connections[id2].addStream(window.localStream);
          } catch (e) {}

          connections[id2].createOffer().then((description) => {
            connections[id2]
              .setLocalDescription(description)
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({ sdp: connections[id2].localDescription })
                );
              })
              .catch((e) => console.log(e));
          });
        }
      }

      // Update participants map
      setParticipants((prev) => {
        const newMap = new Map(prev);
        newMap.set(id, username || `User ${id.substr(0, 4)}`);
        return newMap;
      });

      if (id !== socketIdRef.current) {
        showToast(
          "success",
          "New participant",
          `${username || "Someone"} joined the meeting`
        );
      }
    });

    // Enhanced participant joined handler for advanced features
    socketRef.current.on("participant-joined", (data) => {
      if (data && data.participants) {
        // Update participant metadata for enhanced features
        console.log("Enhanced participant data received:", data);

        // This can be used by VideoMeetingGrid or other components that need
        // detailed participant information including audio/video status
        if (data.newParticipant) {
          const {
            socketId,
            username,
            audioEnabled,
            videoEnabled,
            connectionQuality,
          } = data.newParticipant;

          // Update any enhanced UI components that track participant status
          // This data will be available for speaker detection, grid layouts, etc.
          showToast(
            "info",
            "Participant details",
            `${username} joined with ${
              audioEnabled ? "audio on" : "audio off"
            } and ${videoEnabled ? "video on" : "video off"}`
          );
        }
      }
    });
  };

  // Responsive hook for mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return dst.stream.getAudioTracks()[0];
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return stream.getVideoTracks()[0];
  };

  const handleVideo = () => {
    setVideo(!video);
    getUserMedia();
  };

  // Quick audio diagnostic function
  const testAudioAccess = async () => {
    try {
      console.log("Testing audio access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      const audioTracks = stream.getAudioTracks();

      if (audioTracks.length > 0) {
        showToast(
          "success",
          "Microphone Test",
          `Found ${audioTracks.length} audio device(s)`
        );
        console.log(
          "Audio devices found:",
          audioTracks.map((t) => ({ label: t.label, enabled: t.enabled }))
        );

        // Test audio level detection
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let testCount = 0;
        const testInterval = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          console.log("Audio level:", average);

          testCount++;
          if (testCount >= 10) {
            // Test for 1 second
            clearInterval(testInterval);
            stream.getTracks().forEach((track) => track.stop());
            audioContext.close();
            showToast(
              "info",
              "Audio Test Complete",
              "Check console for audio levels"
            );
          }
        }, 100);
      } else {
        showToast("error", "No Audio Devices", "No microphone found");
      }
    } catch (error) {
      console.error("Audio test error:", error);
      showToast(
        "error",
        "Audio Test Failed",
        error.message || "Could not access microphone"
      );
    }
  };

  const handleAudio = () => {
    console.log("handleAudio called - current audio state:", audio);
    const newAudioState = !audio;
    setAudio(newAudioState);

    // If we have an existing stream, just toggle the audio tracks
    if (window.localStream) {
      window.localStream.getAudioTracks().forEach((track) => {
        track.enabled = newAudioState;
        console.log("Toggled audio track enabled:", track.enabled);
      });

      // Update the UI toast
      showToast(
        newAudioState ? "success" : "warning",
        newAudioState ? "Microphone On" : "Microphone Off",
        newAudioState ? "You can now speak" : "You are muted"
      );
    } else {
      // Get new media stream
      getUserMedia();
    }
  };

  const handleScreen = () => {
    setScreen(!screen);
    getDislayMedia();
  };

  const handleEndCall = () => {
    try {
      let tracks = localvideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}

    showToast("warning", "Call ended", "You have left the meeting");
    window.location.href = "/";
  };

  const handleInvite = () => {
    const meetingUrl = window.location.href;

    if (navigator.share) {
      // Use native share API on mobile devices
      navigator
        .share({
          title: "Join my MeetEase meeting",
          text: `Join me in this video meeting on MeetEase`,
          url: meetingUrl,
        })
        .then(() => {
          showToast(
            "success",
            "Invite sent",
            "Meeting link shared successfully"
          );
        })
        .catch((error) => {
          console.log("Error sharing:", error);
          fallbackCopyInvite(meetingUrl);
        });
    } else {
      // Fallback to clipboard copy
      fallbackCopyInvite(meetingUrl);
    }
  };

  const fallbackCopyInvite = (meetingUrl) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(meetingUrl)
        .then(() => {
          showToast(
            "success",
            "Invite copied",
            "Meeting link copied to clipboard"
          );
        })
        .catch(() => {
          showManualCopyDialog(meetingUrl);
        });
    } else {
      showManualCopyDialog(meetingUrl);
    }
  };

  const showManualCopyDialog = (meetingUrl) => {
    const message = `Copy this meeting link to invite others:\n\n${meetingUrl}`;
    alert(message);
  };

  // Cleanup function for video streams
  const cleanupVideoStreams = useCallback(() => {
    videos.forEach((video) => {
      if (video.stream) {
        video.stream.getTracks().forEach((track) => {
          console.log(
            "Cleaning up track:",
            track.kind,
            "for socket:",
            video.socketId
          );
          track.stop();
        });
      }
    });
  }, [videos]);

  // Video loading and error handling functions
  const setVideoLoading = useCallback((socketId, isLoading) => {
    setVideoLoadingStates((prev) => new Map(prev.set(socketId, isLoading)));
  }, []);

  const setVideoError = useCallback((socketId, hasError) => {
    setVideoErrors((prev) => new Map(prev.set(socketId, hasError)));
  }, []);

  const handleVideoLoad = useCallback(
    (socketId) => {
      console.log("Video loaded successfully for:", socketId);
      setVideoLoading(socketId, false);
      setVideoError(socketId, false);
    },
    [setVideoLoading, setVideoError]
  );

  const handleVideoError = useCallback(
    (socketId) => {
      console.error("Video error for:", socketId);
      setVideoLoading(socketId, false);
      setVideoError(socketId, true);
    },
    [setVideoLoading, setVideoError]
  );

  // Video Grid Pagination Functions
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const setConnectionQuality = (socketId, quality) => {
    setConnectionQualities((prev) => new Map(prev.set(socketId, quality)));
  };

  const openChat = () => {
    setModal(true);
    setNewMessages(0);
  };

  const closeChat = () => {
    setModal(false);
  };

  // Panel control functions
  const openSettingsPanel = () => {
    setSettingsPanel(true);
    setDebugPanel(false);
    setModal(false);
  };

  const openDebugPanel = () => {
    setDebugPanel(true);
    setSettingsPanel(false);
    setModal(false);
  };

  const closeAllPanels = () => {
    setSettingsPanel(false);
    setDebugPanel(false);
  };

  // Device management functions
  const getAvailableDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput"
      );
      const videoInputs = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const audioOutputs = devices.filter(
        (device) => device.kind === "audiooutput"
      );

      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);
      setSpeakerDevices(audioOutputs);

      // Set default devices if not already selected
      if (!selectedAudioDevice && audioInputs.length > 0) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
      if (!selectedVideoDevice && videoInputs.length > 0) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
      if (!selectedSpeakerDevice && audioOutputs.length > 0) {
        setSelectedSpeakerDevice(audioOutputs[0].deviceId);
      }
    } catch (error) {
      console.error("Error getting devices:", error);
      showToast(
        "destructive",
        "Device Error",
        "Could not access media devices"
      );
    }
  };

  const changeAudioDevice = async (deviceId) => {
    try {
      setSelectedAudioDevice(deviceId);
      // Stop current audio track
      if (audio && localvideoRef.current && localvideoRef.current.srcObject) {
        const stream = localvideoRef.current.srcObject;
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach((track) => track.stop());
      }

      // Get new audio stream with selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: false,
      });

      // Replace audio track in existing stream
      if (localvideoRef.current && localvideoRef.current.srcObject) {
        const stream = localvideoRef.current.srcObject;
        const newAudioTrack = newStream.getAudioTracks()[0];
        stream.addTrack(newAudioTrack);
      }

      showToast(
        "success",
        "Audio Device Changed",
        "Microphone updated successfully"
      );
    } catch (error) {
      console.error("Error changing audio device:", error);
      showToast("destructive", "Device Error", "Could not change microphone");
    }
  };

  const changeVideoDevice = async (deviceId) => {
    try {
      setSelectedVideoDevice(deviceId);
      // Stop current video track
      if (video && localvideoRef.current && localvideoRef.current.srcObject) {
        const stream = localvideoRef.current.srcObject;
        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach((track) => track.stop());
      }

      // Get new video stream with selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false,
      });

      // Replace video track in existing stream
      if (localvideoRef.current && localvideoRef.current.srcObject) {
        const stream = localvideoRef.current.srcObject;
        const newVideoTrack = newStream.getVideoTracks()[0];
        stream.addTrack(newVideoTrack);
        localvideoRef.current.srcObject = stream;
      }

      showToast(
        "success",
        "Video Device Changed",
        "Camera updated successfully"
      );
    } catch (error) {
      console.error("Error changing video device:", error);
      showToast("destructive", "Device Error", "Could not change camera");
    }
  };

  const testMicrophone = async () => {
    setIsTestingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedAudioDevice },
        video: false,
      });

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      microphone.connect(analyser);
      analyser.fftSize = 256;

      const detectSound = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setMicTestLevel(average);

        if (isTestingMic) {
          requestAnimationFrame(detectSound);
        }
      };

      detectSound();

      // Stop testing after 10 seconds
      setTimeout(() => {
        setIsTestingMic(false);
        setMicTestLevel(0);
        stream.getTracks().forEach((track) => track.stop());
        audioContext.close();
      }, 10000);
    } catch (error) {
      console.error("Microphone test error:", error);
      setIsTestingMic(false);
      showToast("destructive", "Test Failed", "Could not test microphone");
    }
  };

  const testSpeaker = () => {
    setIsTestingSpeaker(true);

    // Create a simple test tone
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start();

    // Stop after 2 seconds
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
      setIsTestingSpeaker(false);
      showToast(
        "success",
        "Speaker Test Complete",
        "Did you hear the test tone?"
      );
    }, 2000);
  };

  // Load devices when settings panel opens
  useEffect(() => {
    if (showSettingsPanel) {
      getAvailableDevices();
    }
  }, [showSettingsPanel]);

  const handleMessage = (e) => {
    setMessage(e.target.value);
  };

  const connect = () => {
    setAskUsername(false);
    showToast("success", "Connecting...", "Joining the meeting room");
    getMedia();
  };

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    getUserMedia();
    connectToSocketServer();
  };

  // Auto-connect if we have a username from context
  useEffect(() => {
    if (state.user.displayName) {
      setUsername(state.user.displayName);
      setAskUsername(false);
      getPermissions();
      setTimeout(() => {
        connect();
      }, 1000);
    } else {
      setAskUsername(true);
      getPermissions();
    }
  }, [state.user.displayName]);

  // Speaker detection effects
  useEffect(() => {
    if (activeSpeaker && speakerDetectionSupported) {
      const speakerName =
        participants.get(activeSpeaker) || `User ${activeSpeaker.substr(0, 4)}`;
      setSpotlight(activeSpeaker);

      // Optional: Show toast for speaker changes (can be disabled if too frequent)
      // showToast('default', 'Active Speaker', `${speakerName} is speaking`);
    }
  }, [activeSpeaker, participants, speakerDetectionSupported]);

  // Connection quality monitoring
  useEffect(() => {
    qualityMetrics.forEach((metric, participantId) => {
      if (metric.status === "poor") {
        const participantName =
          participants.get(participantId) ||
          `User ${participantId.substr(0, 4)}`;
        showToast(
          "warning",
          "Poor connection",
          `${participantName} has connection issues`
        );
      }
    });
  }, [qualityMetrics, participants]);

  // Cleanup video streams on unmount and page changes
  useEffect(() => {
    return () => {
      cleanupVideoStreams();
    };
  }, [cleanupVideoStreams]);

  // Cleanup streams when participants leave
  useEffect(() => {
    const currentVideoIds = videos.map((v) => v.socketId);

    // Clean up streams for participants who left
    videoLoadingStates.forEach((_, socketId) => {
      if (!currentVideoIds.includes(socketId)) {
        setVideoLoadingStates((prev) => {
          const newMap = new Map(prev);
          newMap.delete(socketId);
          return newMap;
        });
        setVideoErrors((prev) => {
          const newMap = new Map(prev);
          newMap.delete(socketId);
          return newMap;
        });
        setConnectionQualities((prev) => {
          const newMap = new Map(prev);
          newMap.delete(socketId);
          return newMap;
        });
      }
    });
  }, [videos]);

  // Initialize video loading states when videos change
  useEffect(() => {
    videos.forEach((video) => {
      if (!videoLoadingStates.has(video.socketId)) {
        setVideoLoading(video.socketId, true);
      }
    });
  }, [videos]);

  // Cleanup off-screen video resources for performance
  useEffect(() => {
    const currentVideoIds = new Set(currentVideos.map((v) => v.socketId));

    // Clean up loading states for videos not currently visible
    videoLoadingStates.forEach((_, socketId) => {
      if (!currentVideoIds.has(socketId)) {
        // Keep the state but could implement lazy cleanup here
      }
    });
  }, [currentVideos, videoLoadingStates]);

  // Keyboard navigation for pagination
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (videos.length > videosPerPage) {
        if (event.key === "ArrowLeft" && currentPage > 0) {
          previousPage();
        } else if (event.key === "ArrowRight" && currentPage < totalPages - 1) {
          nextPage();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, videos.length]);

  // Meeting controls for FloatingDock
  const meetingControls = [
    {
      title: video ? "Turn Off Camera" : "Turn On Camera",
      icon: video ? <VideoCallRoundedIcon /> : <VideoCallOutlinedIcon />,
      onClick: handleVideo,
      color: video ? "#4ade80" : "#6b7280",
    },
    {
      title: audio ? "Mute" : "Unmute",
      icon: audio ? <MicRoundedIcon /> : <MicOffRoundedIcon />,
      onClick: handleAudio,
      color: audio ? "#4ade80" : "#ef4444",
    },
    {
      title: screen ? "Stop Sharing" : "Share Screen",
      icon: screen ? (
        <StopScreenShareRoundedIcon />
      ) : (
        <PresentToAllRoundedIcon />
      ),
      onClick: handleScreen,
      color: screen ? "#f59e0b" : "#3b82f6",
    },
    {
      title: "Chat",
      icon:
        newMessages > 0 ? (
          <Badge badgeContent={newMessages} color="error">
            <ChatBubbleRoundedIcon />
          </Badge>
        ) : (
          <ChatBubbleRoundedIcon />
        ),
      onClick: openChat,
      color: "#8b5cf6",
    },
    {
      title: "Invite Others",
      icon: <ShareIcon />,
      onClick: handleInvite,
      color: "#10b981",
    },
    {
      title: "Settings",
      icon: <SettingsIcon />,
      onClick: openSettingsPanel,
      color: "#64748b",
    },
    {
      title: "Debug",
      icon: <BugReportIcon />,
      onClick: openDebugPanel,
      color: "#f97316",
    },
    {
      title: "End Call",
      icon: <CallEndRoundedIcon />,
      onClick: handleEndCall,
      color: "#ef4444",
    },
  ];

  // Meeting room specific toast styling
  const MeetingToastStyles = `
    .meeting-toast-compact {
      max-width: 280px !important;
      font-size: 0.85rem !important;
      padding: 8px 12px !important;
    }
    
    .meeting-toast-compact [data-title] {
      font-size: 0.9rem !important;
      font-weight: 600 !important;
      margin-bottom: 2px !important;
    }
    
    .meeting-toast-compact [data-description] {
      font-size: 0.8rem !important;
      opacity: 0.9 !important;
    }
  `;

  // Inject styles for meeting room toasts
  if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = MeetingToastStyles;
    document.head.appendChild(styleSheet);
  }

  // Optimized video ref callback to prevent unnecessary re-renders
  // Enhanced Video Stream Management Functions
  const setVideoRef = useCallback(
    (videoElement, stream, socketId) => {
      if (videoElement && stream && videoElement.srcObject !== stream) {
        // Cleanup old stream if exists
        if (videoElement.srcObject) {
          const oldStream = videoElement.srcObject;
          oldStream.getTracks().forEach((track) => {
            console.log("Stopping old track:", track.kind);
            track.stop();
          });
        }

        videoElement.srcObject = stream;
        console.log(
          "Video element stream set:",
          stream.id,
          "for socket:",
          socketId
        );

        // Add error handling for video element
        videoElement.onerror = (e) => {
          console.error("Video element error:", e);
          if (socketId) {
            handleVideoError(socketId);
          }
        };
      }
    },
    [handleVideoError]
  );

  return (
    <StyledBox>
      {/* Main Viewport Container - Everything shifts together */}
      <motion.div
        animate={{
          marginRight: showModal && !isMobile ? "380px" : "0px",
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          },
        }}
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
        }}
      >
        {/* Blurry Blob Background - Inside viewport so it moves with everything */}
        <BlurryBlob
          firstBlobColor="#667eea"
          secondBlobColor="#764ba2"
          thirdBlobColor="#60a5fa"
          intensity="high"
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100vw",
            height: "100vh",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />
        {/* Main Meeting Content Container */}
        <div
          style={{
            position: "relative",
            zIndex: 100,
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            paddingTop: "80px",
            isolation: "isolate",
          }}
        >
          {/* Pagination Controls - Moved to Top */}
          {videos.length > videosPerPage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
                margin: "0 20px 20px 20px", // Removed top margin, keeping bottom and sides
                padding: "12px 20px",
                background: "rgba(0, 0, 0, 0.7)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(102, 126, 234, 0.5)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                zIndex: 10,
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={previousPage}
                disabled={currentPage === 0}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background:
                    currentPage === 0
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(102, 126, 234, 0.2)",
                  color:
                    currentPage === 0 ? "rgba(255, 255, 255, 0.4)" : "white",
                  cursor: currentPage === 0 ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ← Previous
              </motion.button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "600",
                    padding: "0 12px",
                    opacity: 0.9,
                  }}
                >
                  Page {currentPage + 1} of {Math.max(totalPages, 1)}
                </span>
                <div
                  style={{
                    width: "1px",
                    height: "16px",
                    background: "rgba(255, 255, 255, 0.2)",
                  }}
                />
                <span
                  style={{
                    color: "#667eea",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {videos.length} participants
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextPage}
                disabled={currentPage >= totalPages - 1}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background:
                    currentPage >= totalPages - 1
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(102, 126, 234, 0.2)",
                  color:
                    currentPage >= totalPages - 1
                      ? "rgba(255, 255, 255, 0.4)"
                      : "white",
                  cursor:
                    currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Next →
              </motion.button>
            </motion.div>
          )}

          {/* Username Entry Modal - Better positioned overlay */}
          {askUsername === true ? (
            <div
              style={{
                position: "fixed",
                top: "0",
                left: "0",
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(10px)",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  padding: "40px",
                  borderRadius: "16px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  textAlign: "center",
                  minWidth: "400px",
                }}
              >
                <h2
                  style={{
                    marginBottom: "24px",
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#1f2937",
                  }}
                >
                  Enter into Lobby
                </h2>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "24px",
                  }}
                >
                  <TextField
                    id="outlined-basic"
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    variant="outlined"
                    sx={{ minWidth: "200px" }}
                  />
                  <Button
                    variant="contained"
                    onClick={connect}
                    sx={{
                      height: "56px",
                      px: 3,
                      backgroundColor: "#667eea",
                      "&:hover": {
                        backgroundColor: "#5a67d8",
                      },
                    }}
                  >
                    Connect
                  </Button>
                </div>

                {/* Preview video in modal */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <StyledBox2
                    style={{
                      margin: 0,
                      width: "300px",
                      height: "auto",
                    }}
                  >
                    <video
                      ref={chatVideoRef}
                      autoPlay
                      muted
                      style={{
                        borderRadius: "12px",
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        border: "1px solid hsla(220, 25%, 80%, 0.2)",
                      }}
                    />
                  </StyledBox2>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Modal - Perfectly Centered with Equal Top/Bottom Spacing */}
              <motion.div
                initial={{
                  x: isMobile ? 0 : 400,
                  y: isMobile ? 500 : 0,
                  opacity: 0,
                }}
                animate={{
                  x: showModal ? 0 : isMobile ? 0 : 400,
                  y: showModal ? 0 : isMobile ? 500 : 0,
                  opacity: showModal ? 1 : 0,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass: 0.6,
                    duration: 0.4,
                  },
                }}
                style={{
                  position: "fixed",
                  top: isMobile ? "auto" : "15vh", // Equal spacing from top and bottom
                  bottom: isMobile ? "20px" : "15vh", // Equal spacing
                  right: "20px",
                  left: isMobile ? "20px" : "auto",
                  transform: "none", // Remove transform for precise positioning
                  width: isMobile ? "auto" : "350px",
                  height: isMobile ? "50vh" : "70vh", // 70vh with 15vh top/bottom = equal spacing
                  zIndex: 999,
                  pointerEvents: showModal ? "auto" : "none",
                }}
              >
                <ChatOverlay
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h1 style={{ margin: 0 }}>Chat</h1>
                    <IconButton
                      onClick={() => setModal(false)}
                      size="small"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": {
                          color: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      marginBottom: "16px",
                      padding: "8px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {messages.length !== 0 ? (
                      messages.map((item, index) => (
                        <div
                          style={{
                            marginBottom: "12px",
                            padding: "8px 12px",
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "8px",
                            borderLeft: "3px solid #667eea",
                          }}
                          key={index}
                        >
                          <p
                            style={{
                              fontWeight: "600",
                              color: "#667eea",
                              fontSize: "0.875rem",
                              marginBottom: "4px",
                            }}
                          >
                            {item.sender}
                          </p>
                          <p
                            style={{
                              color: "white",
                              fontSize: "0.95rem",
                              lineHeight: "1.4",
                              margin: "0",
                            }}
                          >
                            {item.data}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p
                        style={{
                          color: "rgba(255, 255, 255, 0.5)",
                          textAlign: "center",
                          fontStyle: "italic",
                          margin: "20px 0",
                        }}
                      >
                        No messages yet. Start the conversation!
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <TextField
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type your message..."
                      multiline
                      maxRows={3}
                      size="small"
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                        },
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      variant="contained"
                      size="small"
                      disabled={!newMessage.trim()}
                      sx={{
                        minWidth: "60px",
                        backgroundColor: "#667eea",
                        "&:hover": {
                          backgroundColor: "#5a67d8",
                        },
                      }}
                    >
                      Send
                    </Button>
                  </div>
                </ChatOverlay>
              </motion.div>

              {/* Settings Panel */}
              <motion.div
                initial={{ opacity: 0, x: 400 }}
                animate={{
                  x: showSettingsPanel ? 0 : 400,
                  opacity: showSettingsPanel ? 1 : 0,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass: 0.6,
                    duration: 0.4,
                  },
                }}
                style={{
                  position: "fixed",
                  top: isMobile ? "auto" : "15vh",
                  bottom: isMobile ? "20px" : "15vh",
                  right: "20px",
                  left: isMobile ? "20px" : "auto",
                  transform: "none",
                  width: isMobile ? "auto" : "400px",
                  height: isMobile ? "60vh" : "80vh",
                  zIndex: 999,
                  pointerEvents: showSettingsPanel ? "auto" : "none",
                }}
              >
                <ChatOverlay
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h1 style={{ margin: 0 }}>Settings</h1>
                    <IconButton
                      onClick={closeAllPanels}
                      size="small"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": {
                          color: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "8px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {/* Device Selection Section */}
                    <div style={{ marginBottom: "24px" }}>
                      <h3 style={{ color: "#64748b", marginBottom: "16px" }}>
                        Device Selection
                      </h3>

                      {/* Camera Selection */}
                      <div style={{ marginBottom: "16px" }}>
                        <FormControl
                          fullWidth
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                              color: "white",
                            },
                            "& .MuiInputLabel-root": {
                              color: "rgba(255, 255, 255, 0.7)",
                            },
                            "& .MuiSelect-icon": {
                              color: "rgba(255, 255, 255, 0.7)",
                            },
                          }}
                        >
                          <InputLabel>Camera</InputLabel>
                          <Select
                            value={selectedVideoDevice}
                            label="Camera"
                            onChange={(e) => changeVideoDevice(e.target.value)}
                          >
                            {videoDevices.map((device) => (
                              <MenuItem
                                key={device.deviceId}
                                value={device.deviceId}
                              >
                                {device.label ||
                                  `Camera ${device.deviceId.substring(0, 8)}`}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>

                      {/* Microphone Selection */}
                      <div style={{ marginBottom: "16px" }}>
                        <FormControl
                          fullWidth
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                              color: "white",
                            },
                            "& .MuiInputLabel-root": {
                              color: "rgba(255, 255, 255, 0.7)",
                            },
                            "& .MuiSelect-icon": {
                              color: "rgba(255, 255, 255, 0.7)",
                            },
                          }}
                        >
                          <InputLabel>Microphone</InputLabel>
                          <Select
                            value={selectedAudioDevice}
                            label="Microphone"
                            onChange={(e) => changeAudioDevice(e.target.value)}
                          >
                            {audioDevices.map((device) => (
                              <MenuItem
                                key={device.deviceId}
                                value={device.deviceId}
                              >
                                {device.label ||
                                  `Microphone ${device.deviceId.substring(
                                    0,
                                    8
                                  )}`}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>

                      {/* Speaker Selection */}
                      <div style={{ marginBottom: "16px" }}>
                        <FormControl
                          fullWidth
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                              color: "white",
                            },
                            "& .MuiInputLabel-root": {
                              color: "rgba(255, 255, 255, 0.7)",
                            },
                            "& .MuiSelect-icon": {
                              color: "rgba(255, 255, 255, 0.7)",
                            },
                          }}
                        >
                          <InputLabel>Speaker</InputLabel>
                          <Select
                            value={selectedSpeakerDevice}
                            label="Speaker"
                            onChange={(e) =>
                              setSelectedSpeakerDevice(e.target.value)
                            }
                          >
                            {speakerDevices.map((device) => (
                              <MenuItem
                                key={device.deviceId}
                                value={device.deviceId}
                              >
                                {device.label ||
                                  `Speaker ${device.deviceId.substring(0, 8)}`}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>

                    {/* Device Testing Section */}
                    <div style={{ marginBottom: "24px" }}>
                      <h3 style={{ color: "#64748b", marginBottom: "16px" }}>
                        Test Devices
                      </h3>

                      {/* Microphone Test */}
                      <div
                        style={{
                          marginBottom: "16px",
                          padding: "12px",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <span style={{ color: "white", fontWeight: "500" }}>
                            Microphone Test
                          </span>
                          <Button
                            onClick={testMicrophone}
                            disabled={isTestingMic}
                            size="small"
                            variant="outlined"
                            sx={{
                              color: "#64748b",
                              borderColor: "#64748b",
                              "&:hover": {
                                borderColor: "#64748b",
                                backgroundColor: "rgba(100, 116, 139, 0.1)",
                              },
                            }}
                          >
                            {isTestingMic ? "Testing..." : "Test"}
                          </Button>
                        </div>
                        {isTestingMic && (
                          <div>
                            <p
                              style={{
                                color: "rgba(255, 255, 255, 0.7)",
                                fontSize: "0.85rem",
                                margin: "4px 0",
                              }}
                            >
                              Speak into your microphone
                            </p>
                            <LinearProgress
                              variant="determinate"
                              value={micTestLevel * 2}
                              sx={{
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor:
                                    micTestLevel > 30 ? "#10b981" : "#64748b",
                                },
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Speaker Test */}
                      <div
                        style={{
                          marginBottom: "16px",
                          padding: "12px",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ color: "white", fontWeight: "500" }}>
                            Speaker Test
                          </span>
                          <Button
                            onClick={testSpeaker}
                            disabled={isTestingSpeaker}
                            size="small"
                            variant="outlined"
                            sx={{
                              color: "#64748b",
                              borderColor: "#64748b",
                              "&:hover": {
                                borderColor: "#64748b",
                                backgroundColor: "rgba(100, 116, 139, 0.1)",
                              },
                            }}
                          >
                            {isTestingSpeaker ? "Playing..." : "Test"}
                          </Button>
                        </div>
                        {isTestingSpeaker && (
                          <p
                            style={{
                              color: "rgba(255, 255, 255, 0.7)",
                              fontSize: "0.85rem",
                              margin: "4px 0",
                            }}
                          >
                            You should hear a test tone
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Audio & Video Controls */}
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ color: "#64748b", marginBottom: "12px" }}>
                        Audio & Video
                      </h3>
                      <div style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                            padding: "8px 12px",
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "6px",
                          }}
                        >
                          <span style={{ color: "white" }}>Microphone</span>
                          <Switch
                            checked={audioAvailable}
                            onChange={(e) =>
                              setAudioAvailable(e.target.checked)
                            }
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: "#64748b",
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                {
                                  backgroundColor: "#64748b",
                                },
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                            padding: "8px 12px",
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "6px",
                          }}
                        >
                          <span style={{ color: "white" }}>Camera</span>
                          <Switch
                            checked={videoAvailable}
                            onChange={(e) =>
                              setVideoAvailable(e.target.checked)
                            }
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: "#64748b",
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                {
                                  backgroundColor: "#64748b",
                                },
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meeting Preferences */}
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ color: "#64748b", marginBottom: "12px" }}>
                        Meeting Preferences
                      </h3>
                      <div style={{ marginBottom: "12px" }}>
                        <TextField
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          label="Display Name"
                          size="small"
                          fullWidth
                          sx={{
                            marginBottom: "12px",
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                            },
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "6px",
                        }}
                      >
                        <span style={{ color: "white" }}>
                          Join with muted mic
                        </span>
                        <Switch
                          defaultChecked={false}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "#64748b",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              {
                                backgroundColor: "#64748b",
                              },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </ChatOverlay>
              </motion.div>

              {/* Debug Panel */}
              <motion.div
                initial={{ opacity: 0, x: 400 }}
                animate={{
                  x: showDebugPanel ? 0 : 400,
                  opacity: showDebugPanel ? 1 : 0,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass: 0.6,
                    duration: 0.4,
                  },
                }}
                style={{
                  position: "fixed",
                  top: isMobile ? "auto" : "15vh",
                  bottom: isMobile ? "20px" : "15vh",
                  right: "20px",
                  left: isMobile ? "20px" : "auto",
                  transform: "none",
                  width: isMobile ? "auto" : "350px",
                  height: isMobile ? "50vh" : "70vh",
                  zIndex: 999,
                  pointerEvents: showDebugPanel ? "auto" : "none",
                }}
              >
                <ChatOverlay
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h1 style={{ margin: 0 }}>Debug Info</h1>
                    <IconButton
                      onClick={closeAllPanels}
                      size="small"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": {
                          color: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "8px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ color: "#f97316", marginBottom: "12px" }}>
                        Connection Status
                      </h3>
                      <div
                        style={{
                          backgroundColor: "rgba(249, 115, 22, 0.1)",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(249, 115, 22, 0.3)",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                            Status:
                          </span>
                          <span style={{ color: "#10b981", fontWeight: "500" }}>
                            Connected
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                            Socket ID:
                          </span>
                          <span
                            style={{
                              color: "white",
                              fontFamily: "monospace",
                              fontSize: "0.8rem",
                            }}
                          >
                            {socketIdRef.current || "Not connected"}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                            Participants:
                          </span>
                          <span style={{ color: "white" }}>
                            {videos.length + 1}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                            Room:
                          </span>
                          <span style={{ color: "white" }}>
                            {state.user.meetingRoom || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ color: "#f97316", marginBottom: "12px" }}>
                        Media Stats
                      </h3>
                      <div style={{ fontSize: "0.9rem" }}>
                        <div
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            marginBottom: "8px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                            }}
                          >
                            <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                              Video Quality:
                            </span>
                            <span style={{ color: "#10b981" }}>HD</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                            }}
                          >
                            <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                              Audio Bitrate:
                            </span>
                            <span style={{ color: "white" }}>64 kbps</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                              Video Bitrate:
                            </span>
                            <span style={{ color: "white" }}>1.2 Mbps</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ color: "#f97316", marginBottom: "12px" }}>
                        Browser Info
                      </h3>
                      <div style={{ fontSize: "0.9rem" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                            User Agent:
                          </span>
                          <span style={{ color: "white", fontSize: "0.8rem" }}>
                            {navigator.userAgent.substring(0, 30)}...
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                            WebRTC Support:
                          </span>
                          <span style={{ color: "#10b981" }}>Yes</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                            Screen Share:
                          </span>
                          <span
                            style={{
                              color: screenAvailable ? "#10b981" : "#ef4444",
                            }}
                          >
                            {screenAvailable ? "Available" : "Not Available"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ChatOverlay>
              </motion.div>

              {/* Main Video Card - Enhanced Responsive to Chat State with Better Spacing */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 },
                  },
                }}
                style={{
                  position: "relative",
                  height: "calc(100vh - 200px)",
                  margin: "20px",
                  marginBottom: "150px",
                  zIndex: 1, // Ensure video content is above footer
                }}
              >
                {/* Enhanced Participants Video Grid with 4x2 Layout and Pagination */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    padding: "20px",
                  }}
                >
                  {/* Video Grid Container - Responsive 4x2 Layout */}
                  <div
                    style={{
                      flex: 1,
                      display: "grid",
                      gridTemplateColumns:
                        currentVideos.length === 1
                          ? "1fr"
                          : currentVideos.length === 2
                          ? "1fr 1fr"
                          : currentVideos.length <= 4
                          ? "1fr 1fr 1fr 1fr"
                          : isMobile
                          ? "1fr 1fr"
                          : "1fr 1fr 1fr 1fr", // Mobile: 2 columns, Desktop: 4 columns
                      gridTemplateRows:
                        currentVideos.length === 1
                          ? "1fr"
                          : currentVideos.length === 2
                          ? "1fr"
                          : currentVideos.length <= 4
                          ? "1fr"
                          : isMobile
                          ? "1fr 1fr 1fr 1fr"
                          : "1fr 1fr", // 4x2 grid
                      gap: isMobile ? "8px" : "12px",
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyItems: "center",
                    }}
                  >
                    {currentVideos.length === 0 ? (
                      // Show MeetEase text when no participants
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{
                          gridColumn: "1 / -1",
                          gridRow: "1 / -1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <TextHoverEffect text="MEETEASE" duration={0.1} />
                      </motion.div>
                    ) : (
                      // Enhanced participant videos with loading states and better interactions
                      currentVideos.map((video, index) => {
                        const participantName =
                          participants.get(video.socketId) ||
                          video.name ||
                          `User ${video.socketId.substr(0, 4)}`;
                        const isActiveSpeaker =
                          activeSpeaker === video.socketId;
                        const isLoading =
                          videoLoadingStates.get(video.socketId) || false;
                        const hasError =
                          videoErrors.get(video.socketId) || false;
                        const quality =
                          connectionQualities.get(video.socketId) || "good";

                        return (
                          <motion.div
                            key={`participant-${video.socketId}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{
                              scale: 1.02,
                              transition: { duration: 0.2, ease: "easeOut" },
                            }}
                            transition={{ duration: 0.3 }}
                            style={{
                              position: "relative",
                              width: "100%",
                              height: "100%",
                              minHeight: isMobile ? "100px" : "120px",
                              maxHeight:
                                currentVideos.length === 1
                                  ? "400px"
                                  : isMobile
                                  ? "150px"
                                  : "200px",
                              borderRadius: "12px",
                              overflow: "hidden",
                              border: isActiveSpeaker
                                ? "3px solid #667eea"
                                : "2px solid rgba(255, 255, 255, 0.2)",
                              boxShadow: isActiveSpeaker
                                ? "0 0 20px rgba(102, 126, 234, 0.5)"
                                : "0 4px 12px rgba(0, 0, 0, 0.3)",
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                              background: "rgba(0, 0, 0, 0.8)",
                            }}
                            onClick={() =>
                              handleParticipantClick(video.socketId)
                            }
                          >
                            {/* Loading Overlay */}
                            {isLoading && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background: "rgba(0, 0, 0, 0.7)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: 10,
                                  backdropFilter: "blur(2px)",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <LoaderOne size="medium" color="#667eea" />
                                  <span
                                    style={{
                                      color: "white",
                                      fontSize: "12px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    Loading video...
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Error Overlay */}
                            {hasError && !isLoading && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background: "rgba(0, 0, 0, 0.8)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: 10,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "16px",
                                    textAlign: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "50%",
                                      background: "rgba(239, 68, 68, 0.2)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: "#ef4444",
                                        fontSize: "20px",
                                      }}
                                    >
                                      ⚠
                                    </span>
                                  </div>
                                  <span
                                    style={{
                                      color: "white",
                                      fontSize: "12px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    Video unavailable
                                  </span>
                                </div>
                              </div>
                            )}

                            <video
                              key={`video-${video.socketId}`}
                              data-socket={video.socketId}
                              ref={(ref) =>
                                setVideoRef(ref, video.stream, video.socketId)
                              }
                              autoPlay
                              playsInline
                              muted={false}
                              onLoadStart={() =>
                                setVideoLoading(video.socketId, true)
                              }
                              onLoadedData={() =>
                                handleVideoLoad(video.socketId)
                              }
                              onError={() => handleVideoError(video.socketId)}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                backgroundColor: "rgba(0, 0, 0, 0.8)",
                              }}
                            />

                            {/* Connection Quality Indicator */}
                            <div
                              style={{
                                position: "absolute",
                                top: "8px",
                                left: "8px",
                                background: "rgba(0, 0, 0, 0.7)",
                                borderRadius: "4px",
                                padding: "2px 6px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <div
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background:
                                    quality === "good"
                                      ? "#10b981"
                                      : quality === "medium"
                                      ? "#f59e0b"
                                      : "#ef4444",
                                }}
                              />
                              <span
                                style={{
                                  color: "white",
                                  fontSize: "9px",
                                  fontWeight: "500",
                                  textTransform: "uppercase",
                                }}
                              >
                                {quality}
                              </span>
                            </div>

                            {/* Enhanced Participant Name Overlay with Better Design */}
                            <div
                              style={{
                                position: "absolute",
                                bottom: "8px",
                                left: "8px",
                                right: "8px",
                                background: isActiveSpeaker
                                  ? "linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9))"
                                  : "rgba(0, 0, 0, 0.8)",
                                color: "white",
                                padding: "8px 12px",
                                borderRadius: "10px",
                                fontSize: "11px",
                                fontWeight: "600",
                                textAlign: "center",
                                backdropFilter: "blur(15px)",
                                border: isActiveSpeaker
                                  ? "2px solid rgba(102, 126, 234, 0.5)"
                                  : "1px solid rgba(255, 255, 255, 0.1)",
                                boxShadow: isActiveSpeaker
                                  ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                                  : "0 2px 8px rgba(0, 0, 0, 0.3)",
                                transform: isActiveSpeaker
                                  ? "scale(1.02)"
                                  : "scale(1)",
                                transition: "all 0.3s ease",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px",
                                }}
                              >
                                {isActiveSpeaker && (
                                  <motion.div
                                    animate={{
                                      scale: [1, 1.2, 1],
                                      opacity: [0.7, 1, 0.7],
                                    }}
                                    transition={{
                                      duration: 1,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                    }}
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      background: "#10b981",
                                    }}
                                  />
                                )}
                                <span style={{ flex: 1 }}>
                                  {participantName}
                                </span>
                                {isActiveSpeaker && (
                                  <motion.span
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{
                                      duration: 0.8,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                    }}
                                    style={{
                                      fontSize: "10px",
                                      color: "#10b981",
                                    }}
                                  >
                                    🎤
                                  </motion.span>
                                )}
                              </div>
                            </div>
                            {/* Audio/Video Status Indicators */}
                            <div
                              style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                display: "flex",
                                gap: "4px",
                              }}
                            >
                              {!audioAvailable && (
                                <div
                                  style={{
                                    background: "rgba(239, 68, 68, 0.9)",
                                    borderRadius: "50%",
                                    padding: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <MicOffIcon
                                    style={{ fontSize: "14px", color: "white" }}
                                  />
                                </div>
                              )}
                              {!videoAvailable && (
                                <div
                                  style={{
                                    background: "rgba(239, 68, 68, 0.9)",
                                    borderRadius: "50%",
                                    padding: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <VideocamOffIcon
                                    style={{ fontSize: "14px", color: "white" }}
                                  />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {/* Page Indicator Dots */}
                  {videos.length > videosPerPage && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "6px",
                        marginTop: "12px",
                      }}
                    >
                      {Array.from({ length: totalPages }, (_, index) => (
                        <button
                          key={index}
                          onClick={() => goToPage(index)}
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            border: "none",
                            background:
                              index === currentPage
                                ? "rgba(102, 126, 234, 0.8)"
                                : "rgba(255, 255, 255, 0.3)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Your Video - Bottom Right Corner - Responsive to Chat */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    right: showModal ? "30px" : "20px", // Adjust position when chat is open
                    transition: {
                      right: {
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        mass: 0.6,
                      },
                    },
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    width: "200px",
                    height: "150px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 100,
                  }}
                >
                  <video
                    ref={localvideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                  />

                  {/* Your Name Label */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "6px",
                      left: "6px",
                      right: "6px",
                      background: "rgba(0, 0, 0, 0.8)",
                      color: "white",
                      padding: "3px 6px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "500",
                      textAlign: "center",
                    }}
                  >
                    You ({username})
                  </div>

                  {/* Your Audio/Video Status */}
                  <div
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      display: "flex",
                      gap: "3px",
                    }}
                  >
                    {!audioAvailable && (
                      <div
                        style={{
                          background: "rgba(239, 68, 68, 0.9)",
                          borderRadius: "50%",
                          padding: "3px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MicOffIcon
                          style={{ fontSize: "12px", color: "white" }}
                        />
                      </div>
                    )}
                    {!videoAvailable && (
                      <div
                        style={{
                          background: "rgba(239, 68, 68, 0.9)",
                          borderRadius: "50%",
                          padding: "3px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <VideocamOffIcon
                          style={{ fontSize: "12px", color: "white" }}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Enhanced Floating Dock Controls with Gradient Border - Fixed Centering */}
              <div
                style={{
                  position: "fixed",
                  bottom: "20px",
                  left: "50%",
                  zIndex: 1000,
                  transform: "translateX(-50%)",
                }}
              >
                <motion.div
                  ref={dockRef}
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(102, 126, 234, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                      "0 0 25px rgba(102, 126, 234, 0.4), 0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                      "0 0 20px rgba(102, 126, 234, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    boxShadow:
                      "0 0 35px rgba(102, 126, 234, 0.6), 0 25px 50px -12px rgba(0, 0, 0, 0.6)",
                    scale: 1.005,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      mass: 0.5,
                    },
                  }}
                  style={{
                    padding: "2px",
                    borderRadius: "18px",
                    background:
                      "linear-gradient(45deg, rgba(102, 126, 234, 0.4), rgba(118, 75, 162, 0.4), rgba(96, 165, 250, 0.4))",
                    boxShadow:
                      "0 0 20px rgba(102, 126, 234, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <div
                    style={{
                      borderRadius: "16px",
                      background: "rgba(0, 0, 0, 0.85)",
                      backdropFilter: "blur(20px)",
                      padding: "2px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      position: "relative",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <FloatingDock
                      items={meetingControls}
                      desktopClassName="bg-transparent backdrop-blur-0 border-0 rounded-2xl shadow-none !justify-center !gap-3"
                      mobileClassName="bg-transparent backdrop-blur-0 border-0 rounded-2xl shadow-none !justify-center !gap-3"
                    />
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>{" "}
        {/* Close main content container */}
      </motion.div>{" "}
      {/* Close main viewport container */}
    </StyledBox>
  );
}
