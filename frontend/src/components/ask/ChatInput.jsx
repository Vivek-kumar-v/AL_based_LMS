import { Send } from "lucide-react";

const ChatInput = ({
    question,
    setQuestion,
    loading,
    onAsk,
  }) => {
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
  
        <textarea
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything from your uploaded notes..."
          className="w-full resize-none bg-transparent outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onAsk();
            }
          }}
        />
  
        <div className="mt-4 flex justify-end">
          <button
            onClick={onAsk}
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-5 py-2 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </div>
      </div>
    );
  };
  
  export default ChatInput;