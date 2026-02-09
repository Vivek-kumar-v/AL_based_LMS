import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getDocumentByIdApi, updateDocumentApi } from "../../api/documentApi";
import toast from "react-hot-toast";

const EditDocument = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    semester: "",
    year: "",
    isPublic: true,
  });

  const fetchDocument = async () => {
    try {
      setLoading(true);

      const res = await getDocumentByIdApi(documentId);
      const doc = res?.data;

      setForm({
        title: doc?.title || "",
        description: doc?.description || "",
        subject: doc?.subject || "",
        semester: doc?.semester || "",
        year: doc?.year || "",
        isPublic: doc?.isPublic ?? true,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch document");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {};

      if (form.title.trim() !== "") payload.title = form.title.trim();
      if (form.description !== undefined) payload.description = form.description;
      if (form.subject.trim() !== "") payload.subject = form.subject.trim();

      if (form.semester !== "") payload.semester = form.semester;
      if (form.year !== "") payload.year = form.year;

      payload.isPublic = form.isPublic;

      await updateDocumentApi(documentId, payload);

      toast.success("Document updated successfully ✅");

      setTimeout(() => {
        navigate("/notes");
      }, 900);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="h-10 w-60 bg-gray-200 rounded-xl animate-pulse mb-6" />
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 rounded-2xl animate-pulse"
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
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-lg p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Edit Document ✏️
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Update title, subject, description and visibility.
              </p>
            </div>

            <Link
              className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition w-fit"
              to="/notes"
            >
              ← Back
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-sm font-bold text-gray-800">Title</label>
              <input
                className="mt-2 w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 outline-none
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            {/* Subject */}
            <div>
              <label className="text-sm font-bold text-gray-800">Subject</label>
              <input
                className="mt-2 w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 outline-none
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-bold text-gray-800">
                Description
              </label>
              <textarea
                rows={4}
                className="mt-2 w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 outline-none
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                placeholder="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            {/* Semester + Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-800">
                  Semester
                </label>
                <input
                  className="mt-2 w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 outline-none
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Semester"
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800">Year</label>
                <input
                  className="mt-2 w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 outline-none
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Year"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Public Toggle */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <div>
                <p className="font-bold text-gray-900">Make Public</p>
                <p className="text-xs text-gray-500">
                  Public documents can be accessed by other students.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={form.isPublic}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition" />
                <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-5" />
              </label>
            </div>

            {/* Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              className={`w-full rounded-2xl px-4 py-3 font-extrabold text-white shadow-md transition
                ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-900"
                }`}
            >
              {saving ? "Saving..." : "Update Document 🚀"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EditDocument;
