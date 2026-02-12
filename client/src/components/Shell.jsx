import { NavLink, Outlet } from "react-router-dom";

export default function Shell() {
  return (
    <div style={styles.wrap}>
      <aside style={styles.side}>
        <div style={styles.brand}>SkillStream</div>

        <nav style={styles.nav}>
          <NavLink to="/" style={linkStyle}>
            Dashboard
          </NavLink>
          <NavLink to="/quiz" style={linkStyle}>
            Quiz
          </NavLink>
          <NavLink to="/path" style={linkStyle}>Path</NavLink>

        </nav>

        <div style={styles.sideFooter}>
          <div style={styles.smallMuted}>NMA03 Demo</div>
          <div style={styles.smallMuted}>Adaptive Upskilling</div>
        </div>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

function linkStyle({ isActive }) {
  return {
    ...styles.link,
    ...(isActive ? styles.linkActive : {}),
  };
}

const styles = {
  wrap: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    minHeight: "100vh",
    background: "#0b1220",
    color: "#e9eefc",
    fontFamily: "Inter, system-ui, Arial",
  },
  side: {
    borderRight: "1px solid rgba(255,255,255,0.10)",
    padding: 18,
    position: "sticky",
    top: 0,
    height: "100vh",
    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  },
  brand: { fontSize: 20, fontWeight: 900, letterSpacing: 0.3, marginBottom: 18 },
  nav: { display: "grid", gap: 10 },
  link: {
    textDecoration: "none",
    color: "#e9eefc",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
  },
  linkActive: {
    border: "1px solid rgba(124,58,237,0.9)",
    background: "rgba(124,58,237,0.18)",
    fontWeight: 800,
  },
  sideFooter: { marginTop: "auto", paddingTop: 18, opacity: 0.75 },
  smallMuted: { fontSize: 12 },
  main: { padding: 22 },
};
