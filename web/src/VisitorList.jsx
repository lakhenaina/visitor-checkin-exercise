import { useState, useEffect, useMemo } from "react";
import { getVisitors, checkOut } from "./api";

function formatTime(isoString) {
  if (!isoString) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(isoString));
}

/* ---- UI-only helpers ---- */
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  return parts.map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

const AVATAR_COLORS = ["#6366f1", "#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
function avatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export default function VisitorList({ onRefresh, onToast }) {
  const [visitors, setVisitors] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ NEW: client-side search query
  const [query, setQuery] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    getVisitors(page)
      .then((data) => {
        if (data) {
          setVisitors(data);
        } else {
          setError("Failed to load visitors. Please try again.");
        }
      })
      .catch(() => {
        setError("Failed to load visitors. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [page, onRefresh]);

async function handleCheckOut(id) {
  // find visitor name for a nicer toast message
  const visitor = visitors.find((v) => v.id === id);

  // optimistic UI (keep your existing behavior)
  setVisitors((prev) => prev.filter((v) => v.id !== id));

  try {
    await checkOut(id);
    onToast?.("success", `Checked out: ${visitor?.full_name || "Visitor"}`);
  } catch (e) {
    // rollback UI if checkout failed
    setVisitors((prev) => (visitor ? [visitor, ...prev] : prev));
    onToast?.("error", "Check out failed. Please try again.");
  }
}

  // ✅ NEW: filtered list (search works on current page data only)
  const filteredVisitors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visitors;

    return visitors.filter((v) => {
      const fullName = (v.full_name || "").toLowerCase();
      const company = (v.company_name || "").toLowerCase();
      const host = (v.host_name || "").toLowerCase();
      const purpose = (v.purpose || "").toLowerCase();

      return (
        fullName.includes(q) ||
        company.includes(q) ||
        host.includes(q) ||
        purpose.includes(q)
      );
    });
  }, [visitors, query]);

  const isEmptyAfterFilter = !isLoading && !error && filteredVisitors.length === 0;

  return (
    <div style={styles.card} id="list">
      <style>{`@keyframes vmspin { to { transform: rotate(360deg); } }`}</style>

      <div style={styles.headerRow}>
        <div style={styles.cardHead}>
          <span>📋</span>
          <h3 style={styles.cardTitle}>Active Visitors</h3>
        </div>

        {/* ✅ NEW: Search UI */}
        <div style={styles.searchWrap}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, company, host or purpose…"
            style={styles.searchInput}
          />
          {query && (
            <button onClick={() => setQuery("")} style={styles.clearBtn} type="button">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 1. Loading State */}
      {isLoading && (
        <div style={styles.center}>
          <div style={styles.spinner}></div>
          Loading visitors…
        </div>
      )}

      {/* 2. Error State */}
      {!isLoading && error && (
        <div style={{ ...styles.center, color: "#d32f2f" }}>
          <div style={{ fontSize: "22px", marginBottom: "6px" }}>⚠️</div>
          <p style={{ margin: "0 0 10px" }}>{error}</p>
          <button onClick={() => setPage((p) => p)} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* ✅ NEW: Empty State (covers: no visitors OR no search matches) */}
      {isEmptyAfterFilter && (
        <div style={styles.center}>
          <div style={{ fontSize: "22px", marginBottom: "6px" }}>🔍</div>
          No visitors found{query ? " for this search" : ""}
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && filteredVisitors.length > 0 && (
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
              {filteredVisitors.map((v, i) => (
                <tr key={v.id}>
                  <td style={styles.td}>
                    <div style={styles.nameCell}>
                      <span style={styles.avatar(avatarColor(i))}>{getInitials(v.full_name)}</span>
                      <span>{v.full_name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{v.company_name}</td>
                  <td style={styles.td}>{v.host_name}</td>
                  <td style={styles.td}>{v.purpose}</td>
                  <td style={styles.td}>{formatTime(v.checked_in_at)}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleCheckOut(v.id)} style={styles.checkOutBtn}>
                      Check Out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.footer}>
            <span style={styles.pageInfo}>
              Page {page} · Showing {filteredVisitors.length} of {visitors.length}
            </span>
            <div style={styles.pageBtns}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous"
                style={styles.pageBtn(page === 1)}
              >
                ‹
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={visitors.length < 20}
                aria-label="Next"
                style={styles.pageBtn(visitors.length < 20)}
              >
                ›
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

  searchWrap: { display: "flex", alignItems: "center", gap: "8px" },
  searchInput: {
    width: "320px",
    maxWidth: "70vw",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "13px",
    outline: "none",
  },
  clearBtn: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: "8px",
    padding: "7px 10px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#374151",
  },

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
  retryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "7px 16px",
    fontSize: "13px",
    cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 600,
    color: "#6b7280",
    padding: "10px 12px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  td: {
    padding: "12px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  },
  nameCell: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: (bg) => ({
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: bg,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 600,
    flexShrink: 0,
  }),
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