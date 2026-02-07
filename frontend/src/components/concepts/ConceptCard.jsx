import React from "react";
import { Link } from "react-router-dom";

const ConceptCard = ({ concept }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 border hover:shadow-md transition">
      <h3 className="text-lg font-bold">
        {concept?.displayName || concept?.name}
      </h3>

      <p className="text-sm text-gray-600 mt-1">
        Subject: <span className="font-medium">{concept?.subject}</span>
      </p>

      <p className="text-sm text-gray-600 mt-1">
        PYQ Frequency:{" "}
        <span className="font-bold">{concept?.frequencyInPYQ || 0}</span>
      </p>

      <p className="text-sm text-gray-600 mt-1">
        Importance Score:{" "}
        <span className="font-bold">{concept?.importanceScore || 0}</span>
      </p>

      <div className="mt-3">
        <Link
          to={`/concepts/${concept?._id}`}
          className="text-blue-600 underline font-medium"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default ConceptCard;
