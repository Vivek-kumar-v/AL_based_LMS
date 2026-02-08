import React, { useState } from "react";
import {
  deleteDocumentApi,
  processOCRApi,
  getDocumentLLMTextApi,
} from "../../api/documentApi";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


const DocumentCard = ({ doc, onDelete, onOCRDone }) => {
  const [ocrLoading, setOcrLoading] = useState(false);

  // ✅ explain states
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
    // if already fetched, just toggle
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

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h2 className="text-lg font-bold">{doc.title}</h2>
          <p className="text-sm text-gray-600">{doc.subject}</p>
          <p className="text-xs text-gray-400">
            {doc.documentType.toUpperCase()} • Semester: {doc.semester || "-"} •
            Year: {doc.year || "-"}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/documents/edit/${doc._id}`)}
            className="text-blue-600 font-semibold"
          >
            Edit
          </button>

          <button onClick={handleDelete} className="text-red-600 font-semibold">
            Delete
          </button>
        </div>
      </div>

      {/* STATUS */}
      <div className="mt-2 text-sm">
        <span className="text-gray-500">OCR Status: </span>

        {status === "pending" && (
          <span className="font-semibold text-yellow-600">Pending</span>
        )}

        {status === "processed" && (
          <span className="font-semibold text-green-600">Processed ✅</span>
        )}

        {status === "failed" && (
          <span className="font-semibold text-red-600">Failed ❌</span>
        )}
      </div>

      <div className="mt-3 flex gap-4 items-center flex-wrap">
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="underline text-blue-600 text-sm"
        >
          Open File
        </a>

        {/* OCR */}
        {!isProcessed && (
          <button
            onClick={handleStartOCR}
            disabled={ocrLoading}
            className={`text-sm font-semibold px-3 py-1 rounded text-white ${
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

        {isProcessed && (
          <span className="text-sm font-semibold px-3 py-1 rounded bg-green-100 text-green-700">
            OCR Done
          </span>
        )}

        {/* ✅ EXPLAIN BUTTON (ONLY IF PROCESSED) */}
        {isProcessed && (
          <button
            onClick={handleExplain}
            disabled={explainLoading}
            className={`text-sm font-semibold px-3 py-1 rounded text-white ${
              explainLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {explainLoading
              ? "Loading..."
              : showExplain
              ? "Hide Explain"
              : "Explain"}
          </button>
        )}
      </div>

      {/* ✅ SHOW LLM TEXT */}
      {isProcessed && showExplain && (
        <div className="mt-4 border rounded-lg p-3 bg-gray-50">
          <h3 className="font-semibold mb-2 text-gray-800">
            Explanation (AI)
          </h3>

          <div className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {llmText || "No explanation available."}
            </ReactMarkdown>
          </div>

        </div>
      )}
    </div>
  );
};

export default DocumentCard;
