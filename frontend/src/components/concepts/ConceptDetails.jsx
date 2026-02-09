import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getConceptByIdApi } from "../../api/conceptApi";
import { markConceptRevisedApi } from "../../api/revisionApi";

const ConceptDetails = () => {
  const { conceptId } = useParams();
  const navigate = useNavigate();

  const [concept, setConcept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revisionMessage, setRevisionMessage] = useState("");

  const fetchConcept = async () => {
    try {
      setLoading(true);
      setError("");
      setRevisionMessage("");

      // 1) Fetch concept
      const res = await getConceptByIdApi(conceptId);
      setConcept(res?.data?.concept || null);

      // 2) Mark as revised
      await markConceptRevisedApi(conceptId);
      setRevisionMessage("✅ Marked as revised");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch concept");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcept();
  }, [conceptId]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse mb-6" />
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 space-y-4">
            <div className="h-8 w-80 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-5 w-40 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            </div>

            <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto bg-white border border-red-200 rounded-3xl shadow-sm p-6">
          <p className="text-red-600 font-bold">❌ {error}</p>
          <button
            onClick={() => navigate("/concepts")}
            className="mt-4 px-5 py-2 rounded-2xl bg-black text-white font-bold hover:bg-gray-900 transition"
          >
            Back to Concepts
          </button>
        </div>
      </div>
    );
  }

  if (!concept) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
          <p className="text-gray-700 font-bold">Concept not found.</p>
          <button
            onClick={() => navigate("/concepts")}
            className="mt-4 px-5 py-2 rounded-2xl bg-black text-white font-bold hover:bg-gray-900 transition"
          >
            Back to Concepts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Concept Details 🧠
            </h1>
            <p className="text-gray-600 mt-1">
              Learn it, revise it, and track your progress.
            </p>
          </div>

          <Link
            to="/concepts"
            className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition w-fit"
          >
            ← Back
          </Link>
        </div>

        {/* Revision Message */}
        <AnimatePresence>
          {revisionMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 font-bold"
            >
              {revisionMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-lg p-6 md:p-8"
        >
          {/* Title */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                {concept?.displayName || concept?.name}
              </h2>

              <p className="text-gray-600 mt-2">
                Subject:{" "}
                <span className="font-extrabold text-gray-900">
                  {concept?.subject || "N/A"}
                </span>
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <span className="px-4 py-2 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-sm">
                📌 Study Mode
              </span>
              <span className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 font-bold text-sm">
                ID: {concept?._id?.slice(0, 6)}...
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {concept?.description || "No description added yet."}
            </p>
          </div>

          {/* Analytics */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ y: -3 }}
              className="p-5 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50"
            >
              <p className="text-sm text-gray-500 font-semibold">
                PYQ Frequency
              </p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">
                {concept?.frequencyInPYQ || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Higher = more repeated in exams
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="p-5 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50"
            >
              <p className="text-sm text-gray-500 font-semibold">
                Importance Score
              </p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">
                {concept?.importanceScore || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Higher = more important to revise
              </p>
            </motion.div>
          </div>

          {/* Related Concepts */}
          <div className="mt-10">
            <h3 className="text-lg font-extrabold text-gray-900 mb-3">
              Related Concepts
            </h3>

            {!concept?.relatedConcepts || concept.relatedConcepts.length === 0 ? (
              <div className="p-6 rounded-3xl border border-dashed border-gray-300 bg-gray-50 text-gray-600 font-semibold">
                No related concepts found.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {concept.relatedConcepts.map((rc) => (
                  <Link
                    key={rc._id}
                    to={`/concepts/${rc._id}`}
                    className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition"
                  >
                    {rc?.displayName || rc?.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ConceptDetails;
