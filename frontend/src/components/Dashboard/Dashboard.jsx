import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import Sidebar from "../Sidebar/Sidebar";
import ContentViewer from "../ContentViewer/ContentViewer";
import ShortcutsModal from "../ShortcutsModal/ShortcutsModal";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const {
    course,
    loading,
    currentFile,
    setCurrentFile,
    expandParentFolders,
    toggleCompletion,
  } = useCourse();
  const { sidebarOpen, toggleSidebar } = useUI();
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    if (!loading && !course) {
      navigate("/");
    }
  }, [course, loading, navigate]);

  // Navigate to file helper
  const navigateToFile = useCallback(
    (file) => {
      if (file) {
        setCurrentFile(file);
        expandParentFolders(file.path);
      }
    },
    [setCurrentFile, expandParentFolders]
  );

  // Keyboard navigation and shortcuts
  useEffect(() => {
    // For double-g detection
    let lastGTime = 0;

    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input / textarea
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Toggle shortcuts modal with '?'
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }

      // Close shortcuts modal with Escape (if open)
      if (e.key === "Escape" && showShortcuts) {
        e.preventDefault();
        setShowShortcuts(false);
        return;
      }

      // Don't process nav shortcuts while modal is open
      if (showShortcuts) return;

      // Toggle completion with Enter
      if (e.key === "Enter") {
        if (
          e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.isContentEditable ||
          e.target.tagName === "BUTTON" ||
          e.target.tagName === "A"
        ) {
          return;
        }
        e.preventDefault();
        if (currentFile) {
          toggleCompletion(currentFile);
        }
        return;
      }

      // Toggle sidebar — 'c'
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      if (!course || !course.files || course.files.length === 0) return;

      const isVideo = currentFile?.fileType === "video";
      const currentIndex = currentFile
        ? course.files.findIndex((f) => f.path === currentFile.path)
        : -1;

      // When sidebar is closed, arrow keys scroll instead of navigate files (for non-video files)
      if (!sidebarOpen && !isVideo && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        const scrollAmount = e.key === "ArrowDown" ? 60 : -60;
        const iframe = document.querySelector("iframe");
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.scrollBy({ top: scrollAmount, behavior: "auto" });
        } else {
          const scrollContainer =
            document.querySelector('[class*="markdownViewer"] [class*="content"]') ||
            document.querySelector('[class*="textViewer"] [class*="content"]') ||
            document.querySelector('[class*="pdfViewer"] [class*="content"]');
          if (scrollContainer) {
            scrollContainer.scrollBy({ top: scrollAmount, behavior: "auto" });
          }
        }
        return;
      }

      // ── Arrow keys ──────────────────────────────────────────
      // When video is active: ← / → are handled by VideoPlayer (±10s seek)
      // ↑ = previous file, ↓ = next file (always, regardless of file type)
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentIndex < course.files.length - 1) {
          navigateToFile(course.files[currentIndex + 1]);
        }
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentIndex > 0) {
          navigateToFile(course.files[currentIndex - 1]);
        }
        return;
      }

      // ← / → for non-video: prev/next file
      if (!isVideo) {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          if (currentIndex < course.files.length - 1) {
            navigateToFile(course.files[currentIndex + 1]);
          }
          return;
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          if (currentIndex > 0) {
            navigateToFile(course.files[currentIndex - 1]);
          }
          return;
        }
      }

      // ── VIM-style: n / p ────────────────────────────────────
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        if (currentIndex < course.files.length - 1) {
          navigateToFile(course.files[currentIndex + 1]);
        }
        return;
      }

      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (currentIndex > 0) {
          navigateToFile(course.files[currentIndex - 1]);
        }
        return;
      }

      // ── VIM-style: j / k navigation (only when NOT viewing a video)
      if (!isVideo) {
        if (e.key === "j" || e.key === "J") {
          e.preventDefault();
          if (currentIndex < course.files.length - 1) {
            navigateToFile(course.files[currentIndex + 1]);
          }
          return;
        }

        if (e.key === "k" || e.key === "K") {
          e.preventDefault();
          if (currentIndex > 0) {
            navigateToFile(course.files[currentIndex - 1]);
          }
          return;
        }

        // ── VIM-style: gg = first, G = last ─────────────────────
        if (e.key === "g") {
          const now = Date.now();
          if (now - lastGTime < 500) {
            // Double-g: jump to first file
            e.preventDefault();
            navigateToFile(course.files[0]);
            lastGTime = 0;
          } else {
            lastGTime = now;
          }
          return;
        }

        if (e.key === "G") {
          e.preventDefault();
          navigateToFile(course.files[course.files.length - 1]);
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    course,
    currentFile,
    navigateToFile,
    toggleSidebar,
    sidebarOpen,
    toggleCompletion,
    showShortcuts,
  ]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className={styles.dashboard}>
      <Sidebar onNavigateHome={() => navigate("/")} />
      <main className={styles.content}>
        <ContentViewer />
      </main>

      {/* Keyboard shortcuts modal */}
      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
};

export default Dashboard;
