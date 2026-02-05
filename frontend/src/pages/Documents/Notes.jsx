import { useEffect, useState } from "react";
import { getAllNotesApi } from "../../api/documentApi";
import DocumentCard from "../../components/documents/DocumentCard";
import { Link } from "react-router-dom";
import React from "react";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await getAllNotesApi();
      setNotes(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = (id) => {
    setNotes((prev) => prev.filter((d) => d._id !== id));
  };

  if (loading) return <div className="p-6">Loading notes...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Notes</h1>

        <div className="flex gap-3">
          <Link className="underline text-blue-600" to="/upload">
            Upload
          </Link>
          <Link className="underline text-blue-600" to="/pyqs">
            PYQs
          </Link>
          <Link className="underline text-blue-600" to="/dashboard">
            Dashboard
          </Link>
        </div>
      </div>

      {notes.length === 0 ? (
        <p>No notes uploaded yet.</p>
      ) : (
        <div className="grid gap-4">
          {notes.map((doc) => (
            <DocumentCard key={doc._id} doc={doc} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
