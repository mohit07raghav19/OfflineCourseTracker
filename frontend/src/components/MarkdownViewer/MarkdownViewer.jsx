import styles from "./MarkdownViewer.module.css";

const MarkdownViewer = ({ file }) => {
  return (
    <div className={styles.markdownViewer}>
      <div className={styles.placeholder}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
          <path d="M3 3v18h18V3H3zm13.5 13.5h-1.5v-4.5l-1.5 1.5-1.5-1.5v4.5H10.5v-9h1.5l1.5 1.5 1.5-1.5h1.5v9z" />
        </svg>
        <h3>Markdown Viewer</h3>
        <p>{file.name}</p>
        <p className={styles.info}>Markdown viewer coming soon...</p>
      </div>
    </div>
  );
};

export default MarkdownViewer;
