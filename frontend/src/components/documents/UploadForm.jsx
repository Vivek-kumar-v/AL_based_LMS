import { useState } from "react";
import { uploadDocumentApi, processOCRApi } from "../../api/documentApi";
import React from "react";

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

      // 1) Upload
      const uploadRes = await uploadDocumentApi(formData);

      const documentId = uploadRes?.data?._id;



      setMessage("Document uploaded successfully ✅ ");

      // 2) Auto OCR
      // if (documentId) {
      //   await processOCRApi(documentId);
      //   setMessage("OCR completed successfully 🎉");
      // }

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
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow space-y-4"
    >
      <h2 className="text-xl font-bold">Upload Notes / PYQ</h2>

      {error && (
        <div className="rounded bg-red-100 p-2 text-red-700">{error}</div>
      )}

      {message && (
        <div className="rounded bg-green-100 p-2 text-green-700">
          {message}
        </div>
      )}

      <input
        className="w-full border p-2 rounded"
        placeholder="Title (Required)"
        name="title"
        value={form.title}
        onChange={handleChange}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Subject (Required)"
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
        <select
          className="border p-2 rounded"
          name="documentType"
          value={form.documentType}
          onChange={handleChange}
        >
          <option value="notes">Notes</option>
          <option value="pyq">PYQ</option>
        </select>

        <input
          className="border p-2 rounded"
          placeholder="Semester"
          name="semester"
          value={form.semester}
          onChange={handleChange}
        />
      </div>

      <input
        className="w-full border p-2 rounded"
        placeholder="Year (only for PYQ)"
        name="year"
        value={form.year}
        onChange={handleChange}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublic"
          checked={form.isPublic}
          onChange={handleChange}
        />
        <label>Make Public</label>
      </div>

      <input
        type="file"
        className="w-full border p-2 rounded"
        onChange={(e) => setDocument(e.target.files[0])}
      />

      <button
        disabled={loading}
        className="w-full bg-black text-white rounded p-2 hover:bg-gray-800"
      >
        {loading ? "Uploading..." : "Upload & OCR"}
      </button>
    </form>
  );
};

export default UploadForm;
