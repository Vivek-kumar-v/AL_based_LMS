import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";

import AskHeader from "../components/ask/AskHeader";
import ChatInput from "../components/ask/ChatInput";
import AnswerCard from "../components/ask/AnswerCard";
import SourceCard from "../components/ask/SourceCard";

import { askAIApi } from "../api/aiApi";

const AskAI = () => {
  const { documentId } = useParams();
  const location = useLocation();

  const documentTitle = location.state?.title;

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    if (loading || !question.trim()) return;

    const askedQuestion = question;

    // Clear the input immediately
    setQuestion("");

    try {
      setLoading(true);
      setError("");

      const res = await askAIApi({
        question: askedQuestion,
        documentId,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          question: askedQuestion,
          answer: res.answer || "",
          sources: res.sources || [],
        },
      ]);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Failed to get AI response."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AskHeader />

      <div className="max-w-5xl mx-auto px-6 py-8">

        {documentTitle && (
          <div className="mb-6 rounded-xl bg-slate-900 border border-slate-800 p-4">
            <p className="text-sm text-slate-400">
              Asking from
            </p>

            <h2 className="text-xl font-semibold">
              📄 {documentTitle}
            </h2>
          </div>
        )}

        <ChatInput
          question={question}
          setQuestion={setQuestion}
          loading={loading}
          onAsk={handleAsk}
        />

        {error && (
          <div className="mt-6 rounded-xl border border-red-500 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Chat History */}
        <div className="mt-8 space-y-10">

          {messages.map((msg) => (
            <div key={msg.id} className="space-y-5">

              {/* User Question */}
              <div className="flex justify-end">
                <div className="max-w-3xl rounded-2xl bg-indigo-600 px-5 py-4">
                  <p className="mb-2 text-sm font-semibold">
                    You
                  </p>

                  <p>{msg.question}</p>
                </div>
              </div>

              {/* AI Answer */}
              <AnswerCard
                loading={false}
                answer={msg.answer}
              />

              {/* Sources */}
              {msg.sources.length > 0 && (
                <div className="space-y-4">

                  <h2 className="text-lg font-semibold">
                    📚 Sources
                  </h2>

                  {msg.sources.map((source, index) => (
                    <SourceCard
                      key={source._id || index}
                      source={source}
                    />
                  ))}

                </div>
              )}

            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="space-y-5">

              <div className="flex justify-end">
                <div className="max-w-3xl rounded-2xl bg-indigo-600 px-5 py-4">
                  <p className="mb-2 text-sm font-semibold">
                    You
                  </p>

                  <p>Thinking...</p>
                </div>
              </div>

              <AnswerCard
                loading={true}
                answer=""
              />

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AskAI;