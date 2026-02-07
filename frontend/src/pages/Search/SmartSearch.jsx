import { useEffect, useState } from "react";
import { smartSearchApi } from "../../api/documentApi";
import DocumentCard from "../../components/documents/DocumentCard";
import { Link } from "react-router-dom";
import React from "react";

const SmartSearch = () => {
  const [filters, setFilters] = useState({
    keyword: "",
    subject: "",
    semester: "",
    concept: "",
    documentType: "",
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

const handleSearch = async () => {
  try {
    setLoading(true);
    setError("");

    const res = await smartSearchApi(filters);

    // IMPORTANT FIX
    setResults(res?.data?.data || []);
  } catch (err) {
    setError(err?.response?.data?.message || "Search failed");
  } finally {
    setLoading(false);
  }
};


  // auto load on first open
  useEffect(() => {
    handleSearch();
  }, []);

  const handleDelete = (id) => {
    setResults((prev) => prev.filter((d) => d._id !== id));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Smart Search</h1>

        <div className="flex gap-3">
          <Link className="underline text-blue-600" to="/dashboard">
            Dashboard
          </Link>
          <Link className="underline text-blue-600" to="/upload">
            Upload
          </Link>
          <Link className="underline text-blue-600" to="/notes">
            Notes
          </Link>
          <Link className="underline text-blue-600" to="/pyqs">
            PYQs
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-xl p-5 mb-6 space-y-4">
        <h2 className="text-lg font-semibold">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Keyword (title / subject)"
            name="keyword"
            value={filters.keyword}
            onChange={handleChange}
          />

          <input
            className="border p-2 rounded"
            placeholder="Subject"
            name="subject"
            value={filters.subject}
            onChange={handleChange}
          />

          <input
            className="border p-2 rounded"
            placeholder="Semester"
            name="semester"
            value={filters.semester}
            onChange={handleChange}
          />

          <input
            className="border p-2 rounded"
            placeholder="Concept name (example: Database)"
            name="concept"
            value={filters.concept}
            onChange={handleChange}
          />

          <select
            className="border p-2 rounded"
            name="documentType"
            value={filters.documentType}
            onChange={handleChange}
          >
            <option value="">All Types</option>
            <option value="notes">Notes</option>
            <option value="pyq">PYQ</option>
          </select>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          {loading ? "Searching..." : "Search"}
        </button>

        {error && <p className="text-red-600 font-semibold">{error}</p>}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          Results ({results.length})
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : results.length === 0 ? (
          <p>No documents found.</p>
        ) : (
          <div className="grid gap-4">
            {results.map((doc) => (
              <DocumentCard key={doc._id} doc={doc} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSearch;
