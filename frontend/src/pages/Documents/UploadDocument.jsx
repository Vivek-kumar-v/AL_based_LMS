import { Link } from "react-router-dom";
import UploadForm from "../../components/documents/UploadForm";
import React from "react";

const UploadDocument = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upload Document</h1>

        <div className="flex gap-3">
          <Link className="underline text-blue-600" to="/notes">
            Notes
          </Link>
          <Link className="underline text-blue-600" to="/pyqs">
            PYQs
          </Link>
          <Link className="underline text-blue-600" to="/dashboard">
            Dashboard
          </Link>
        </div>
      </div>

      <UploadForm />
    </div>
  );
};

export default UploadDocument;
