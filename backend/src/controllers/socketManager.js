// socketManager.js - Enhanced for 50-participant video meetings
import { Server } from "socket.io"

let connections = {}
let messages = {}
let timeOnline = {}
let usernames = {} // Store usernames for each socket
let participantMetadata = {} // Store participant metadata (audio/video status, connection quality)
let meetingStats = {} // Store meeting statistics

// Configuration constants
const MAX_PARTICIPANTS_PER_ROOM = 50;
const CONNECTION_QUALITY_LEVELS = ['poor', 'fair', 'good', 'excellent'];

// Helper function to get room participants with metadata
const getRoomParticipants = (roomKey) => {
    if (!connections[roomKey]) return [];
    
    return connections[roomKey].map(socketId => ({
        socketId,
        username: usernames[socketId] || 'Anonymous',
        joinTime: timeOnline[socketId]?.toISOString(),
        audioEnabled: participantMetadata[socketId]?.audioEnabled || false,
        videoEnabled: participantMetadata[socketId]?.videoEnabled || false,
        connectionQuality: participantMetadata[socketId]?.connectionQuality || 'good',
        lastUpdated: participantMetadata[socketId]?.lastUpdated
    }));
};

// Helper function to broadcast room statistics
const broadcastRoomStats = (io, roomKey) => {
    if (!connections[roomKey]) return;
    
    const participants = getRoomParticipants(roomKey);
    const roomStats = {
        roomId: roomKey,
        participantCount: participants.length,
        maxParticipants: MAX_PARTICIPANTS_PER_ROOM,
        participants: participants,
        messageCount: messages[roomKey] ? messages[roomKey].length : 0,
        meetingStartTime: meetingStats[roomKey]?.startTime,
        lastUpdated: new Date().toISOString()
    };
    
    connections[roomKey].forEach(socketId => {
        io.to(socketId).emit('room-stats-update', roomStats);
    });
};

