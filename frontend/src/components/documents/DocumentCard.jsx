import React, { useState } from "react";
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

  const navigate = useNavigate();

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
    // already fetched → toggle only
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
        {/* Left Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
              {doc.title}
            </h2>
            {statusBadge()}
          </div>

          <p className="text-sm font-semibold text-gray-700">{doc.subject}</p>

          <p className="text-xs text-gray-500 font-medium">
            {doc.documentType?.toUpperCase()} • Semester: {doc.semester || "-"} •
            Year: {doc.year || "-"}
          </p>
        </div>

        {/* Right Actions */}
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
        {/* Open File */}
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition"
        >
          📄 Open File
        </a>

        {/* OCR Button */}
        {!isProcessed && (
          <button
            onClick={handleStartOCR}
            disabled={ocrLoading}
            className={`px-4 py-2 rounded-2xl font-bold text-white transition shadow-sm
              ${
                ocrLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : isFailed
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {ocrLoading
              ? "Running OCR..."
              : isFailed
              ? "Retry OCR"
              : "Start OCR"}
          </button>
        )}

        {/* OCR Done Badge */}
        {isProcessed && (
          <span className="px-4 py-2 rounded-2xl bg-green-50 text-green-700 font-bold border border-green-200">
            OCR Done ✅
          </span>
        )}

        {/* Explain Button */}
        {isProcessed && (
          <button
            onClick={handleExplain}
            disabled={explainLoading}
            className={`px-4 py-2 rounded-2xl font-bold text-white transition shadow-sm
              ${
                explainLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
          >
            {explainLoading
              ? "Loading..."
              : showExplain
              ? "Hide Explain"
              : "Explain ✨"}
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-gray-900">
                  🤖 AI Explanation
                </h3>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Smart Notes
                </span>
              </div>

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
