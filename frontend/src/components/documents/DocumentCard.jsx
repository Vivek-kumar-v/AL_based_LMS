import React, { useState, useRef, useEffect } from "react";
import {
  deleteDocumentApi,
  processOCRApi,
  getDocumentLLMTextApi,
} from "../../api/documentApi";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

// ─── Voice presets shown in the picker ───────────────────────────────────────
const VOICE_PRESETS = [
  {
    id: "default",
    label: "Default",
    emoji: "🎙️",
    color: "teal",
    rate: 0.95,
    pitch: 1.0,
    langHint: "",
  },
  {
    id: "slow",
    label: "Slow & Clear",
    emoji: "🐢",
    color: "blue",
    rate: 0.65,
    pitch: 0.95,
    langHint: "en",
  },
  {
    id: "fast",
    label: "Fast",
    emoji: "⚡",
    color: "orange",
    rate: 1.5,
    pitch: 1.0,
    langHint: "en",
  },
  {
    id: "deep",
    label: "Deep",
    emoji: "🎸",
    color: "purple",
    rate: 0.85,
    pitch: 0.5,
    langHint: "en",
  },
  {
    id: "high",
    label: "High Pitch",
    emoji: "🎵",
    color: "pink",
    rate: 1.0,
    pitch: 2.0,
    langHint: "en",
  },
  {
    id: "robot",
    label: "Robot",
    emoji: "🤖",
    color: "gray",
    rate: 1.1,
    pitch: 0.1,
    langHint: "",
  },
];

