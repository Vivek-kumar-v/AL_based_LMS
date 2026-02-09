import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ConceptCard = ({ concept }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition p-5"
    >
      {/* Title */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
          {concept?.displayName || concept?.name || "Unnamed Concept"}
        </h3>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          Concept
        </span>
      </div>

      {/* Subject */}
      <p className="text-sm text-gray-600 mt-2">
        Subject:{" "}
        <span className="font-bold text-gray-900">
          {concept?.subject || "N/A"}
        </span>
      </p>

      {/* Stats */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-900">
          📝 PYQ: {concept?.frequencyInPYQ || 0}
        </span>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
          ⭐ Score: {concept?.importanceScore || 0}
        </span>
      </div>

      {/* Button */}
      <div className="mt-5">
        <Link
          to={`/concepts/${concept?._id}`}
          className="inline-block px-5 py-2 rounded-2xl bg-black text-white font-bold hover:bg-gray-900 transition"
        >
          View →
        </Link>
      </div>
    </motion.div>
  );
};

export default ConceptCard;
