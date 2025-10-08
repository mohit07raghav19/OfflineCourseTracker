import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourse } from "../../context/CourseContext";
import styles from "./Home.module.css";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const { loadCourse } = useCourse();
  const navigate = useNavigate();

  // Handle folder selection using native directory picker
  const handleFolderSelect = async () => {
    setError(null);
    setLoading(true);

    try {
      // Check if File System Access API is supported (Chromium browsers)
      if (!window.showDirectoryPicker) {
        setLoading(false);
        setError(
          "Folder picker is not supported in this browser. " +
            "Please use a Chromium-based browser (Chrome, Edge, Opera, Brave) for the best experience."
        );
        return;
      }

      const dirHandle = await window.showDirectoryPicker();
      setSelectedFolder(dirHandle.name);

      // Load course directly from directory handle - no path needed!
      await loadCourse(dirHandle);
      navigate("/course");
    } catch (err) {
      if (err.name === "AbortError") {
        // User cancelled the picker
        setLoading(false);
        setSelectedFolder(null);
        return;
      }
      console.error("Error selecting folder:", err);
      setError(err.message || "Failed to select folder. Please try again.");
      setLoading(false);
      setSelectedFolder(null);
    }
  };

  return (
    <div className={styles.home}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>OfflineCourseTracker</h1>
          <p className={styles.subtitle}>
            Track your progress through downloaded courses locally
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <svg
                className={styles.featureIcon}
                viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 12H9.5v-2H11v2zm0-4H9.5V9H11v2zm4 4h-1.5v-2H15v2zm0-4h-1.5V9H15v2z" />
              </svg>
              <h3>Multi-Format Support</h3>
              <p>Videos, PDFs, Markdown, HTML & Text files</p>
            </div>

            <div className={styles.feature}>
              <svg
                className={styles.featureIcon}
                viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <h3>Auto Progress Tracking</h3>
              <p>Automatically tracks your learning progress</p>
            </div>

            <div className={styles.feature}>
              <svg
                className={styles.featureIcon}
                viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <h3>100% Offline</h3>
              <p>All data stored locally on your machine</p>
            </div>
          </div>

          <div className={styles.loaderSection}>
            {/* Folder Picker Button */}
            <button
              className={styles.pickerButton}
              onClick={handleFolderSelect}
              disabled={loading}
              type="button">
              {loading ? (
                <>
                  <span
                    className="spinner"
                    style={{ width: 20, height: 20 }}></span>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="24"
                    height="24">
                    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
                  </svg>
                  <span> Select Course Folder</span>
                </>
              )}
            </button>

            {selectedFolder && (
              <div className={styles.selectedInfo}>
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="16"
                  height="16">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <span>Selected: {selectedFolder}</span>
              </div>
            )}
          </div>

          {error && (
            <div className={styles.error}>
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="20"
                height="20">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className={styles.instructions}>
            <h4>How to use:</h4>
            <ol>
              <li>Click "Select Course Folder" button above</li>
              <li>Choose your downloaded course folder from your computer</li>
              <li>The course will load instantly - that's it!</li>
            </ol>
            <div className={styles.note}>
              <strong>Browser Compatibility:</strong> This app works best with
              Chromium-based browsers (Chrome, Edge, Opera, Brave). Other
              browsers may have limited functionality.
            </div>
            <div className={styles.note}>
              <strong>Privacy:</strong> All your data stays on your computer.
              Nothing is uploaded to any server. Your progress is saved locally
              in your browser.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
