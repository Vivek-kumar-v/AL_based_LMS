import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDashboardApi } from "../../api/dashboardApi";
import { useAuth } from "../../hooks/useAuth";

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .dash-root {
    --bg: #0d0f14;
    --surface: #13151c;
    --surface-2: #1a1d27;
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.15);
    --text: #f0efe8;
    --text-muted: #7a7d8a;
    --accent: #c8f560;
    --accent-dim: rgba(200,245,96,0.12);
    --red: #ff6b6b;
    --red-dim: rgba(255,107,107,0.12);
    --blue: #7eb3ff;
    --blue-dim: rgba(126,179,255,0.12);
    --gold: #f5c842;
    --gold-dim: rgba(245,200,66,0.12);
    --green: #52d98a;
    --green-dim: rgba(82,217,138,0.12);
    font-family: 'DM Sans', sans-serif;
  }

  .dash-root * { box-sizing: border-box; }

  .dash-bg {
    min-height: 100vh;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse 60% 40% at 80% 10%, rgba(200,245,96,0.04) 0%, transparent 60%),
      radial-gradient(ellipse 50% 50% at 10% 90%, rgba(126,179,255,0.04) 0%, transparent 60%);
    padding: 40px 24px 60px;
  }

  .dash-max { max-width: 1080px; margin: 0 auto; }

  /* ── Header ── */
  .dash-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 40px;
    gap: 16px;
    flex-wrap: wrap;
  }
  .dash-greeting {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(2rem, 4vw, 3.2rem);
    color: var(--text);
    line-height: 1.1;
    margin: 0;
  }
  .dash-greeting em {
    font-style: italic;
    color: var(--accent);
  }
  .dash-sub {
    color: var(--text-muted);
    font-size: 14px;
    margin: 8px 0 0;
    font-weight: 300;
    letter-spacing: 0.02em;
  }
  .dash-date-pill {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 10px 18px;
    white-space: nowrap;
  }
  .dash-date-pill .label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
  .dash-date-pill .value { font-size: 14px; color: var(--text); font-weight: 500; margin-top: 2px; }

  /* ── Divider ── */
  .dash-divider {
    height: 1px;
    background: var(--border);
    margin-bottom: 32px;
  }

  /* ── Summary Cards ── */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 32px;
  }
  @media (max-width: 700px) { .summary-grid { grid-template-columns: repeat(2,1fr); } }

  .summary-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 20px;
    cursor: default;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, background 0.2s;
  }
  .summary-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--glow, transparent);
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: inherit;
  }
  .summary-card:hover { border-color: var(--border-hover); }
  .summary-card:hover::before { opacity: 1; }

  .sc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .sc-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); }
  .sc-icon {
    width: 34px; height: 34px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    background: var(--icon-bg, var(--surface-2));
  }
  .sc-value {
    font-family: 'Instrument Serif', serif;
    font-size: 2.8rem;
    color: var(--text);
    line-height: 1;
  }
  .sc-footer { font-size: 11px; color: var(--text-muted); margin-top: 6px; }

  /* ── 2-col section ── */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  @media (max-width: 700px) { .two-col { grid-template-columns: 1fr; } }

  /* ── Panel ── */
  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 24px;
  }
  .panel-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
  }
  .panel-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.25rem;
    color: var(--text);
    margin: 0;
  }
  .badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
  }

  /* ── Concept Row (Weak Concepts) ── */
  .concept-row {
    border-bottom: 1px solid var(--border);
    padding: 12px 0;
  }
  .concept-row:last-child { border-bottom: none; padding-bottom: 0; }
  .concept-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .concept-name { font-size: 13px; font-weight: 500; color: var(--text); }
  .concept-score { font-size: 13px; font-weight: 700; color: var(--red); font-variant-numeric: tabular-nums; }
  .progress-track {
    width: 100%; height: 3px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;
  }
  .progress-fill { height: 100%; border-radius: 4px; }

  /* ── PYQ Row ── */
  .pyq-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  .pyq-row:last-child { border-bottom: none; }
  .pyq-name { font-size: 13px; font-weight: 500; color: var(--text); }
  .pyq-badge {
    font-size: 10px;
    font-weight: 700;
    color: var(--blue);
    background: var(--blue-dim);
    padding: 3px 10px;
    border-radius: 20px;
    letter-spacing: 0.04em;
  }

  /* ── Revision Cards ── */
  .revision-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 500px) { .revision-grid { grid-template-columns: 1fr; } }
  .revision-card {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 14px 16px;
    cursor: default;
    transition: border-color 0.2s, background 0.2s;
  }
  .revision-card:hover { border-color: var(--border-hover); background: rgba(255,255,255,0.03); }
  .revision-name { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 6px; line-height: 1.4; }
  .revision-time { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 5px; }
  .revision-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); flex-shrink: 0; }

  /* ── Empty State ── */
  .empty-state {
    padding: 28px;
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 16px;
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
  }

  /* ── Skeleton ── */
  .skel {
    background: linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 20px;
  }
  @keyframes shimmer { to { background-position: -200% 0; } }
