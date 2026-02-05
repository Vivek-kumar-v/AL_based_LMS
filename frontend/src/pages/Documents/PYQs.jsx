import { useEffect, useState } from "react";
import { getAllPYQsApi } from "../../api/documentApi";
import DocumentCard from "../../components/documents/DocumentCard";
import { Link } from "react-router-dom";
import React from "react"; 

const PYQs = () => {
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPYQs = async () => {
    try {
      setLoading(true);
      const res = await getAllPYQsApi();
      setPyqs(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPYQs();
  }, []);

  const handleDelete = (id) => {
    setPyqs((prev) => prev.filter((d) => d._id !== id));
  };

  if (loading) return <div className="p-6">Loading PYQs...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All PYQs</h1>

        <div className="flex gap-3">
          <Link className="underline text-blue-600" to="/upload">
            Upload
          </Link>
          <Link className="underline text-blue-600" to="/notes">
            Notes
          </Link>
          <Link className="underline text-blue-600" to="/dashboard">
            Dashboard
          </Link>
        </div>
      </div>

      {pyqs.length === 0 ? (
        <p>No PYQs uploaded yet.</p>
      ) : (
        <div className="grid gap-4">
          {pyqs.map((doc) => (
            <DocumentCard key={doc._id} doc={doc} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PYQs;
