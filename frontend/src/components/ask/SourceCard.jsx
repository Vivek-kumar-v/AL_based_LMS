import { useState } from "react";
import { FileText } from "lucide-react";

const SourceCard = ({ source }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="
        rounded-xl
        border
        border-slate-800
        bg-slate-900
        p-5
        hover:border-indigo-500
        transition-all
      "
    >
      <div className="flex justify-between items-start gap-5">

        <div className="flex gap-3 flex-1">

          <FileText className="text-indigo-400 mt-1 shrink-0" />

          <div className="flex-1">

            <h3 className="font-semibold text-white">
              {source.title || `Chunk ${source.chunkIndex}`}
            </h3>

            <p
              className={`mt-3 text-sm text-slate-400 whitespace-pre-wrap ${
                expanded ? "" : "line-clamp-3"
              }`}
            >
              {source.text}
            </p>

            {source.text?.length > 180 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition"
              >
                {expanded ? "Show Less ↑" : "Show More ↓"}
              </button>
            )}

          </div>

        </div>

        <div className="text-right shrink-0">

          <p className="text-xs text-slate-500">
            Similarity
          </p>

          <span
            className="
              mt-2 inline-block
              rounded-full
              bg-indigo-600/20
              px-3
              py-1
              text-sm
              font-medium
              text-indigo-300
            "
          >
            {source.score?.toFixed(2)}
          </span>

        </div>

      </div>
    </div>
  );
};

export default SourceCard;