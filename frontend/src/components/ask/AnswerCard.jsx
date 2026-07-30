import { useState } from "react";
import { Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AnswerCard = ({ loading, answer }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 animate-pulse">
        <div className="mb-4 h-5 w-1/3 rounded bg-slate-700"></div>

        <div className="space-y-3">
          <div className="h-4 rounded bg-slate-700"></div>
          <div className="h-4 rounded bg-slate-700"></div>
          <div className="h-4 w-2/3 rounded bg-slate-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <div className="mb-5 flex items-center justify-between">

        <h2 className="text-2xl font-semibold">
          🤖 AI Answer
        </h2>

        {answer && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700 transition"
          >
            {copied ? (
              <>
                <Check size={16} className="text-green-400" />
                Copied
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy
              </>
            )}
          </button>
        )}

      </div>

      <div className="prose prose-invert max-w-none text-slate-300 leading-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {answer}
        </ReactMarkdown>
      </div>

    </div>
  );
};

export default AnswerCard;