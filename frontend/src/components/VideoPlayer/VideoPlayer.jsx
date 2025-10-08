import { useState, useRef, useEffect, useCallback } from "react";
import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import styles from "./VideoPlayer.module.css";

const VideoPlayer = ({ file }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [videoURL, setVideoURL] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  const { getFileURL, updateProgress, goToNext, getFileProgress } = useCourse();
  const { viewMode, changeViewMode, setSidebarOpen } = useUI();

  // Toggle cinema mode (also controls sidebar)
  const toggleCinemaMode = useCallback(() => {
    setIsCinemaMode((prev) => {
      const newMode = !prev;
      changeViewMode(newMode ? "cinema" : "normal");
      // Toggle sidebar along with cinema mode
      setSidebarOpen(!newMode); // Close sidebar when entering cinema, open when exiting
      return newMode;
    });
  }, [changeViewMode, setSidebarOpen]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Load video file
  useEffect(() => {
    const loadVideo = async () => {
      if (file && file.handle) {
        setLoading(true);
        try {
          const url = await getFileURL(file);
          setVideoURL(url);
        } catch (err) {
          console.error("Error loading video:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadVideo();
  }, [file, getFileURL]);

  // Save progress periodically
  useEffect(() => {
    if (!playing || !videoRef.current) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused) {
        updateProgress({
          lastPosition: video.currentTime,
          duration: video.duration,
          completed: video.currentTime / video.duration >= 0.9,
        });
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [playing, updateProgress]);

  // Auto-hide controls after 3 seconds of inactivity when playing
  useEffect(() => {
    const resetControlsTimeout = () => {
      // Clear existing timeout
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      // Show controls
      setShowControls(true);

      // Hide after 3 seconds if playing
      if (playing) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 1000);
      }
    };

    const handleMouseMove = () => {
      resetControlsTimeout();
    };

    const handleMouseLeave = () => {
      if (playing) {
        setShowControls(false);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    // Initial setup
    resetControlsTimeout();

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      const video = videoRef.current;
      if (!video) return;

      // Ignore if user is typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "arrowleft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case "arrowright":
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
        case "arrowup":
          e.preventDefault();
          setVolume((v) => {
            const newVol = Math.min(1, v + 0.1);
            video.volume = newVol;
            return newVol;
          });
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((v) => {
            const newVol = Math.max(0, v - 0.1);
            video.volume = newVol;
            return newVol;
          });
          break;
        case "m":
          e.preventDefault();
          setMuted((m) => !m);
          video.muted = !video.muted;
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "c":
          e.preventDefault();
          toggleCinemaMode();
          break;
        case "escape":
          e.preventDefault();
          // Exit cinema mode and restore sidebar
          if (isCinemaMode) {
            setIsCinemaMode(false);
            changeViewMode("normal");
            setSidebarOpen(true);
          }
          // Exit fullscreen if active
          if (document.fullscreenElement) {
            document.exitFullscreen();
            setIsFullscreen(false);
          }
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
          e.preventDefault();
          const percent = parseInt(e.key) / 10;
          video.currentTime = video.duration * percent;
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    toggleCinemaMode,
    toggleFullscreen,
    isCinemaMode,
    changeViewMode,
    setSidebarOpen,
  ]);

  // Handle video loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      video.volume = volume;

      // Resume from last position if available
      const progress = getFileProgress(file);
      if (progress && progress.lastPosition && progress.lastPosition > 0) {
        video.currentTime = progress.lastPosition;
      }
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);

      // Auto-complete at 90%
      if (video.currentTime / video.duration >= 0.9) {
        updateProgress({
          lastPosition: video.currentTime,
          duration: video.duration,
          completed: true,
        });
      }
    }
  };

  // Handle video ended
  const handleEnded = () => {
    setPlaying(false);
    updateProgress({
      lastPosition: duration,
      duration: duration,
      completed: true,
    });

    // Auto-navigate to next file
    setTimeout(() => {
      goToNext();
    }, 2000);
  };

  // Toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
        setPlaying(true);
      } else {
        video.pause();
        setPlaying(false);
      }
    }
  };

  // Handle playback rate change
  const handlePlaybackRateChange = useCallback((rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  }, []);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  }, []);

  // Seek to position
  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (video) {
      video.currentTime = pos * video.duration;
    }
  };

  // Format time
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle click on video container (play/pause toggle)
  const handleVideoClick = (e) => {
    // Don't toggle if clicking on buttons, inputs, or interactive elements
    const target = e.target;
    const isInteractive =
      target.tagName === "BUTTON" ||
      target.tagName === "INPUT" ||
      target.tagName === "SELECT" ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("select") ||
      target.classList.contains(styles.progressBar) ||
      target.classList.contains(styles.controlsButtons);

    if (!isInteractive) {
      togglePlay();
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" style={{ width: 48, height: 48 }}></div>
        <p>Loading video...</p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.videoPlayer} ${styles[viewMode]}`}
      ref={containerRef}>
      <div className={styles.videoContainer} onClick={handleVideoClick}>
        <video
          ref={videoRef}
          src={videoURL}
          className={styles.video}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />

        {/* Video overlay controls */}
        <div
          className={`${styles.controls} ${
            showControls ? styles.controlsVisible : ""
          }`}>
          <button className={styles.playButton} onClick={togglePlay}>
            {playing ? (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="48"
                height="48">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="48"
                height="48">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Bottom controls bar */}
          <div className={styles.controlsBar}>
            {/* Progress bar */}
            <div className={styles.progressBar} onClick={handleSeek}>
              <div
                className={styles.progressFill}
                style={{ width: `${(currentTime / duration) * 100}%` }}></div>
            </div>

            {/* Control buttons */}
            <div className={styles.controlsButtons}>
              <div className={styles.leftControls}>
                <button onClick={togglePlay} title={playing ? "Pause" : "Play"}>
                  {playing ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="24"
                      height="24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="24"
                      height="24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <span className={styles.time}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className={styles.rightControls}>
                {/* Volume control */}
                <div className={styles.volumeControl}>
                  <button
                    onClick={() => setMuted(!muted)}
                    title={muted ? "Unmute" : "Mute"}>
                    {muted || volume === 0 ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="24"
                        height="24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="24"
                        height="24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={muted ? 0 : volume}
                    onChange={(e) =>
                      handleVolumeChange(parseFloat(e.target.value))
                    }
                    className={styles.volumeSlider}
                    title="Volume"
                  />
                </div>

                {/* Playback speed control */}
                <select
                  value={playbackRate}
                  onChange={(e) =>
                    handlePlaybackRateChange(parseFloat(e.target.value))
                  }
                  className={styles.speedSelect}
                  title="Playback Speed">
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="1.75">1.75x</option>
                  <option value="2">2x</option>
                </select>

                {/* Cinema mode button */}
                <button
                  onClick={toggleCinemaMode}
                  title="Cinema Mode (C)"
                  className={isCinemaMode ? styles.active : ""}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="24"
                    height="24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                  </svg>
                </button>

                {/* Fullscreen button */}
                <button onClick={toggleFullscreen} title="Fullscreen (F)">
                  {isFullscreen ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="24"
                      height="24">
                      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="24"
                      height="24">
                      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
