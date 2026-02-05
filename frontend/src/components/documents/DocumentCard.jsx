import { deleteDocumentApi } from "../../api/documentApi";
import React from "react"; 

const DocumentCard = ({ doc, onDelete }) => {
  const handleDelete = async () => {
    if (!confirm("Delete this document?")) return;

    try {
      await deleteDocumentApi(doc._id);
      onDelete(doc._id);
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h2 className="text-lg font-bold">{doc.title}</h2>
          <p className="text-sm text-gray-600">{doc.subject}</p>
          <p className="text-xs text-gray-400">
            {doc.documentType.toUpperCase()} • Semester: {doc.semester || "-"} •{" "}
            Year: {doc.year || "-"}
          </p>
        </div>

        <button
          onClick={handleDelete}
          className="text-red-600 font-semibold"
        >
          Delete
        </button>
      </div>

      <div className="mt-3 flex gap-3">
        <a
          href={doc.fileUrl}
          target="_blank"
          className="underline text-blue-600 text-sm"
        >
          Open File
        </a>
      </div>
    </div>
  );
};

export default DocumentCard;
