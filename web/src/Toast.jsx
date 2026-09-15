import { useEffect } from "react";

export default function Toast({ open, type = "success", message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  const bg = type === "error" ? "#dc2626" : "#16a34a";

  return (
    <div style={{ ...styles.wrap, background: bg }}>
      <span style={styles.text}>{message}</span>
      <button onClick={onClose} style={styles.closeBtn} aria-label="Close toast">
        ×
      </button>
    </div>
  );
}

const styles = {
  wrap: {
    position: "fixed",
    right: 18,
    top: 18,
    zIndex: 9999,
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 260,
    maxWidth: 360,
  },
  text: { fontSize: 14, lineHeight: "18px" },
  closeBtn: {
    marginLeft: "auto",
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1,
  },
};