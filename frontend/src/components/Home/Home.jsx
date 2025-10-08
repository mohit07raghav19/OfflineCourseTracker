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

  // Handle folder selection using native directory picker (Chromium)
  const handleFolderSelect = async () => {
    setError(null);
    setLoading(true);

    try {
      // Check if File System Access API is supported (Chromium browsers)
      if (!window.showDirectoryPicker) {
        // Fallback for non-Chromium browsers
        handleFallbackFolderPicker();
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

  // Fallback for Firefox, Safari, and other non-Chromium browsers
  const handleFallbackFolderPicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.directory = true;
    input.multiple = true;

    input.onchange = async (e) => {
      try {
        const files = Array.from(e.target.files);
        if (files.length === 0) {
          setLoading(false);
          return;
        }

        // Get folder name from the first file's path
        const firstFile = files[0];
        const pathParts = firstFile.webkitRelativePath.split("/");
        const folderName = pathParts[0];
        setSelectedFolder(folderName);

        // Create a pseudo directory handle from files
        const dirHandle = createPseudoDirectoryHandle(folderName, files);

        await loadCourse(dirHandle);
        navigate("/course");
      } catch (err) {
        console.error("Error processing folder:", err);
        setError(err.message || "Failed to process folder. Please try again.");
        setLoading(false);
        setSelectedFolder(null);
      }
    };

    input.onclick = () => {
      // Reset in case user cancels
      input.value = null;
    };

    input.oncancel = () => {
      setLoading(false);
      setSelectedFolder(null);
    };

    input.click();
  };

  // Create a pseudo directory handle compatible with our system
  const createPseudoDirectoryHandle = (folderName, files) => {
    // Helper to create a recursive values() function
    const createValuesIterator = (childrenMap) => {
      return async function* () {
        for (const [, entry] of childrenMap.entries()) {
          yield entry;
        }
      };
    };

    // Build a tree structure from flat file list
    const root = {
      name: folderName,
      kind: "directory",
      _isLegacy: true,
      _files: files,
      _children: new Map(),
    };

    // Build directory tree
    files.forEach((file) => {
      const parts = file.webkitRelativePath.split("/");
      // Skip the root folder name
      const pathParts = parts.slice(1);

      let currentLevel = root._children;
      let currentPath = folderName;

      // Create directory structure
      for (let i = 0; i < pathParts.length - 1; i++) {
        const dirName = pathParts[i];
        currentPath = `${currentPath}/${dirName}`;

        if (!currentLevel.has(dirName)) {
          const dirEntry = {
            name: dirName,
            kind: "directory",
            _isLegacy: true,
            _children: new Map(),
          };
          // Add values() method to each subdirectory
          dirEntry.values = createValuesIterator(dirEntry._children);
          currentLevel.set(dirName, dirEntry);
        }
        currentLevel = currentLevel.get(dirName)._children;
      }

      // Add file to the appropriate directory
      const fileName = pathParts[pathParts.length - 1];
      if (!currentLevel.has(fileName)) {
        currentLevel.set(fileName, {
          name: fileName,
          kind: "file",
          getFile: async () => file,
          _file: file,
        });
      }
    });

    // Create values() iterator for root
    root.values = createValuesIterator(root._children);

    return root;
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
              <strong>Browser Compatibility:</strong> This app works with all
              modern browsers including Chrome, Firefox, Edge, Safari, Opera,
              and Brave.
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
