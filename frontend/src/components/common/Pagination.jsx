import React from "react";

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className="px-3 py-2 rounded bg-black text-white disabled:opacity-40"
      >
        Prev
      </button>

      <p className="font-semibold text-gray-700">
        Page {page} / {totalPages}
      </p>

      <button
        onClick={handleNext}
        disabled={page === totalPages}
        className="px-3 py-2 rounded bg-black text-white disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
