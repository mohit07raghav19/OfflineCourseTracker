import { useState, useRef, useEffect, useCallback } from "react";
import { useCourse } from "../../context/CourseContext";
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
  const [error, setError] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);
  const seekFeedbackRef = useRef(null);
  const [seekFeedback, setSeekFeedback] = useState(null); // "+10s" / "-10s"

  const { getFileURL, updateProgress, goToNext } = useCourse();

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Show a brief seek feedback overlay
  const showSeekFeedback = useCallback((text) => {
    setSeekFeedback(text);
    if (seekFeedbackRef.current) clearTimeout(seekFeedbackRef.current);
    seekFeedbackRef.current = setTimeout(() => setSeekFeedback(null), 700);
  }, []);

  // Load video file
  useEffect(() => {
    const loadVideo = async () => {
      if (file && file.handle) {
        setLoading(true);
        setError(null);
        try {
          const url = await getFileURL(file);
          setVideoURL(url);
        } catch (err) {
          console.error("Error loading video:", err);
          setError(err.message || "Failed to load video");
        } finally {
          setLoading(false);
        }
      } else {
        setVideoURL(null);
        setPlaying(false);
        setLoading(false);
        setError(null);
        if (videoRef.current) {
          videoRef.current.pause();
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
    }, 5000);
    return () => clearInterval(interval);
  }, [playing, updateProgress]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [playing]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousemove", resetControlsTimeout);
    container.addEventListener("mouseenter", resetControlsTimeout);
    container.addEventListener("mouseleave", () => {
      if (playing) {
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        setShowControls(false);
      }
    });

    resetControlsTimeout();

    return () => {
      container.removeEventListener("mousemove", resetControlsTimeout);
      container.removeEventListener("mouseenter", resetControlsTimeout);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [playing, resetControlsTimeout]);

  // Keyboard shortcuts — video specific
  useEffect(() => {
    const handleKeyPress = (e) => {
      const video = videoRef.current;
      if (!video) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      switch (e.key.toLowerCase()) {
        case " ": // Space = play/pause
        case "k": // k = play/pause
          e.preventDefault();
          togglePlay();
          break;
        case "arrowleft":
        case "j": // j = seek -10s
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          showSeekFeedback("−10s");
          break;
        case "arrowright":
        case "l": // l = seek +10s
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          showSeekFeedback("+10s");
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "escape":
          if (document.fullscreenElement) {
            document.exitFullscreen();
            setIsFullscreen(false);
          }
          break;
        case "0": case "1": case "2": case "3": case "4":
        case "5": case "6": case "7": case "8": case "9": {
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
  }, [toggleFullscreen, showSeekFeedback]);

  // Handle video loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      video.volume = volume;
      video.currentTime = 0;
      video.play().catch(() => { });
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
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
    updateProgress({ lastPosition: duration, duration, completed: true });
    setTimeout(() => goToNext(), 2000);
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

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setMuted(video.muted);
    }
  };

  const handlePlaybackRateChange = useCallback((rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }, []);

  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
  }, []);

  // Seek on progress bar click
  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (video) video.currentTime = pos * video.duration;
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleVideoClick = (e) => {
    const target = e.target;
    const isInteractive =
      target.tagName === "BUTTON" ||
      target.tagName === "INPUT" ||
      target.tagName === "SELECT" ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest(`.${styles.controlsBar}`) ||
      target.closest(".vsc-controller") ||
      target.closest('[class*="vsc-"]');
    if (!isInteractive) togglePlay();
  };

  const handleRateChange = () => {
    if (videoRef.current) {
      setPlaybackRate(videoRef.current.playbackRate);
    }
  };

  const volumePercent = muted ? 0 : volume;

  return (
    <div className={styles.videoPlayer} ref={containerRef}>
      <div className={styles.videoWrapper} onClick={handleVideoClick}>
        <video
          ref={videoRef}
          src={videoURL || ""}
          className={styles.video}
          style={{ opacity: loading ? 0 : 1 }}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onRateChange={handleRateChange}
        />

        {loading && (
          <div className={styles.loadingOverlay}>
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
            <p>Loading video...</p>
          </div>
        )}

        {/* Seek feedback flash */}
        {seekFeedback && (
          <div className={styles.seekFeedback}>{seekFeedback}</div>
        )}

        {/* Center play button (shown with controls) */}
        <div className={`${styles.centerPlay} ${showControls ? styles.visible : ""}`}>
          <button className={styles.playButton} onClick={togglePlay}>
            {playing ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="44" height="44">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="44" height="44">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Bottom controls bar — ALWAYS overlays, NEVER shifts video */}
        <div className={`${styles.controlsBar} ${showControls ? styles.controlsVisible : ""}`}>
          {/* Progress bar */}
          <div className={styles.progressTrack} onClick={handleSeek}>
            <div
              className={styles.progressFill}
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          {/* Buttons row */}
          <div className={styles.controlsButtons}>
            <div className={styles.leftControls}>
              {/* Play/Pause */}
              <button onClick={togglePlay} title={playing ? "Pause (k)" : "Play (k)"}>
                {playing ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Time */}
              <span className={styles.time}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className={styles.rightControls}>
              {/* Volume */}
              <div className={styles.volumeControl}>
                <button onClick={toggleMute} title={muted ? "Unmute (m)" : "Mute (m)"}>
                  {muted || volume === 0 ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volumePercent}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className={styles.volumeSlider}
                  title="Volume"
                />
              </div>

              {/* Playback speed */}
              <select
                value={playbackRate}
                onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                className={styles.speedSelect}
                title="Playback Speed"
              >
                <option value="0.5">0.5×</option>
                <option value="0.75">0.75×</option>
                <option value="1">1×</option>
                <option value="1.25">1.25×</option>
                <option value="1.5">1.5×</option>
                <option value="1.75">1.75×</option>
                <option value="2">2×</option>
              </select>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} title="Fullscreen (f)">
                {isFullscreen ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
