import React from "react";
import ConceptCard from "./ConceptCard";

const ConceptList = ({ concepts = [], loading = false }) => {
  if (loading) {
    return <p className="text-gray-600">Loading concepts...</p>;
  }

  if (!concepts || concepts.length === 0) {
    return <p className="text-gray-600">No concepts found.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {concepts.map((concept) => (
        <ConceptCard key={concept._id} concept={concept} />
      ))}
    </div>
  );
};

export default ConceptList;
