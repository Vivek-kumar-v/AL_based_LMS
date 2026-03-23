import React, { useState, useEffect } from "react";
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

  // 🔊 speech state
  const [isSpeaking, setIsSpeaking] = useState(false);

  const navigate = useNavigate();

  // 🔊 stop speech on unmount (important!)
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

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

  // 🔊 TEXT TO SPEECH FUNCTION
  const handleSpeak = () => {
    if (!llmText) return;

    // stop if already speaking
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // cancel any previous speech
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(llmText);

    speech.lang = "en-US";
    speech.rate = 1;

    speech.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(speech);
    setIsSpeaking(true);
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

        <div className="flex gap-2 md:gap-3 flex-wrap">
          <button
            onClick={() => navigate(`/documents/edit/${doc._id}`)}
            className="px-4 py-2 rounded-2xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100"
          >
            ✏️ Edit
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-2xl bg-red-50 text-red-700 font-bold hover:bg-red-100"
          >
            🗑 Delete
          </button>
        </div>
      </div>

      {/* BUTTON ROW */}
      <div className="mt-5 flex gap-3 flex-wrap">
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-2xl bg-gray-100 font-bold"
        >
          📄 Open File
        </a>

        {!isProcessed && (
          <button
            onClick={handleStartOCR}
            disabled={ocrLoading}
            className={`px-4 py-2 rounded-2xl font-bold text-white ${
              ocrLoading
                ? "bg-gray-400"
                : isFailed
                ? "bg-red-600"
                : "bg-green-600"
            }`}
          >
            {ocrLoading
              ? "Running OCR..."
              : isFailed
              ? "Retry OCR"
              : "Start OCR"}
          </button>
        )}

        {isProcessed && (
          <span className="px-4 py-2 rounded-2xl bg-green-50 text-green-700 font-bold">
            OCR Done ✅
          </span>
        )}

        {isProcessed && (
          <button
            onClick={handleExplain}
            disabled={explainLoading}
            className="px-4 py-2 rounded-2xl font-bold text-white bg-purple-600"
          >
            {explainLoading
              ? "Loading..."
              : showExplain
              ? "Hide Explain"
              : "Explain ✨"}
          </button>
        )}
      </div>

      {/* EXPLANATION */}
      <AnimatePresence>
        {isProcessed && showExplain && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="mt-5"
          >
            <div className="rounded-3xl border bg-gray-50 p-4">
              
              {/* HEADER WITH SPEAK BUTTON */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-gray-900">
                  🤖 AI Explanation
                </h3>

                <button
                  onClick={handleSpeak}
                  className={`px-3 py-1 rounded-full text-xs font-bold border
                    ${
                      isSpeaking
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                >
                  {isSpeaking ? "⏹ Stop" : "🔊 Read"}
                </button>
              </div>

              <div className="max-h-[320px] overflow-y-auto bg-white p-4 rounded-xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {llmText || "No explanation available."}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DocumentCard;