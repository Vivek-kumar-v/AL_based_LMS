import React from "react";

const ConceptDetails = ({ concept }) => {
  if (!concept) {
    return <p className="text-gray-600">Concept not found.</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 border">
      <h1 className="text-2xl font-bold mb-2">
        {concept?.displayName || concept?.name}
      </h1>

      <p className="text-gray-600 mb-4">
        Subject: <span className="font-semibold">{concept?.subject}</span>
      </p>

      {/* Description */}
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-1">Description</h2>
        <p className="text-gray-700">
          {concept?.description || "No description added yet."}
        </p>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-lg border bg-gray-50">
          <p className="text-sm text-gray-500">PYQ Frequency</p>
          <p className="text-xl font-bold">{concept?.frequencyInPYQ || 0}</p>
        </div>

        <div className="p-4 rounded-lg border bg-gray-50">
          <p className="text-sm text-gray-500">Importance Score</p>
          <p className="text-xl font-bold">{concept?.importanceScore || 0}</p>
        </div>
      </div>

      {/* Related Concepts */}
      <div>
        <h2 className="text-lg font-bold mb-2">Related Concepts</h2>

        {concept?.relatedConcepts?.length === 0 ? (
          <p className="text-gray-600">No related concepts found.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {concept.relatedConcepts.map((rc) => (
              <li key={rc._id} className="text-gray-700">
                {rc?.displayName || rc?.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConceptDetails;
