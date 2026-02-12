import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Dashboard() {
  // ✅ fixed user for demo
  const [userId] = useState("u-emp-01");

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const dash = await api.getDashboard(userId);
      setData(dash);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  if (loading) return <div style={{ padding: 8 }}>Loading dashboard...</div>;
  if (err) return <div style={{ padding: 8, color: "crimson" }}>{err}</div>;
  if (!data) return <div style={{ padding: 8 }}>No data</div>;

  const { user, path, nextAsset, etaMinutes } = data;

  return (
    <div style={styles.page}>
      <div style={styles.topRow}>
        <div>
          <div style={styles.h1}>Dashboard</div>
          <div style={styles.muted}>
            Welcome, <b>{user.name}</b> • Preference:{" "}
            <span style={styles.pill}>{user.learning_style_preference}</span>
          </div>
        </div>

        {/* ✅ NO DROPDOWN. ONLY REFRESH */}
        <button style={styles.btn} onClick={load}>
          Refresh
        </button>
      </div>

      <div style={styles.grid}>
        {/* NEXT STEP */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Recommended Next Step</div>

          {!nextAsset ? (
            <div style={styles.muted}>No next asset found.</div>
          ) : (
            <>
              <div style={styles.assetTitle}>
                {nextAsset.title || nextAsset.assetId}
              </div>

              <div style={styles.metaRow}>
                <span style={styles.pill}>{nextAsset.topic}</span>
                <span style={styles.pill}>{nextAsset.format}</span>
                <span style={styles.pill}>Diff: {nextAsset.difficulty ?? "-"}</span>
                <span style={styles.pill}>{nextAsset.level || "—"}</span>
              </div>

              <div style={{ marginTop: 10 }}>
                ETA remaining: <b>{etaMinutes}</b> min
              </div>

              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  style={styles.btnGhost}
                  href={nextAsset.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  Start Learning
                </a>

                <button
                  style={styles.btnPrimary}
                  onClick={() =>
                    nav("/quiz", {
                      state: {
                        userId,                 // ✅ fixed
                        assetId: nextAsset.assetId,
                        topic: nextAsset.topic,
                      },
                    })
                  }
                >
                  Take Quiz
                </button>

                <button style={styles.btn} onClick={() => nav("/path")}>
                  View Path →
                </button>
              </div>
            </>
          )}
        </div>

        {/* ENGINE EXPLANATION */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Why engine selected this</div>
          <div style={styles.reason}>
            {path.lastUpdatedReason || "Initial path created from course modules."}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={styles.cardTitle}>Next Asset ID</div>
            <div style={{ opacity: 0.85 }}>{path.nextAssetId || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 4 },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  h1: { fontSize: 28, fontWeight: 900 },
  muted: { opacity: 0.75, marginTop: 6 },

  grid: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14 },

  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 16,
  },

  cardTitle: { fontWeight: 900, marginBottom: 10 },
  assetTitle: { fontSize: 18, fontWeight: 900, marginTop: 6 },

  metaRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 },

  pill: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
  },

  reason: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 12,
    lineHeight: 1.4,
  },

  btn: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e9eefc",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
  },

  btnPrimary: {
    background: "#7c3aed",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
  },

  btnGhost: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#e9eefc",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
