import { useState, useRef, useEffect } from "react";
import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import styles from "./VideoPlayer.module.css";

const VideoPlayer = ({ file }) => {
  const videoRef = useRef(null);
  const [videoURL, setVideoURL] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);

  const { getFileURL, updateProgress, goToNext } = useCourse();
  const { viewMode } = useUI();

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

  // Handle video loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      // TODO: Resume from last position if available
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

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" style={{ width: 48, height: 48 }}></div>
        <p>Loading video...</p>
      </div>
    );
  }

  return (
    <div className={`${styles.videoPlayer} ${styles[viewMode]}`}>
      <div className={styles.videoContainer}>
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
        <div className={styles.controls}>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
