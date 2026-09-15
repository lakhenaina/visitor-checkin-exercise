import { useState, useEffect } from "react";
import { getVisitors, checkOut } from "./api";

function formatTime(isoString) {
  if (!isoString) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoString));
}

export default function VisitorList({ onRefresh, onToast }) {
  const [visitors, setVisitors] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    getVisitors(page)
      .then((data) => {
        if (data) {
          setVisitors(data);
        } else {
          setError("Failed to load visitors.Please check your connection and try again.");
        }
      })
      .catch(() => {
        setError("Failed to load visitors. Please check your connection and try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [page, onRefresh]);

  async function handleCheckOut(id) {
  // find visitor name for a nicer toast message
   const visitor = visitors.find((v) => v.id === id);

    try {
     await checkOut(id);
      onToast?.(
        "success",
        `${visitor?.full_name || "Visitor"} Checked Out Successfully.`,
     );
    } catch {
     onToast?.("error", "Check out failed. Please try again.");
    }
  }

  return (
    <div style={styles.card} id="list">
      <style>{`@keyframes vmspin { to { transform: rotate(360deg); } }`}</style>

      <div style={styles.headerRow}>
        <div style={styles.cardHead}>
          <span>📋</span>
          <h3 style={styles.cardTitle}>Active Visitors</h3>
        </div>
      </div>

      {/* 1. Loading State */}
      {isLoading && (
        <div style={styles.center}>
          <div style={styles.spinner}></div>
          Loading visitors…
        </div>
      )}

      {error && (
        <div style={{ ...styles.center, color: "#d32f2f" }}>{error}</div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Company</th>
                <th style={styles.th}>Host</th>
                <th style={styles.th}>Purpose</th>
                <th style={styles.th}>Checked In</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v.id}>
                  <td style={styles.td}>{v.full_name}</td>
                  <td style={styles.td}>{v.company_name}</td>
                  <td style={styles.td}>{v.host_name}</td>
                  <td style={styles.td}>{v.purpose}</td>
                  <td style={styles.td}>{formatTime(v.checked_in_at)}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleCheckOut(v.id)}>
                      Check Out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.footer}>
            <div style={styles.pageBtns}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous"
                style={styles.pageBtn(page === 1)}
              >
                Previous
              </button>
              <span style={{ margin: "0 12px" }}>Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={visitors.length < 20}
                aria-label="Next"
                style={styles.pageBtn(visitors.length < 20)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 1px 3px rgba(16,24,40,0.08)",
    padding: "20px 22px",
  },

  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },

  cardHead: { display: "flex", alignItems: "center", gap: "8px" },
  cardTitle: { margin: 0, fontSize: "15px", fontWeight: 600, color: "#111827" },
  center: { padding: "40px 20px", textAlign: "center", color: "#6b7280", fontSize: "14px" },
  spinner: {
    width: "22px",
    height: "22px",
    border: "3px solid #e5e7eb",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "vmspin 0.8s linear infinite",
    margin: "0 auto 10px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
th :{ borderBottom: "1px solid #ccc", padding: "6px 8px", textAlign: "left" },
td : { padding: "6px 8px", borderBottom: "1px solid #eee" },
  checkOutBtn: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    color: "#475569",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "13px",
    cursor: "pointer",
  },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px" },
  pageInfo: { fontSize: "13px", color: "#6b7280" },
  pageBtns: { display: "flex", gap: "6px" },
  pageBtn: (disabled) => ({
    minWidth: "30px",
    height: "30px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    background: disabled ? "#f9fafb" : "#fff",
    color: disabled ? "#9ca3af" : "#374151",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "14px",
  }),
};