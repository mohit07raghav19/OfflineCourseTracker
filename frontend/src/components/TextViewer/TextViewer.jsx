import styles from "./TextViewer.module.css";

const TextViewer = ({ file }) => {
  return (
    <div className={styles.textViewer}>
      <div className={styles.placeholder}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
        <h3>Text Viewer</h3>
        <p>{file.name}</p>
        <p className={styles.info}>Text viewer coming soon...</p>
      </div>
    </div>
  );
};

export default TextViewer;
