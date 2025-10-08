import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import Sidebar from "../Sidebar/Sidebar";
import ContentViewer from "../ContentViewer/ContentViewer";
import FloatingControls from "../FloatingControls/FloatingControls";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const { course, loading, currentFile, setCurrentFile, expandParentFolders } =
    useCourse();
  const { sidebarOpen, toggleSidebar } = useUI();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log("[Dashboard] Render state:", {
      hasCourse: !!course,
      courseName: course?.name,
      totalFiles: course?.totalFiles,
      loading,
      sidebarOpen,
    });
  }, [course, loading, sidebarOpen]);

  useEffect(() => {
    // Redirect to home if no course is loaded
    if (!loading && !course) {
      console.log("[Dashboard] No course loaded, redirecting to home");
      navigate("/");
    }
  }, [course, loading, navigate]);

  // Keyboard navigation and shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      // Global 'C' key to toggle sidebar (works for all file types)
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      if (!course || !course.files || course.files.length === 0) {
        return;
      }

      const currentIndex = currentFile
        ? course.files.findIndex((f) => f.path === currentFile.path)
        : -1;

      // Arrow keys for navigation
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        // Next file
        if (currentIndex < course.files.length - 1) {
          const nextFile = course.files[currentIndex + 1];
          setCurrentFile(nextFile);
          expandParentFolders(nextFile.path);
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        // Previous file
        if (currentIndex > 0) {
          const prevFile = course.files[currentIndex - 1];
          setCurrentFile(prevFile);
          expandParentFolders(prevFile.path);
        }
      }
      // 'n' for next
      else if (e.key === "n" || e.key === "N") {
        if (currentIndex < course.files.length - 1) {
          const nextFile = course.files[currentIndex + 1];
          setCurrentFile(nextFile);
          expandParentFolders(nextFile.path);
        }
      }
      // 'p' for previous
      else if (e.key === "p" || e.key === "P") {
        if (currentIndex > 0) {
          const prevFile = course.files[currentIndex - 1];
          setCurrentFile(prevFile);
          expandParentFolders(prevFile.path);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [course, currentFile, setCurrentFile, expandParentFolders, toggleSidebar]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" style={{ width: 48, height: 48 }}></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className={styles.dashboard}>
      <Sidebar />
      <main
        className={`${styles.content} ${
          !sidebarOpen ? styles.contentExpanded : ""
        }`}>
        {/* Back to Home button */}
        <button
          className={styles.backButton}
          onClick={() => navigate("/")}
          title="Back to Home">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          <span>Back to Home</span>
        </button>
        <ContentViewer />
        <FloatingControls />
      </main>
    </div>
  );
};

export default Dashboard;
