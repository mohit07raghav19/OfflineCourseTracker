import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCourse } from "../../context/CourseContext";
import { useUI } from "../../context/UIContext";
import Sidebar from "../Sidebar/Sidebar";
import ContentViewer from "../ContentViewer/ContentViewer";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const { course, loading } = useCourse();
  const { sidebarOpen } = useUI();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if no course is loaded
    if (!loading && !course) {
      navigate("/");
    }
  }, [course, loading, navigate]);

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
        <ContentViewer />
      </main>
    </div>
  );
};

export default Dashboard;
