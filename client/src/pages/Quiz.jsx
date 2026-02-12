import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Quiz() {
  const nav = useNavigate();
  const location = useLocation();

  // If coming from Dashboard button, these exist:
  const stateUserId = location.state?.userId;
  const stateAssetId = location.state?.assetId;
  const stateTopic = location.state?.topic;

  // For sidebar access (no state), we still want it to work:
  const [userId, setUserId] = useState(stateUserId || "u-emp-01");

  const [topic, setTopic] = useState(stateTopic || "");
  const [assetId, setAssetId] = useState(stateAssetId || "");

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // {questionId: selectedIndex}

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // backend response

  // --- helper: load quiz context even if opened from sidebar ---
  async function hydrateFromDashboardIfMissing() {
    if (topic && assetId) return;

    const dash = await api.getDashboard(userId);
    const next = dash?.nextAsset;

    if (!next) throw new Error("No next asset found. Go to dashboard and refresh.");

    setTopic(next.topic);
    setAssetId(next.assetId);
  }

  async function loadQuiz() {
    try {
      setLoading(true);
      setErr("");
      setResult(null);

      await hydrateFromDashboardIfMissing();

      // IMPORTANT: topic might just got set, so use latest via local variables
      const dash = await api.getDashboard(userId);
      const next = dash?.nextAsset;

      const finalTopic = stateTopic || topic || next?.topic;
      const finalAssetId = stateAssetId || assetId || next?.assetId;

      if (!finalTopic) throw new Error("Topic missing. Go to dashboard and start from there.");
      if (!finalAssetId) throw new Error("Asset missing. Go to dashboard and start from there.");

      setTopic(finalTopic);
      setAssetId(finalAssetId);

      const quizRes = await api.getQuiz(userId, finalTopic);
      setQuestions(quizRes.questions || []);
      setAnswers({});
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line
  }, [userId]);

  const canSubmit = useMemo(() => {
    if (!questions.length) return false;
    // require answering at least 1 question to submit (or all, your choice)
    return Object.keys(answers).length > 0;
  }, [questions, answers]);

  function choose(qid, idx) {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  }

  async function submit() {
    try {
      setSubmitting(true);
      setErr("");

      // quick validate
      if (!topic || !assetId) throw new Error("Missing topic/asset. Go back to dashboard and retry.");
      if (!Object.keys(answers).length) throw new Error("Answer at least 1 question.");

      const payload = {
        assetId,
        topic,
        timeSpentMin: 20, // demo default; later you can measure with timer
        answers, // { questionId: selectedIndex }
      };

      const res = await api.submitQuiz(userId, payload);

      // ✅ this must show correct next asset from backend
      setResult(res);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 10 }}>Loading quiz...</div>;
  }

  // --- UI ---
  return (
    <div style={styles.page}>
      <div style={styles.topRow}>
        <button style={styles.btn} onClick={() => nav(-1)}>
          ← Back
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} style={styles.select}>
            <option value="u-emp-01">Aarav Sharma</option>
            <option value="u-emp-02">Neha Patil</option>
          </select>

          <button style={styles.btn} onClick={loadQuiz}>
            Refresh Quiz
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={styles.h1}>Quiz</div>
        <div style={styles.muted}>
          Topic: <span style={styles.pill}>{topic || "—"}</span>{" "}
          Asset: <span style={styles.pill}>{assetId || "—"}</span>
        </div>
      </div>

      {err ? <div style={styles.err}>{err}</div> : null}

      {/* RESULT PANEL */}
      {result ? (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Result</div>
          <div style={{ display: "grid", gap: 8 }}>
            <div>
              Score: <b>{result.score}</b> (Correct {result.correctCount}/{result.total})
            </div>
            <div>
              Time ratio: <b>{result.timeRatio}</b>
            </div>
            <div>
              Next Asset: <b>{result.nextAssetId}</b>
            </div>
            <div style={styles.reason}>{result.reason}</div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={styles.btnPrimary} onClick={() => nav("/dashboard")}>
              Go to Dashboard
            </button>
            <button style={styles.btn} onClick={loadQuiz}>
              Try Again
            </button>
          </div>
        </div>
      ) : null}

      {/* QUESTIONS */}
      {!result ? (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Questions</div>

          {!questions.length ? (
            <div style={styles.muted}>No questions found for this topic. Seed questions for "{topic}".</div>
          ) : (
            <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
              {questions.map((q, idx) => (
                <div key={q.questionId} style={styles.qCard}>
                  <div style={{ fontWeight: 900 }}>
                    {idx + 1}. {q.prompt}
                  </div>

                  <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                    {(q.options || []).map((opt, optIdx) => {
                      const active = answers[q.questionId] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => choose(q.questionId, optIdx)}
                          style={{
                            ...styles.optBtn,
                            ...(active ? styles.optActive : {}),
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <button
              style={{ ...styles.btnPrimary, opacity: canSubmit && !submitting ? 1 : 0.6 }}
              disabled={!canSubmit || submitting}
              onClick={submit}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>

            <button style={styles.btn} onClick={() => nav("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  page: { padding: 4 },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  h1: { fontSize: 26, fontWeight: 900 },
  muted: { opacity: 0.75, marginTop: 6 },
  err: {
    background: "rgba(255,0,0,0.08)",
    border: "1px solid rgba(255,0,0,0.25)",
    color: "#ffb3b3",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },

  pill: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
  },

  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: { fontWeight: 900, marginBottom: 10 },

  qCard: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.12)",
  },

  optBtn: {
    textAlign: "left",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#e9eefc",
    cursor: "pointer",
  },
  optActive: {
    border: "1px solid rgba(124,58,237,0.9)",
    background: "rgba(124,58,237,0.18)",
    fontWeight: 900,
  },

  reason: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
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
  btnPrimary: {
    background: "#7c3aed",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
};
