import React, { useState } from "react";
import { motion } from "framer-motion";
import { uploadDocumentApi } from "../../api/documentApi";

const UploadForm = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    documentType: "notes",
    subject: "",
    semester: "",
    year: "",
    isPublic: true,
  });

  const [document, setDocument] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!document) {
      setError("Please upload a file");
      return;
    }

    if (!form.title || !form.subject || !form.documentType) {
      setError("Title, Subject and Document Type are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("documentType", form.documentType);
    formData.append("subject", form.subject);
    formData.append("semester", form.semester);
    formData.append("year", form.year);
    formData.append("isPublic", form.isPublic);
    formData.append("document", document);

    try {
      setLoading(true);

      const uploadRes = await uploadDocumentApi(formData);

      const documentId = uploadRes?.data?._id;
      console.log("Uploaded Document ID:", documentId);

      setMessage("Document uploaded successfully ✅");

      // Reset form
      setForm({
        title: "",
        description: "",
        documentType: "notes",
        subject: "",
        semester: "",
        year: "",
        isPublic: true,
      });
      setDocument(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-3xl mx-auto"
      >
        <motion.form
          onSubmit={handleSubmit}
          whileHover={{ y: -2 }}
          className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-lg p-6 md:p-8 space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Upload Notes / PYQ
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                Upload your notes or PYQ and we’ll keep it organized + searchable.
              </p>
            </div>

            <div className="hidden md:flex text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600">
              OCR Enabled ⚡
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 font-semibold"
            >
              ❌ {error}
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-green-200 bg-green-50 p-3 text-green-700 font-semibold"
            >
              ✅ {message}
            </motion.div>
          )}

          {/* Title */}
          <div>
            <label className="text-sm font-bold text-gray-800">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              className="mt-2 w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 outline-none
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Eg: OS Unit-3 Notes"
              name="title"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="text-sm font-bold text-gray-800">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              className="mt-2 w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 outline-none
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Eg: Operating System"
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
              rows={3}
              className="mt-2 w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 outline-none
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              placeholder="Write a short description..."
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* Type + Semester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-800">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                className="mt-2 w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 outline-none
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                name="documentType"
                value={form.documentType}
                onChange={handleChange}
              >
                <option value="notes">📒 Notes</option>
                <option value="pyq">📝 PYQ</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-800">Semester</label>
              <input
                className="mt-2 w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 outline-none
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Eg: 4"
                name="semester"
                value={form.semester}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="text-sm font-bold text-gray-800">
              Year (only for PYQ)
            </label>
            <input
              className="mt-2 w-full border border-gray-200 bg-white rounded-2xl px-4 py-3 outline-none
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Eg: 2023"
              name="year"
              value={form.year}
              onChange={handleChange}
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
            <div>
              <p className="font-bold text-gray-900">Make Public</p>
              <p className="text-xs text-gray-500">
                Public uploads help other students too.
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

          {/* File Upload */}
          <div>
            <label className="text-sm font-bold text-gray-800">
              Upload File <span className="text-red-500">*</span>
            </label>

            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-2xl p-5 bg-gray-50 hover:bg-gray-100 transition">
              <input
                type="file"
                className="w-full cursor-pointer"
                onChange={(e) => setDocument(e.target.files[0])}
              />

              {document && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm font-semibold text-gray-800"
                >
                  📄 Selected:{" "}
                  <span className="text-blue-600">{document.name}</span>
                </motion.p>
              )}
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className={`w-full rounded-2xl px-4 py-3 font-bold text-white shadow-md transition
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-900"
              }`}
          >
            {loading ? "Uploading..." : "Upload"}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default UploadForm;