export const connecttosocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("PARTICIPANT CONNECTED:", socket.id)

        socket.on("join-call", (path, username = 'Anonymous', userData = {}) => {
            try {
                // Store the username and additional data for this socket
                usernames[socket.id] = username;
                participantMetadata[socket.id] = {
                    audioEnabled: userData.audioEnabled !== false,
                    videoEnabled: userData.videoEnabled !== false,
                    connectionQuality: 'good',
                    lastUpdated: new Date().toISOString(),
                    ...userData
                };
                
                if (connections[path] === undefined) {
                    connections[path] = [];
                    meetingStats[path] = { startTime: Date.now(), messages: 0 };
                }
                
                // Check participant limit (50 participants max)
                if (connections[path].length >= 50) {
                    socket.emit("meeting-full", {
                        message: "Meeting room is full. Maximum 50 participants allowed.",
                        currentCount: connections[path].length
                    });
                    return;
                }
                
                connections[path].push(socket.id);
                timeOnline[socket.id] = new Date();

                // Get all participants data for this room
                const roomParticipants = getRoomParticipants(path);

                // Notify all participants about the new user
                for (let a = 0; a < connections[path].length; a++) {
                    io.to(connections[path][a]).emit("user-joined", socket.id, connections[path], username);
                }

                // Send enhanced participant data separately for components that need it
                for (let a = 0; a < connections[path].length; a++) {
                    io.to(connections[path][a]).emit("participant-joined", {
                        participants: roomParticipants,
                        newParticipant: {
                            socketId: socket.id,
                            username,
                            ...participantMetadata[socket.id]
                        }
                    });
                }

                // Send existing messages to new participant
                if (messages[path] !== undefined) {
                    for (let a = 0; a < messages[path].length; ++a) {
                        io.to(socket.id).emit("chat-message", 
                            messages[path][a]['data'],
                            messages[path][a]['sender'], 
                            messages[path][a]['socket-id-sender'],
                            messages[path][a]['timestamp']
                        );
                    }
                }

                // Broadcast updated room statistics
                broadcastRoomStats(io, path);

                console.log(`${username} joined room ${path}. Total participants: ${connections[path].length}`);
            } catch (error) {
                console.error("Error in join-call:", error);
                socket.emit("join-error", { message: "Failed to join the meeting" });
            }
        });

        socket.on("signal", (toId, message) => {
            try {
                // Enhanced WebRTC signaling with error checking
                if (!toId) {
                    socket.emit("signal-error", { message: "Invalid recipient ID" });
                    return;
                }

                // Check if recipient is still connected
                const recipientConnected = Object.values(connections).some(room => 
                    room.includes(toId)
                );

                if (!recipientConnected) {
                    socket.emit("signal-error", { 
                        message: "Recipient no longer connected",
                        recipientId: toId 
                    });
                    return;
                }

                io.to(toId).emit("signal", socket.id, message);
                console.log(`Signal sent from ${socket.id} to ${toId}`);
            } catch (error) {
                console.error("Error in signal handler:", error);
                socket.emit("signal-error", { message: "Failed to send signal" });
            }
        })

        socket.on("chat-message", (data, sender) => {
            try {
                const [matchingRoom, found] = Object.entries(connections)
                    .reduce(([room, isFound], [roomKey, roomValue]) => {
                        if (!isFound && roomValue.includes(socket.id)) {
                            return [roomKey, true];
                        }
                        return [room, isFound];
                    }, ['', false]);

                if (!found) {
                    socket.emit("chat-error", { message: "You are not in any meeting room" });
                    return;
                }

                if (!data || !sender) {
                    socket.emit("chat-error", { message: "Invalid message data" });
                    return;
                }

                // Initialize messages array for room if needed
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }

                // Add timestamp to message
                const messageData = {
                    'sender': sender,
                    "data": data,
                    "socket-id-sender": socket.id,
                    "timestamp": new Date().toISOString()
                };

                messages[matchingRoom].push(messageData);
                console.log("Chat message in", matchingRoom, ":", sender, data);

                // Broadcast to all participants in the room
                connections[matchingRoom].forEach((participantId) => {
                    io.to(participantId).emit("chat-message", data, sender, socket.id, messageData.timestamp);
                });

                // Update room statistics
                broadcastRoomStats(io, matchingRoom);
            } catch (error) {
                console.error("Error in chat-message handler:", error);
                socket.emit("chat-error", { message: "Failed to send message" });
            }
        })

        socket.on("disconnect", () => {
            try {
                const disconnectTime = new Date();
                const sessionDuration = timeOnline[socket.id] ? 
                    Math.abs(disconnectTime - timeOnline[socket.id]) : 0;
                
                console.log(`User ${socket.id} disconnected after ${Math.floor(sessionDuration / 1000)} seconds`);

                let roomKey = null;
                const username = usernames[socket.id] || "Unknown User";

                // Find and remove user from their room
                for (const [k, v] of Object.entries(connections)) {
                    const userIndex = v.indexOf(socket.id);
                    if (userIndex !== -1) {
                        roomKey = k;

                        // Notify other participants about user leaving
                        connections[roomKey].forEach((participantId) => {
                            if (participantId !== socket.id) {
                                io.to(participantId).emit('user-left', socket.id, {
                                    username: username,
                                    timestamp: disconnectTime.toISOString(),
                                    sessionDuration: Math.floor(sessionDuration / 1000)
                                });
                            }
                        });

                        // Remove user from room
                        connections[roomKey].splice(userIndex, 1);

                        // Clean up empty rooms
                        if (connections[roomKey].length === 0) {
                            delete connections[roomKey];
                            delete messages[roomKey];
                            console.log(`Room ${roomKey} deleted - no participants remaining`);
                        } else {
                            // Broadcast updated room statistics
                            broadcastRoomStats(io, roomKey);
                            console.log(`${username} left room ${roomKey}. Remaining participants: ${connections[roomKey].length}`);
                        }
                        break;
                    }
                }

                // Clean up user data
                delete usernames[socket.id];
                delete timeOnline[socket.id];
                delete participantMetadata[socket.id];

            } catch (error) {
                console.error("Error in disconnect handler:", error);
            }
        })

        // Add participant status update handler
        socket.on("update-participant-status", (statusData) => {
            try {
                const { audioEnabled, videoEnabled, connectionQuality } = statusData;
                
                if (participantMetadata[socket.id]) {
                    participantMetadata[socket.id] = {
                        ...participantMetadata[socket.id],
                        audioEnabled: audioEnabled !== undefined ? audioEnabled : participantMetadata[socket.id].audioEnabled,
                        videoEnabled: videoEnabled !== undefined ? videoEnabled : participantMetadata[socket.id].videoEnabled,
                        connectionQuality: connectionQuality || participantMetadata[socket.id].connectionQuality,
                        lastUpdated: new Date().toISOString()
                    };

                    // Find user's room and broadcast update
                    for (const [roomKey, participants] of Object.entries(connections)) {
                        if (participants.includes(socket.id)) {
                            participants.forEach((participantId) => {
                                if (participantId !== socket.id) {
                                    io.to(participantId).emit('participant-status-update', {
                                        participantId: socket.id,
                                        username: usernames[socket.id],
                                        ...participantMetadata[socket.id]
                                    });
                                }
                            });
                            
                            // Broadcast updated room statistics
                            broadcastRoomStats(io, roomKey);
                            break;
                        }
                    }
                }
            } catch (error) {
                console.error("Error in update-participant-status handler:", error);
                socket.emit("status-update-error", { message: "Failed to update participant status" });
            }
        });

        // Add speaker detection handler
        socket.on("speaker-detection", (speakerData) => {
            try {
                const { isSpeaking, audioLevel } = speakerData;
                
                // Find user's room and broadcast speaker status
                for (const [roomKey, participants] of Object.entries(connections)) {
                    if (participants.includes(socket.id)) {
                        participants.forEach((participantId) => {
                            if (participantId !== socket.id) {
                                io.to(participantId).emit('speaker-update', {
                                    participantId: socket.id,
                                    username: usernames[socket.id],
                                    isSpeaking,
                                    audioLevel,
                                    timestamp: new Date().toISOString()
                                });
                            }
                        });
                        break;
                    }
                }
            } catch (error) {
                console.error("Error in speaker-detection handler:", error);
            }
        });
    })
    return io;
}