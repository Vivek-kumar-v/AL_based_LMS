import { Sparkles } from "lucide-react";

const AskHeader = () => {
  return (
    <div className="border-b border-slate-800 bg-slate-900">
      <div className="max-w-5xl mx-auto flex items-center gap-3 px-6 py-5">

        <Sparkles className="text-indigo-400" />

        <h1 className="text-2xl font-bold">
          Ask AI
        </h1>

      </div>
    </div>
  );
};

export default AskHeader;