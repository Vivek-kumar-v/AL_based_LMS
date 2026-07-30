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
  const [currentQuestion, setCurrentQuestion] = useState("");

  const [loading, setLoading] = useState(false);

  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    if (loading || !question.trim()) return;

    try {
      setLoading(true);
      setError("");

      // Save the asked question
      setCurrentQuestion(question);

      // Clear previous response
      setAnswer("");
      setSources([]);

      const res = await askAIApi({
        question,
        documentId,
      });

      setAnswer(res.answer || "");
      setSources(res.sources || []);

      // Clear input
      setQuestion("");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Failed to get AI response."
      );

      setAnswer("");
      setSources([]);
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

        {(loading || answer) && (
          <div className="mt-8 space-y-5">

            {currentQuestion && (
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">
                  ❓ Your Question
                </h3>

                <p className="text-lg">
                  {currentQuestion}
                </p>
              </div>
            )}

            <AnswerCard
              loading={loading}
              answer={answer}
            />
          </div>
        )}

        {sources.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">
              📚 Sources
            </h2>

            {sources.map((source) => (
              <SourceCard
                key={source._id}
                source={source}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AskAI;