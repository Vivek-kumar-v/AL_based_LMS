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

const DocumentCard = ({ doc, onDelete, onOCRDone }) => {
  const [ocrLoading, setOcrLoading] = useState(false);

  // explain states
  const [explainLoading, setExplainLoading] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [llmText, setLlmText] = useState("");

  // TTS states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const utteranceRef = useRef(null);

  const navigate = useNavigate();

  // Check TTS support on mount
  useEffect(() => {
    setTtsSupported("speechSynthesis" in window);
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Strip markdown syntax for clean TTS reading
  const stripMarkdown = (text) => {
    return text
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/[-*+]\s+/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .trim();
  };

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

    const cleanText = stripMarkdown(llmText || "No explanation available.");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
  };

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
    if (showExplain) {
      handleStopSpeech();
    }

    if (llmText) {
      setShowExplain((prev) => !prev);
      return;
    }

    try {
      setExplainLoading(true);
      const res = await getDocumentLLMTextApi(doc._id);
      const text = res?.data?.data?.llmText || "";
      setLlmText(text);
      setShowExplain(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to fetch explanation");
    } finally {
      setExplainLoading(false);
    }
  };

  const status = doc?.processingStatus || "pending";
  const isProcessed = status === "processed";
  const isFailed = status === "failed";

  const statusBadge = () => {
    if (status === "processed") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
          Processed ✅
        </span>
      );
    }
    if (status === "failed") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
          Failed ❌
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
        Pending ⏳
      </span>
    );
  };

  const ttsButtonLabel = () => {
    if (isSpeaking) return "⏸ Pause";
    if (isPaused) return "▶️ Resume";
    return "🔊 Read Aloud";
  };

  const ttsButtonClass = () => {
    const base = "px-4 py-2 rounded-2xl font-bold text-white transition shadow-sm flex items-center gap-2";
    if (isSpeaking) return `${base} bg-amber-500 hover:bg-amber-600`;
    if (isPaused) return `${base} bg-blue-500 hover:bg-blue-600`;
    return `${base} bg-teal-600 hover:bg-teal-700`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition p-5"
    >
      {/* TOP SECTION */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
              {doc.title}
            </h2>
            {statusBadge()}
          </div>

          <p className="text-sm font-semibold text-gray-700">{doc.subject}</p>

          {doc?.uploadedBy && (
            <div className="flex items-center gap-2 mt-2">
              <img
                src={
                  doc.uploadedBy.avatar ||
                  `https://ui-avatars.com/api/?name=${doc.uploadedBy.fullName || "User"}`
                }
                alt="uploader"
                className="w-7 h-7 rounded-full object-cover border border-gray-300"
              />
              <p className="text-xs font-bold text-gray-700">
                Uploaded by{" "}
                <span className="text-blue-600">
                  {doc.uploadedBy.fullName || "Unknown"}
                </span>
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 font-medium">
            {doc.documentType?.toUpperCase()} • Semester: {doc.semester || "-"} •
            Year: {doc.year || "-"}
          </p>
        </div>

        <div className="flex gap-2 md:gap-3 flex-wrap justify-start md:justify-end">
          <button
            onClick={() => navigate(`/documents/edit/${doc._id}`)}
            className="px-4 py-2 rounded-2xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition"
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-2xl bg-red-50 text-red-700 font-bold hover:bg-red-100 transition"
          >
            🗑 Delete
          </button>
        </div>
      </div>

      {/* BUTTON ROW */}
      <div className="mt-5 flex gap-3 items-center flex-wrap">
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition"
        >
          📄 Open File
        </a>

        {!isProcessed && (
          <button
            onClick={handleStartOCR}
            disabled={ocrLoading}
            className={`px-4 py-2 rounded-2xl font-bold text-white transition shadow-sm
              ${ocrLoading
                ? "bg-gray-400 cursor-not-allowed"
                : isFailed
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {ocrLoading ? "Running OCR..." : isFailed ? "Retry OCR" : "Start OCR"}
          </button>
        )}

        {isProcessed && (
          <span className="px-4 py-2 rounded-2xl bg-green-50 text-green-700 font-bold border border-green-200">
            OCR Done ✅
          </span>
        )}

        {isProcessed && (
          <button
            onClick={handleExplain}
            disabled={explainLoading}
            className={`px-4 py-2 rounded-2xl font-bold text-white transition shadow-sm
              ${explainLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
              }`}
          >
            {explainLoading ? "Loading..." : showExplain ? "Hide Explain" : "Explain ✨"}
          </button>
        )}
      </div>

      {/* EXPLANATION SECTION */}
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
              {/* Header row */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-extrabold text-gray-900">🤖 AI Explanation</h3>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Smart Notes
                  </span>

                  {/* TTS Controls */}
                  {ttsSupported && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSpeak}
                        className={ttsButtonClass()}
                        title={ttsButtonLabel()}
                      >
                        {ttsButtonLabel()}
                      </button>

                      <AnimatePresence>
                        {(isSpeaking || isPaused) && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={handleStopSpeech}
                            className="px-4 py-2 rounded-2xl font-bold text-white bg-gray-500 hover:bg-gray-600 transition shadow-sm"
                            title="Stop reading"
                          >
                            ⏹ Stop
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* Status banners */}
              <AnimatePresence>
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3"
                  >
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200">
                      <div className="flex items-end gap-0.5 h-4">
                        {[1, 2, 3, 4, 3].map((h, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-teal-500 rounded-full"
                            animate={{ scaleY: [0.4, 1, 0.4] }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.15,
                              ease: "easeInOut",
                            }}
                            style={{ height: `${h * 4}px`, originY: 1 }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-teal-700">
                        Reading aloud…
                      </span>
                    </div>
                  </motion.div>
                )}

                {isPaused && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3"
                  >
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-xs font-bold text-amber-700">
                        ⏸ Paused — click Resume to continue
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Markdown content */}
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