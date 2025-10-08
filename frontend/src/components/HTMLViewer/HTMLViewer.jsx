import styles from "./HTMLViewer.module.css";

const HTMLViewer = ({ file }) => {
  return (
    <div className={styles.htmlViewer}>
      <div className={styles.placeholder}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
          <path d="M12 17.56l4.07-1.13.55-6.1H9.38L9.2 8.3h7.6l.2-1.99H7l.56 6.01h6.89l-.23 2.58-2.22.6-2.22-.6-.14-1.66H7.67l.28 3.35L12 17.56zM4.07 3h15.86L18.5 19.2 12 21l-6.5-1.8L4.07 3z" />
        </svg>
        <h3>HTML Viewer</h3>
        <p>{file.name}</p>
        <p className={styles.info}>HTML viewer coming soon...</p>
      </div>
    </div>
  );
};

export default HTMLViewer;
