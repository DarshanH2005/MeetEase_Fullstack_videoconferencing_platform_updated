import React, { createContext, useContext, useReducer, useEffect } from "react";
import { getUserData, getAuthToken, isAuthenticated } from "../utils/auth";

// Initial state
const initialState = {
  user: {
    id: null,
    name: "",
    username: "",
    email: "",
    avatar: "",
    displayName: "",
    isGuest: true,
    isAuthenticated: false,
    preferences: {
      defaultMicMuted: false,
      defaultVideoOff: false,
      theme: "dark",
    },
  },
  meeting: {
    currentMeetingId: null,
    isInMeeting: false,
    participants: [],
  },
  ui: {
    isLoading: false,
    notifications: [],
  },
};

// Action types
export const ActionTypes = {
  SET_USER_DISPLAY_NAME: "SET_USER_DISPLAY_NAME",
  SET_AUTHENTICATED: "SET_AUTHENTICATED",
  SET_USER_DATA: "SET_USER_DATA",
  SET_GUEST_INFO: "SET_GUEST_INFO",
  LOGOUT_USER: "LOGOUT_USER",
  JOIN_MEETING: "JOIN_MEETING",
  START_MEETING: "START_MEETING",
  LEAVE_MEETING: "LEAVE_MEETING",
  SET_LOADING: "SET_LOADING",
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
  UPDATE_PARTICIPANTS: "UPDATE_PARTICIPANTS",
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USER_DISPLAY_NAME:
      return {
        ...state,
        user: {
          ...state.user,
          displayName: action.payload,
          name: action.payload, // Keep both for backward compatibility
        },
      };

    case ActionTypes.SET_AUTHENTICATED:
      return {
        ...state,
        user: {
          ...state.user,
          isAuthenticated: action.payload.isAuthenticated,
          isGuest: !action.payload.isAuthenticated,
        },
      };

    case ActionTypes.SET_USER_DATA:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
          displayName: action.payload.name || action.payload.displayName,
          isAuthenticated: true,
          isGuest: false,
        },
      };

    case ActionTypes.SET_GUEST_INFO:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
          isGuest: true,
          isAuthenticated: false,
        },
      };

    case ActionTypes.LOGOUT_USER:
      return {
        ...state,
        user: {
          id: null,
          name: "",
          username: "",
          email: "",
          avatar: "",
          displayName: "",
          isGuest: true,
          isAuthenticated: false,
          preferences: {
            defaultMicMuted: false,
            defaultVideoOff: false,
            theme: "dark",
          },
        },
        meeting: {
          currentMeetingId: null,
          isInMeeting: false,
          participants: [],
        },
      };

    case ActionTypes.JOIN_MEETING:
      return {
        ...state,
        meeting: {
          ...state.meeting,
          currentMeetingId: action.payload.meetingId,
          isInMeeting: true,
        },
      };

    case ActionTypes.START_MEETING:
      return {
        ...state,
        meeting: {
          ...state.meeting,
          currentMeetingId: action.payload.meetingId,
          isInMeeting: true,
        },
      };

    case ActionTypes.LEAVE_MEETING:
      return {
        ...state,
        meeting: {
          ...state.meeting,
          currentMeetingId: null,
          isInMeeting: false,
          participants: [],
        },
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload,
        },
      };

    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, action.payload],
        },
      };

    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(
            (notification) => notification.id !== action.payload
          ),
        },
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const userData = getUserData();
    const token = getAuthToken();

    if (userData && token && isAuthenticated()) {
      dispatch({
        type: ActionTypes.SET_USER_DATA,
        payload: userData,
      });
    } else {
      // Load display name for backward compatibility
      const savedDisplayName = localStorage.getItem("meetease_display_name");
      if (savedDisplayName) {
        dispatch({
          type: ActionTypes.SET_USER_DISPLAY_NAME,
          payload: savedDisplayName,
        });
      }
    }
  }, []);

  // Save display name to localStorage when it changes (backward compatibility)
  useEffect(() => {
    if (state.user.displayName && state.user.isGuest) {
      localStorage.setItem("meetease_display_name", state.user.displayName);
    }
  }, [state.user.displayName, state.user.isGuest]);

  // Action creators
  const actions = {
    setDisplayName: (name) => {
      dispatch({ type: ActionTypes.SET_USER_DISPLAY_NAME, payload: name });
    },

    setAuthenticated: (isAuthenticated) => {
      dispatch({
        type: ActionTypes.SET_AUTHENTICATED,
        payload: { isAuthenticated },
      });
    },

    setUserData: (userData) => {
      dispatch({ type: ActionTypes.SET_USER_DATA, payload: userData });
    },

    setGuestInfo: (guestInfo) => {
      dispatch({ type: ActionTypes.SET_GUEST_INFO, payload: guestInfo });
    },

    logoutUser: () => {
      dispatch({ type: ActionTypes.LOGOUT_USER });
    },

    joinMeeting: (meetingId) => {
      dispatch({
        type: ActionTypes.JOIN_MEETING,
        payload: { meetingId },
      });
    },

    startMeeting: (meetingId) => {
      dispatch({
        type: ActionTypes.START_MEETING,
        payload: { meetingId },
      });
    },

    leaveMeeting: () => {
      dispatch({ type: ActionTypes.LEAVE_MEETING });
    },

    setLoading: (isLoading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
    },

    addNotification: (notification) => {
      const id = Date.now().toString();
      dispatch({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: { id, ...notification },
      });
      return id;
    },

    showNotification: (message, type = "info", options = {}) => {
      const id = Date.now().toString();
      dispatch({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: { id, message, type, ...options },
      });
      return id;
    },

    removeNotification: (id) => {
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
    },

    updateParticipants: (participants) => {
      dispatch({
        type: ActionTypes.UPDATE_PARTICIPANTS,
        payload: participants,
      });
    },
  };

  return (
    <AppContext.Provider
      value={{
        state: {
          ...state,
          isAuthenticated: state.user.isAuthenticated, // Add direct access to auth status
        },
        actions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
