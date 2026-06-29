import { useEffect } from "react";
import styles from "./ShortcutsModal.module.css";

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["↑", "↓"], desc: "Previous / Next file" },
      { keys: ["j", "k"], desc: "Next / Prev file (non-video)" },
      { keys: ["n", "p"], desc: "Next / Previous file" },
      { keys: ["g g"], desc: "Jump to first file" },
      { keys: ["G"], desc: "Jump to last file" },
      { keys: ["c"], desc: "Toggle sidebar" },
    ],
  },
  {
    category: "Video Player",
    items: [
      { keys: ["Space", "k"], desc: "Play / Pause" },
      { keys: ["←", "→"], desc: "Seek ±10 seconds" },
      { keys: ["j", "l"], desc: "Seek ±10 seconds" },
      { keys: ["m"], desc: "Mute / Unmute" },
      { keys: ["f"], desc: "Toggle fullscreen" },
      { keys: ["0 – 9"], desc: "Seek to 0–90% of video" },
    ],
  },
  {
    category: "General",
    items: [
      { keys: ["Enter"], desc: "Toggle completion (mark done)" },
      { keys: ["?"], desc: "Show / hide this guide" },
      { keys: ["Esc"], desc: "Close modal / exit fullscreen" },
    ],
  },
];

const ShortcutsModal = ({ onClose }) => {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" || e.key === "?" || e.key === "/") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
      >
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={styles.keyBadge}>?</span>
            <h2 className={styles.title}>Keyboard Shortcuts</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className={styles.grid}>
          {shortcuts.map((section) => (
            <div key={section.category} className={styles.section}>
              <h3 className={styles.sectionTitle}>{section.category}</h3>
              <ul className={styles.list}>
                {section.items.map((item, i) => (
                  <li key={i} className={styles.item}>
                    <span className={styles.desc}>{item.desc}</span>
                    <span className={styles.keys}>
                      {item.keys.map((k, ki) => (
                        <kbd key={ki} className={styles.kbd}>{k}</kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className={styles.footer}>Press <kbd className={styles.kbd}>?</kbd> or <kbd className={styles.kbd}>Esc</kbd> to close</p>
      </div>
    </div>
  );
};

export default ShortcutsModal;
