import { createContext, useContext, useState, useCallback } from "react";
import { VIEW_MODES } from "../utils/constants";

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState(VIEW_MODES.NORMAL);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("oct_volume");
    return saved ? parseFloat(saved) : 1;
  });
  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem("oct_muted");
    return saved === "true";
  });

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const changeViewMode = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const updateVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    localStorage.setItem("oct_volume", newVolume.toString());
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const newMuted = !prev;
      localStorage.setItem("oct_muted", newMuted.toString());
      return newMuted;
    });
  }, []);

  const value = {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    viewMode,
    setViewMode: changeViewMode,
    changeViewMode,
    volume,
    setVolume: updateVolume,
    muted,
    setMuted,
    toggleMute,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
