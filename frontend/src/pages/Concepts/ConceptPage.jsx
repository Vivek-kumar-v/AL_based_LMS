import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getConceptByIdApi } from "../../api/conceptApi";
import ConceptDetails from "../../components/concepts/ConceptDetails";

const ConceptPage = () => {
  const { id } = useParams();

  const [concept, setConcept] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConcept = async () => {
    try {
      setLoading(true);
      const res = await getConceptByIdApi(id);

      // IMPORTANT FIX (ApiResponse format)
      setConcept(res?.data?.data || null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcept();
  }, [id]);

  if (loading) return <div className="p-6">Loading concept...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Concept Details</h1>

        <div className="flex gap-4">
          <Link to="/concepts" className="underline text-blue-600">
            Back to Concepts
          </Link>
          <Link to="/dashboard" className="underline text-blue-600">
            Dashboard
          </Link>
        </div>
      </div>

      <ConceptDetails concept={concept} />
    </div>
  );
};

export default ConceptPage;
