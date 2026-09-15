export default function Layout({ children }) {
  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <span>👥</span>
          <span>Visitor Management</span>
        </div>
        <nav style={styles.nav}>
          <a href="#register" style={{ ...styles.navItem, ...styles.navItemActive }}>
            <span>👤</span> Visitor Register
          </a>
          <a href="#list" style={styles.navItem}>
            <span>📋</span> Visitor List
          </a>
        </nav>
      </aside>


      <div style={styles.main}>
        <header style={styles.topbar}>
        
          <div style={styles.profile}>
           
          </div>
        </header>

        <div style={styles.pageHead}>
          <h1 style={styles.pageTitle}>Visitor Register &amp; List</h1>
          <p style={styles.pageSub}>Register new visitors and view the list of all visitors.</p>
        </div>

        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  app: {
    display: "flex",
    minHeight: "100vh",
    background: "#f1f5f9",
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    color: "#1f2937",
  },
  sidebar: {
    width: "220px",
    background: "#1e2a3a",
    padding: "18px 14px",
    flexShrink: 0,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#fff",
    fontWeight: 600,
    fontSize: "15px",
    padding: "6px 8px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "14px",
  },
  nav: { display: "flex", flexDirection: "column", gap: "6px" },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "14px",
  },
  navItemActive: { background: "#2563eb", color: "#fff" },
  main: { flex: 1, minWidth: 0 },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 28px",
    color: "#475569",
    fontSize: "14px",
  },
  hamburger: { fontSize: "18px", cursor: "pointer" },
  profile: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
  pageHead: { padding: "4px 28px 16px" },
  pageTitle: { margin: 0, fontSize: "22px", fontWeight: 700, color: "#0f172a" },
  pageSub: { margin: "4px 0 0", fontSize: "13px", color: "#64748b" },
  content: { padding: "0 28px 28px" },
};