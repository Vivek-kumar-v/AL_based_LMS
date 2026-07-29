import { FileText } from "lucide-react";

const SourceCard = ({ source }) => {
  return (
    <div
      className="
      border
      border-slate-800
      rounded-xl
      p-4
      bg-slate-900
      hover:border-indigo-500
      transition"
    >
      <div className="flex items-center gap-3">

        <FileText className="text-indigo-400" />

        <div className="flex-1">

          <h3 className="font-semibold">
            {source.title}
          </h3>

          <p className="text-sm text-slate-400">
            Chunk {source.chunkIndex}
          </p>

        </div>

        <span
          className="
          bg-indigo-600/20
          text-indigo-300
          px-3
          py-1
          rounded-full
          text-sm"
        >
          {source.score}
        </span>

      </div>
    </div>
  );
};

export default SourceCard;