`;

/* ─── Animation variants ─────────────────────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { student } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getDashboardApi();
        setData(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="dash-root dash-bg">
          <div className="dash-max">
            <div className="skel" style={{ height: 56, width: 300, marginBottom: 40 }} />
            <div className="summary-grid" style={{ marginBottom: 32 }}>
              {[1,2,3,4].map(i => <div key={i} className="skel" style={{ height: 110 }} />)}
            </div>
            <div className="two-col">
              {[1,2].map(i => <div key={i} className="skel" style={{ height: 300 }} />)}
            </div>
            <div className="skel" style={{ height: 280, marginTop: 20 }} />
          </div>
        </div>
      </>
    );
  }

  const firstName = student?.fullName?.split(" ")[0] || "Student";

  return (
    <>
      <style>{styles}</style>
      <div className="dash-root dash-bg">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="dash-max"
        >
          {/* Header */}
          <motion.div variants={item} className="dash-header">
            <div>
              <h1 className="dash-greeting">
                Hello, <em>{firstName}</em>
              </h1>
              <p className="dash-sub">Track your progress, revisions, and weak areas — all in one place.</p>
            </div>
            <div className="dash-date-pill">
              <div className="label">Today</div>
              <div className="value">{new Date().toDateString()}</div>
            </div>
          </motion.div>

          <motion.div variants={item} className="dash-divider" />

          {/* Summary Cards */}
          <motion.div variants={container} className="summary-grid">
            <SummaryCard
              title="Uploads"
              value={data?.summary?.totalUploads}
              icon="↑"
              accent="var(--accent)"
              glowColor="rgba(200,245,96,0.06)"
              iconBg="var(--accent-dim)"
              variants={item}
            />
            <SummaryCard
              title="Searches"
              value={data?.summary?.totalSearches}
              icon="◎"
              accent="var(--blue)"
              glowColor="rgba(126,179,255,0.06)"
              iconBg="var(--blue-dim)"
              variants={item}
            />
            <SummaryCard
              title="AI Queries"
              value={data?.summary?.totalAIQueries}
              icon="⬡"
              accent="var(--gold)"
              glowColor="rgba(245,200,66,0.06)"
              iconBg="var(--gold-dim)"
              variants={item}
            />
            <SummaryCard
              title="Revisions"
              value={data?.summary?.totalRevisions}
              icon="◈"
              accent="var(--green)"
              glowColor="rgba(82,217,138,0.06)"
              iconBg="var(--green-dim)"
              variants={item}
            />
          </motion.div>

          {/* 2-col */}
          <div className="two-col">
            {/* Weak Concepts */}
            <motion.div variants={item} className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Weak Concepts</h2>
                <span
                  className="badge"
                  style={{ color: "var(--red)", background: "var(--red-dim)" }}
                >
                  Needs Work
                </span>
              </div>
              {!data?.weakConcepts?.length ? (
                <div className="empty-state">No weak concepts yet. Keep going 🔥</div>
              ) : (
                data.weakConcepts.slice(0, 6).map((c) => (
                  <div key={c._id} className="concept-row">
                    <div className="concept-top">
                      <span className="concept-name">{c?.conceptId?.displayName}</span>
                      <span className="concept-score">{c?.strengthScore}%</span>
                    </div>
                    <div className="progress-track">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c?.strengthScore || 0}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="progress-fill"
                        style={{ background: `linear-gradient(90deg, var(--red), rgba(255,107,107,0.5))` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </motion.div>

            {/* PYQ Concepts */}
            <motion.div variants={item} className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Repeated PYQ Topics</h2>
                <span
                  className="badge"
                  style={{ color: "var(--blue)", background: "var(--blue-dim)" }}
                >
                  High Priority
                </span>
              </div>
              {!data?.mostRepeatedPYQConcepts?.length ? (
                <div className="empty-state">No PYQ concepts yet 📚</div>
              ) : (
                data.mostRepeatedPYQConcepts.slice(0, 6).map((c) => (
                  <div key={c._id} className="pyq-row">
                    <span className="pyq-name">{c?.displayName}</span>
                    <span className="pyq-badge">{c?.frequencyInPYQ}×</span>
                  </div>
                ))
              )}
            </motion.div>
          </div>

          {/* Recent Revisions */}
          <motion.div variants={item} className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Recent Revisions</h2>
              <span
                className="badge"
                style={{ color: "var(--green)", background: "var(--green-dim)" }}
              >
                Last 7 Days
              </span>
            </div>
            {!data?.last7DaysRevisions?.length ? (
              <div className="empty-state">No revisions yet. Start revising today ✨</div>
            ) : (
              <div className="revision-grid">
                {data.last7DaysRevisions.slice(0, 8).map((r, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    className="revision-card"
                  >
                    <div className="revision-name">{r?.conceptId?.displayName}</div>
                    <div className="revision-time">
                      <span className="revision-dot" />
                      {new Date(r?.revisedAt).toLocaleString(undefined, {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

/* ─── Summary Card ───────────────────────────────────────────────────────── */
const SummaryCard = ({ title, value, icon, accent, glowColor, iconBg, variants }) => (
  <motion.div
    variants={variants}
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ duration: 0.2 }}
    className="summary-card"
    style={{ "--glow": `radial-gradient(80% 80% at 50% 120%, ${glowColor} 0%, transparent 100%)` }}
  >
    <div className="sc-top">
      <span className="sc-label">{title}</span>
      <div className="sc-icon" style={{ background: iconBg, color: accent }}>
        {icon}
      </div>
    </div>
    <div className="sc-value" style={{ color: accent }}>{value ?? 0}</div>
    <div className="sc-footer">All time total</div>
  </motion.div>
);

export default Dashboard;