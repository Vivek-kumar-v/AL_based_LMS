import React, { useEffect, useMemo, useState } from "react";
import { getAllNotesApi } from "../../api/documentApi";
import DocumentCard from "../../components/documents/DocumentCard";
import { Link } from "react-router-dom";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Search state
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");

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

  // ✅ Filtered notes based on search
  const filteredNotes = useMemo(() => {
    if (!search) return notes;

    const q = search.toLowerCase();

    return notes.filter((doc) => {
      return (
        doc?.title?.toLowerCase().includes(q) ||
        doc?.subject?.toLowerCase().includes(q) ||
        doc?.documentType?.toLowerCase().includes(q) ||
        String(doc?.semester || "").includes(q) ||
        String(doc?.year || "").includes(q)
      );
    });
  }, [notes, search]);

  const handleSearch = () => {
    setSearch(searchText.trim());
  };

  const clearSearch = () => {
    setSearch("");
    setSearchText("");
  };

  if (loading) return <div className="p-6">Loading notes...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* HEADER */}
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

      {/* ✅ SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-3 items-center">
        <input
          className="w-full border p-2 rounded"
          placeholder="Search by title, subject, semester, year..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />

        <button
          onClick={handleSearch}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Search
        </button>

        {search && (
          <button
            onClick={clearSearch}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* RESULT INFO */}
      {search && (
        <p className="text-sm text-gray-600 mb-4">
          Showing results for: <span className="font-semibold">{search}</span> (
          {filteredNotes.length} found)
        </p>
      )}

      {/* LIST */}
      {filteredNotes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <div className="grid gap-4">
          {filteredNotes.map((doc) => (
            <DocumentCard
              key={doc._id}
              doc={doc}
              onDelete={handleDelete}
              onOCRDone={fetchNotes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
