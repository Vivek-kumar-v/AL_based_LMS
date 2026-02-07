import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
        <p className="text-gray-700 font-medium">{text}</p>
      </div>
    </div>
  );
};

export default Loader;
