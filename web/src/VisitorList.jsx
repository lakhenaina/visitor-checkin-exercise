import { useState, useEffect } from "react";
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

export default function VisitorList({ onRefresh }) {
  const [visitors, setVisitors] = useState([]);
  const [page, setPage] = useState(1);
  // ✅ NEW: Track loading state (initialize as `true` for first load)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ NEW: Set loading to `true` when fetch starts
    setIsLoading(true);
    getVisitors(page)
      .then((data) => {
        if (data) setVisitors(data);
      })
      // ✅ NEW: Ensure loading is set to `false` on success OR error
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, [page, onRefresh]);

  function handleCheckOut(id) {
    setVisitors((prev) => prev.filter((v) => v.id !== id));
    checkOut(id);
  }

  return (
    <div>
      <h2>Active Visitors</h2>

      {/* ✅ NEW: Loading indicator (shown while `isLoading === true`) */}
      {isLoading && (
        <div style={{ padding: "20px", textAlign: "center" }}>
          Loading visitors...
        </div>
      )}

      {/* ✅ NEW: Empty state (shown when NOT loading AND no visitors) */}
      {!isLoading && visitors.length === 0 && (
        <div style={{ padding: "20px", textAlign: "center" }}>
          No visitors found
        </div>
      )}

      {/* ✅ MODIFIED: Only render table + pagination when NOT loading AND visitors exist */}
      {!isLoading && visitors.length > 0 && (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Company</th>
                <th style={th}>Host</th>
                <th style={th}>Purpose</th>
                <th style={th}>Checked In</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v.id}>
                  <td style={td}>{v.full_name}</td>
                  <td style={td}>{v.company_name}</td>
                  <td style={td}>{v.host_name}</td>
                  <td style={td}>{v.purpose}</td>
                  <td style={td}>{formatTime(v.checked_in_at)}</td>
                  <td style={td}>
                    <button onClick={() => handleCheckOut(v.id)}>Check Out</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: "8px" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span style={{ margin: "0 12px" }}>Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={visitors.length < 20}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const th = { borderBottom: "1px solid #ccc", padding: "6px 8px", textAlign: "left" };
const td = { padding: "6px 8px", borderBottom: "1px solid #eee" };