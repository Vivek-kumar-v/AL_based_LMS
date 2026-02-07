import React, { useEffect, useState } from "react";
import { getAllConceptsApi } from "../../api/conceptApi";
import ConceptList from "../../components/concepts/ConceptList";
import { Link } from "react-router-dom";

const Concepts = () => {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConcepts = async () => {
    try {
      setLoading(true);
      const res = await getAllConceptsApi();

      // IMPORTANT FIX (ApiResponse format)
      setConcepts(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcepts();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Concepts</h1>

        <div className="flex gap-4">
          <Link to="/dashboard" className="underline text-blue-600">
            Dashboard
          </Link>
          <Link to="/search" className="underline text-blue-600">
            Smart Search
          </Link>
        </div>
      </div>

      {/* Concept List */}
      <ConceptList concepts={concepts} loading={loading} />
    </div>
  );
};

export default Concepts;
