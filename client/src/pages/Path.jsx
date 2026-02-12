import { useEffect, useState } from "react";
import { api } from "../services/api";

const isDone = (s) => s === "completed" || s === "done";

export default function Path() {
  const [userId, setUserId] = useState("u-emp-01");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

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
  }, [userId]);

  if (loading) return <div style={{ padding: 8 }}>Loading path...</div>;
  if (err) return <div style={{ padding: 8, color: "crimson" }}>{err}</div>;
  if (!data) return <div style={{ padding: 8 }}>No data</div>;

  const { path } = data;
  const nodes = path?.nodes || [];

  return (
    <div style={styles.page}>
      <div style={styles.topRow}>
        <div>
          <div style={styles.h1}>Path</div>
          <div style={styles.muted}>See the full certification timeline and engine inserts.</div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Timeline</div>

        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {nodes.map((n, idx) => {
            const next = n.assetId === path.nextAssetId;
            const done = isDone(n.status);
            const tag = n.addedBy === "engine" ? "engine" : "course";

            return (
              <div
                key={`${n.assetId}-${idx}`}
                style={{
                  ...styles.node,
                  ...(next ? styles.nodeNext : {}),
                  ...(done ? styles.nodeDone : {}),
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, fontSize: 13 }}>
                    {idx + 1}. {n.assetId}
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.pill}>{n.status || "pending"}</span>
                    <span style={styles.pill}>{tag}</span>
                  </div>
                </div>

                {next ? <span style={styles.badge}>NEXT</span> : done ? <span style={styles.badgeDone}>DONE</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 4 },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  h1: { fontSize: 26, fontWeight: 900 },
  muted: { opacity: 0.75, marginTop: 6 },

  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  cardTitle: { fontWeight: 900 },

  node: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.10)",
  },
  nodeNext: { border: "1px solid rgba(124,58,237,0.9)", background: "rgba(124,58,237,0.18)" },
  nodeDone: { opacity: 0.75 },
  metaRow: { display: "flex", gap: 8, marginTop: 6 },

  pill: {
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  badge: {
    fontSize: 11,
    padding: "5px 10px",
    borderRadius: 999,
    background: "rgba(34,197,94,0.18)",
    border: "1px solid rgba(34,197,94,0.5)",
    fontWeight: 900,
  },
  badgeDone: {
    fontSize: 11,
    padding: "5px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    fontWeight: 900,
  },

  select: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e9eefc",
    padding: "10px 12px",
    borderRadius: 12,
  },
  btn: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e9eefc",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
  },
};