// colour map → Tailwind classes
const COLOR = {
  teal:   { btn: "bg-teal-600 hover:bg-teal-700",   ring: "ring-teal-400",   badge: "bg-teal-50 text-teal-700 border-teal-200"   },
  blue:   { btn: "bg-blue-600 hover:bg-blue-700",   ring: "ring-blue-400",   badge: "bg-blue-50 text-blue-700 border-blue-200"   },
  orange: { btn: "bg-orange-500 hover:bg-orange-600", ring: "ring-orange-400", badge: "bg-orange-50 text-orange-700 border-orange-200" },
  purple: { btn: "bg-purple-600 hover:bg-purple-700", ring: "ring-purple-400", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  pink:   { btn: "bg-pink-500 hover:bg-pink-600",   ring: "ring-pink-400",   badge: "bg-pink-50 text-pink-700 border-pink-200"   },
  gray:   { btn: "bg-gray-600 hover:bg-gray-700",   ring: "ring-gray-400",   badge: "bg-gray-100 text-gray-700 border-gray-300"  },
};

const DocumentCard = ({ doc, onDelete, onOCRDone }) => {
  const [ocrLoading, setOcrLoading] = useState(false);

  // explain states
  const [explainLoading, setExplainLoading] = useState(false);
  const [showExplain, setShowExplain]       = useState(false);
  const [llmText, setLlmText]               = useState("");

  // TTS states
  const [isSpeaking, setIsSpeaking]         = useState(false);
  const [isPaused, setIsPaused]             = useState(false);
  const [ttsSupported, setTtsSupported]     = useState(false);
  const [voices, setVoices]                 = useState([]);          // system voices
  const [selectedPreset, setSelectedPreset] = useState("default");   // preset id
  const [selectedVoiceIdx, setSelectedVoiceIdx] = useState(null);    // index into `voices`
  const [showVoicePicker, setShowVoicePicker]   = useState(false);
  const [speed, setSpeed]   = useState(1.0);   // user fine-tune
  const [pitch, setPitch]   = useState(1.0);
  const utteranceRef = useRef(null);

  const navigate = useNavigate();

  // ── load voices (async on some browsers) ──────────────────────────────────
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    setTtsSupported(true);

    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) setVoices(v);
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  // ── strip markdown for clean reading ──────────────────────────────────────
  const stripMarkdown = (text) =>
    text
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/[-*+]\s+/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .trim();

  // ── helpers ───────────────────────────────────────────────────────────────
  const activePreset = VOICE_PRESETS.find((p) => p.id === selectedPreset);

  const buildUtterance = (text) => {
    const u = new SpeechSynthesisUtterance(text);

    // apply preset base, then user sliders override
    u.rate  = speed;
    u.pitch = pitch;
    u.volume = 1;

    // pick system voice
    if (selectedVoiceIdx !== null && voices[selectedVoiceIdx]) {
      u.voice = voices[selectedVoiceIdx];
    } else if (activePreset.langHint) {
      const match = voices.find((v) =>
        v.lang.startsWith(activePreset.langHint)
      );
      if (match) u.voice = match;
    }

    return u;
  };

  // ── TTS controls ──────────────────────────────────────────────────────────
  const handleSpeak = () => {
    if (!ttsSupported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const clean = stripMarkdown(llmText || "No explanation available.");
    const utterance = buildUtterance(clean);

    utterance.onstart = () => { setIsSpeaking(true);  setIsPaused(false); };
    utterance.onend   = () => { setIsSpeaking(false); setIsPaused(false); utteranceRef.current = null; };
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); utteranceRef.current = null; };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
  };

  // apply preset → also reset sliders to preset defaults
  const applyPreset = (preset) => {
    setSelectedPreset(preset.id);
    setSpeed(preset.rate);
    setPitch(preset.pitch);
    setSelectedVoiceIdx(null); // reset manual voice pick
  };

  // ── doc helpers ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm("Delete this document?")) return;
    try {
      await deleteDocumentApi(doc._id);
      onDelete(doc._id);
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleStartOCR = async () => {
    try {
      setOcrLoading(true);
      await processOCRApi(doc._id);
      alert("OCR completed successfully 🎉");
      onOCRDone?.();
    } catch (err) {
      alert(err?.response?.data?.message || "OCR failed");
      onOCRDone?.();
    } finally {
      setOcrLoading(false);
    }
  };

  const handleExplain = async () => {
    if (showExplain) handleStop();
    if (llmText) { setShowExplain((p) => !p); return; }
    try {
      setExplainLoading(true);
      const res = await getDocumentLLMTextApi(doc._id);
      setLlmText(res?.data?.data?.llmText || "");
      setShowExplain(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to fetch explanation");
    } finally {
      setExplainLoading(false);
    }
  };

  const status      = doc?.processingStatus || "pending";
  const isProcessed = status === "processed";
  const isFailed    = status === "failed";

  const statusBadge = () => {
    if (status === "processed")
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Processed ✅</span>;
    if (status === "failed")
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Failed ❌</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">Pending ⏳</span>;
  };

  const playBtnLabel = isSpeaking ? "⏸ Pause" : isPaused ? "▶️ Resume" : "🔊 Read Aloud";
  const playBtnClass = `px-4 py-2 rounded-2xl font-bold text-white transition shadow-sm ${
    isSpeaking ? "bg-amber-500 hover:bg-amber-600" : isPaused ? "bg-blue-500 hover:bg-blue-600" : COLOR[activePreset.color].btn
  }`;

  // english-ish voices for the "system voices" dropdown
  const engVoices = voices.filter((v) => v.lang.startsWith("en"));

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition p-5"
    >
      {/* ── TOP SECTION ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">{doc.title}</h2>
            {statusBadge()}
          </div>
          <p className="text-sm font-semibold text-gray-700">{doc.subject}</p>
          {doc?.uploadedBy && (
            <div className="flex items-center gap-2 mt-2">
              <img
                src={doc.uploadedBy.avatar || `https://ui-avatars.com/api/?name=${doc.uploadedBy.fullName || "User"}`}
                alt="uploader"
                className="w-7 h-7 rounded-full object-cover border border-gray-300"
              />
              <p className="text-xs font-bold text-gray-700">
                Uploaded by <span className="text-blue-600">{doc.uploadedBy.fullName || "Unknown"}</span>
              </p>
            </div>
          )}
          <p className="text-xs text-gray-500 font-medium">
            {doc.documentType?.toUpperCase()} • Semester: {doc.semester || "-"} • Year: {doc.year || "-"}
          </p>
        </div>

        <div className="flex gap-2 md:gap-3 flex-wrap justify-start md:justify-end">
          <button onClick={() => navigate(`/documents/edit/${doc._id}`)} className="px-4 py-2 rounded-2xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition">✏️ Edit</button>
          <button onClick={handleDelete} className="px-4 py-2 rounded-2xl bg-red-50 text-red-700 font-bold hover:bg-red-100 transition">🗑 Delete</button>
        </div>
      </div>

      {/* ── BUTTON ROW ── */}
      <div className="mt-5 flex gap-3 items-center flex-wrap">
        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition">📄 Open File</a>

        {!isProcessed && (
          <button onClick={handleStartOCR} disabled={ocrLoading}
            className={`px-4 py-2 rounded-2xl font-bold text-white transition shadow-sm ${ocrLoading ? "bg-gray-400 cursor-not-allowed" : isFailed ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}>
            {ocrLoading ? "Running OCR..." : isFailed ? "Retry OCR" : "Start OCR"}
          </button>
        )}

        {isProcessed && (
          <span className="px-4 py-2 rounded-2xl bg-green-50 text-green-700 font-bold border border-green-200">OCR Done ✅</span>
        )}

        {isProcessed && (
          <button onClick={handleExplain} disabled={explainLoading}
            className={`px-4 py-2 rounded-2xl font-bold text-white transition shadow-sm ${explainLoading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}>
            {explainLoading ? "Loading..." : showExplain ? "Hide Explain" : "Explain ✨"}
          </button>
        )}
      </div>

      {/* ── EXPLANATION SECTION ── */}
      <AnimatePresence>
        {isProcessed && showExplain && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-5 overflow-hidden"
          >
            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">

              {/* header */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-extrabold text-gray-900">🤖 AI Explanation</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Smart Notes</span>
              </div>

              {/* ── VOICE PICKER PANEL ── */}
              {ttsSupported && (
                <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-3">
                  {/* Row 1: preset chips */}
                  <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">🎚️ Voice Style</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {VOICE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => applyPreset(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition
                          ${selectedPreset === p.id
                            ? `${COLOR[p.color].badge} border ring-2 ${COLOR[p.color].ring}`
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          }`}
                      >
                        {p.emoji} {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Row 2: sliders + system voice */}
                  <button
                    onClick={() => setShowVoicePicker((p) => !p)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700 underline underline-offset-2 mb-2 block"
                  >
                    {showVoicePicker ? "▲ Hide advanced" : "▼ Advanced settings"}
                  </button>

                  <AnimatePresence>
                    {showVoicePicker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {/* Speed slider */}
                          <div>
                            <label className="text-xs font-bold text-gray-600 flex justify-between mb-1">
                              <span>⚡ Speed</span>
                              <span className="text-gray-400">{speed.toFixed(2)}×</span>
                            </label>
                            <input type="range" min="0.5" max="2" step="0.05" value={speed}
                              onChange={(e) => setSpeed(parseFloat(e.target.value))}
                              className="w-full accent-teal-500 cursor-pointer" />
                          </div>

                          {/* Pitch slider */}
                          <div>
                            <label className="text-xs font-bold text-gray-600 flex justify-between mb-1">
                              <span>🎵 Pitch</span>
                              <span className="text-gray-400">{pitch.toFixed(2)}</span>
                            </label>
                            <input type="range" min="0" max="2" step="0.05" value={pitch}
                              onChange={(e) => setPitch(parseFloat(e.target.value))}
                              className="w-full accent-purple-500 cursor-pointer" />
                          </div>

                          {/* System voice dropdown */}
                          {engVoices.length > 0 && (
                            <div className="sm:col-span-2">
                              <label className="text-xs font-bold text-gray-600 mb-1 block">🗣️ System Voice</label>
                              <select
                                value={selectedVoiceIdx ?? ""}
                                onChange={(e) => setSelectedVoiceIdx(e.target.value === "" ? null : parseInt(e.target.value))}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                              >
                                <option value="">— Auto (preset default) —</option>
                                {voices.map((v, i) => (
                                  <option key={i} value={i}>
                                    {v.name} ({v.lang})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── PLAYBACK CONTROLS ── */}
              {ttsSupported && (
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <button onClick={handleSpeak} className={playBtnClass}>{playBtnLabel}</button>

                  <AnimatePresence>
                    {(isSpeaking || isPaused) && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleStop}
                        className="px-4 py-2 rounded-2xl font-bold text-white bg-gray-500 hover:bg-gray-600 transition shadow-sm"
                      >
                        ⏹ Stop
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* active voice badge */}
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${COLOR[activePreset.color].badge}`}>
                    {activePreset.emoji} {activePreset.label}
                    {selectedVoiceIdx !== null && voices[selectedVoiceIdx]
                      ? ` · ${voices[selectedVoiceIdx].name.split(" ")[0]}`
                      : ""}
                  </span>
                </div>
              )}

              {/* status banners */}
              <AnimatePresence>
                {isSpeaking && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200">
                      <div className="flex items-end gap-0.5 h-4">
                        {[1, 2, 3, 4, 3].map((h, i) => (
                          <motion.div key={i} className="w-1 bg-teal-500 rounded-full"
                            animate={{ scaleY: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                            style={{ height: `${h * 4}px`, originY: 1 }} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-teal-700">Reading aloud…</span>
                    </div>
                  </motion.div>
                )}
                {isPaused && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-xs font-bold text-amber-700">⏸ Paused — click Resume to continue</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* markdown content */}
              <div className="max-h-[320px] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4">
                <div className="prose max-w-none prose-headings:font-extrabold prose-p:text-gray-700 prose-strong:text-gray-900">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {llmText || "No explanation available."}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DocumentCard;