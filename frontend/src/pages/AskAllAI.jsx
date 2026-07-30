import { useState } from "react";

import AskHeader from "../components/ask/AskHeader";
import ChatInput from "../components/ask/ChatInput";
import AnswerCard from "../components/ask/AnswerCard";
import SourceCard from "../components/ask/SourceCard";

import { askAllNotesApi } from "../api/aiApi";

const AskAllAI = () => {

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {

    if (loading || !question.trim()) return;

    const askedQuestion = question;

    setQuestion("");

    try {

      setLoading(true);
      setError("");

      const res = await askAllNotesApi({
        question: askedQuestion,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          question: askedQuestion,
          answer: res.answer,
          sources: res.sources,
        },
      ]);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to answer your question."
      );

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <AskHeader />

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}

        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4">

          <p className="text-sm text-slate-400">
            AI Assistant
          </p>

          <h2 className="text-xl font-semibold">
            📚 Ask From All Notes
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Ask anything from all of your uploaded notes.
          </p>

        </div>

        {/* Input */}

        <ChatInput
          question={question}
          setQuestion={setQuestion}
          loading={loading}
          onAsk={handleAsk}
        />

        {/* Error */}

        {error && (

          <div className="mt-6 rounded-xl border border-red-500 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>

        )}

        {/* Conversation */}

        <div className="mt-8 space-y-10">

          {messages.map((msg) => (

            <div
              key={msg.id}
              className="space-y-5"
            >

              {/* User */}

              <div className="flex justify-end">

                <div className="max-w-3xl rounded-2xl bg-indigo-600 px-5 py-4">

                  <p className="mb-2 text-sm font-semibold">
                    You
                  </p>

                  <p>{msg.question}</p>

                </div>

              </div>

              {/* AI */}

              <AnswerCard
                loading={false}
                answer={msg.answer}
              />

              {/* Sources */}

              {msg.sources?.length > 0 && (

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

          {loading && (

            <AnswerCard
              loading={true}
              answer=""
            />

          )}

        </div>

      </div>

    </div>
  );
};

export default AskAllAI;