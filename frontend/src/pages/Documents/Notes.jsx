import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllNotesApi } from "../../api/documentApi";
import DocumentCard from "../../components/documents/DocumentCard";
import { Link } from "react-router-dom";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
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

  // Filtered notes
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

  // Animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-10 w-52 bg-gray-200 rounded-xl animate-pulse mb-8" />

          <div className="h-20 bg-white rounded-2xl border border-gray-200 shadow-sm animate-pulse mb-6" />

          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-2xl border border-gray-200 shadow-sm animate-pulse"
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
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto"
      >
        {/* HEADER */}
        <motion.div
          variants={item}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              All Notes 📒
            </h1>
            <p className="text-gray-600 mt-1">
              Search, manage and revise your uploaded notes easily.
            </p>
          </div>

          {/* Nav Buttons */}
       
        </motion.div>

        {/* SEARCH BAR */}
        <motion.div
          variants={item}
          className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-sm p-4 md:p-5 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="w-full relative">
              <input
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                placeholder="Search by title, subject, semester, year..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>

            <button
              onClick={handleSearch}
              className="px-6 py-3 rounded-2xl bg-black text-white font-bold hover:bg-gray-900 transition"
            >
              Search
            </button>

            {search && (
              <button
                onClick={clearSearch}
                className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition"
              >
                Clear
              </button>
            )}
          </div>

          {/* Result Info */}
          <AnimatePresence>
            {search && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-4 text-sm text-gray-600"
              >
                Showing results for:{" "}
                <span className="font-bold text-gray-900">{search}</span>{" "}
                <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs">
                  {filteredNotes.length} found
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* LIST */}
        {filteredNotes.length === 0 ? (
          <motion.div
            variants={item}
            className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 text-center shadow-sm"
          >
            <p className="text-xl font-extrabold text-gray-900">
              No notes found 😭
            </p>
            <p className="text-gray-600 mt-2">
              Try searching with a different keyword or upload new notes.
            </p>

            <Link
              to="/upload"
              className="inline-block mt-6 px-6 py-3 rounded-2xl bg-black text-white font-bold hover:bg-gray-900 transition"
            >
              Upload Notes
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            className="grid gap-4"
          >
            {filteredNotes.map((doc) => (
              <motion.div key={doc._id} variants={item}>
                <DocumentCard
                  doc={doc}
                  onDelete={handleDelete}
                  onOCRDone={fetchNotes}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Notes;
