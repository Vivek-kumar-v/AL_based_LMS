import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getDocumentByIdApi, updateDocumentApi } from "../../api/documentApi";

const EditDocument = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
      setError("");

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
      setError(err?.response?.data?.message || "Failed to fetch document");
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
    setError("");
    setMessage("");
  
    try {
      setSaving(true);
  
      // ✅ Send only fields that are filled / changed
      const payload = {};
  
      if (form.title.trim() !== "") payload.title = form.title.trim();
      if (form.description !== undefined) payload.description = form.description;
      if (form.subject.trim() !== "") payload.subject = form.subject.trim();
  
      // semester/year optional
      if (form.semester !== "") payload.semester = form.semester;
      if (form.year !== "") payload.year = form.year;
  
      payload.isPublic = form.isPublic;
  
      await updateDocumentApi(documentId, payload);
  
      setMessage("Document updated successfully ✅");
  
      setTimeout(() => {
        navigate("/notes");
      }, 800);
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };
  

  if (loading) return <div className="p-6">Loading document...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Document</h1>

          <Link className="underline text-blue-600" to="/notes">
            Back
          </Link>
        </div>

        {error && (
          <div className="mb-3 rounded bg-red-100 p-2 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-3 rounded bg-green-100 p-2 text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            placeholder="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
          />

          <textarea
            className="w-full border p-2 rounded"
            placeholder="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="border p-2 rounded"
              placeholder="Semester"
              name="semester"
              value={form.semester}
              onChange={handleChange}
            />

            <input
              className="border p-2 rounded"
              placeholder="Year"
              name="year"
              value={form.year}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublic"
              checked={form.isPublic}
              onChange={handleChange}
            />
            <label>Make Public</label>
          </div>

          <button
            disabled={saving}
            className="w-full bg-black text-white rounded p-2 hover:bg-gray-800"
          >
            {saving ? "Saving..." : "Update Document"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditDocument;
