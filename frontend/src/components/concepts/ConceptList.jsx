import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ConceptList = ({ concepts, loading }) => {
  const navigate = useNavigate();

  // Skeleton loader
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-24 bg-white border border-gray-200 rounded-3xl shadow-sm animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!concepts || concepts.length === 0) {
    return (
      <div className="p-10 rounded-3xl border border-dashed border-gray-300 bg-gray-50 text-center">
        <p className="text-xl font-extrabold text-gray-900">
          No concepts found 😭
        </p>
        <p className="text-gray-600 mt-2">
          Try adding concepts from the admin panel or upload more documents.
        </p>
      </div>
    );
  }

  // Animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid md:grid-cols-2 gap-4"
    >
      {concepts.map((concept) => (
        <motion.div
          key={concept._id}
          variants={item}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/concepts/${concept._id}`)}
          className="cursor-pointer bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition p-5"
        >
          {/* Title */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
              {concept.displayName || "Unnamed Concept"}
            </h2>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              View →
            </span>
          </div>

          {/* Subject */}
          <p className="text-sm text-gray-600 mt-1">
            Subject:{" "}
            <span className="font-bold text-gray-900">
              {concept.subject || "N/A"}
            </span>
          </p>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-900">
              📝 PYQ: {concept.frequencyInPYQ || 0}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
              ⭐ Score: {concept.importanceScore || 0}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ConceptList;
