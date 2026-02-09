import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAllConceptsApi } from "../../api/conceptApi";
import ConceptList from "../../components/concepts/ConceptList";

const Concepts = () => {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConcepts = async () => {
    try {
      setLoading(true);
      const res = await getAllConceptsApi();

      // IMPORTANT FIX (ApiResponse format)
      setConcepts(res?.data?.concepts || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcepts();
  }, []);

  // Skeleton loader (if ConceptList doesn't have)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse mb-6" />

          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-20 bg-white border border-gray-200 rounded-2xl shadow-sm animate-pulse"
              />
            ))}
          </div>
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
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              All Concepts 🧠
            </h1>
            <p className="text-gray-600 mt-1">
              Browse all concepts and revise faster with organized topics.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white border border-gray-200 shadow-sm font-bold text-gray-900 w-fit">
            Total:{" "}
            <span className="text-blue-600 font-extrabold">
              {concepts.length}
            </span>
          </div>
        </div>

        {/* Concept List Wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-sm p-4 md:p-6"
        >
          <ConceptList concepts={concepts} loading={loading} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Concepts;
