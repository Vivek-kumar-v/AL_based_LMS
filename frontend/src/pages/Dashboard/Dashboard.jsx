import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDashboardApi } from "../../api/dashboardApi";
import { useAuth } from "../../hooks/useAuth";

const Dashboard = () => {
  const { student } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDashboardApi();
      setData(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  // Skeleton Loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse mb-8" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-white rounded-2xl shadow-sm border border-gray-200 animate-pulse"
              />
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-72 bg-white rounded-2xl shadow-sm border border-gray-200 animate-pulse"
              />
            ))}
          </div>

          <div className="mt-6 h-72 bg-white rounded-2xl shadow-sm border border-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div
          variants={item}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome, {student?.fullName || "Student"} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Track your progress, revisions, and weak areas in one place.
            </p>
          </div>

          <motion.div
            variants={item}
            className="bg-white border border-gray-200 shadow-sm rounded-2xl px-5 py-3"
          >
            <p className="text-sm text-gray-500 font-medium">Today</p>
            <p className="font-bold text-gray-900">
              {new Date().toDateString()}
            </p>
          </motion.div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          variants={container}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <SummaryCard
            title="Uploads"
            value={data?.summary?.totalUploads}
            icon="📤"
            variants={item}
          />
          <SummaryCard
            title="Searches"
            value={data?.summary?.totalSearches}
            icon="🔍"
            variants={item}
          />
          <SummaryCard
            title="AI Queries"
            value={data?.summary?.totalAIQueries}
            icon="🤖"
            variants={item}
          />
          <SummaryCard
            title="Revisions"
            value={data?.summary?.totalRevisions}
            icon="📌"
            variants={item}
          />
        </motion.div>

        {/* 2 Column Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Weak Concepts */}
          <motion.div
            variants={item}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Weak Concepts</h2>
              <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-semibold">
                Needs Work
              </span>
            </div>

            {data?.weakConcepts?.length === 0 ? (
              <EmptyState text="No weak concepts yet. Keep going 🔥" />
            ) : (
              <div className="space-y-3">
                {data?.weakConcepts?.slice(0, 6).map((c) => (
                  <div
                    key={c._id}
                    className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-gray-800">
                        {c?.conceptId?.displayName}
                      </p>
                      <p className="font-bold text-red-600">
                        {c?.strengthScore}%
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c?.strengthScore || 0}%` }}
                        transition={{ duration: 0.7 }}
                        className="h-full bg-red-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Most Repeated PYQ Concepts */}
          <motion.div
            variants={item}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Most Repeated PYQ Concepts
              </h2>
              <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold">
                High Priority
              </span>
            </div>

            {data?.mostRepeatedPYQConcepts?.length === 0 ? (
              <EmptyState text="No PYQ concepts yet 📚" />
            ) : (
              <div className="space-y-3">
                {data?.mostRepeatedPYQConcepts?.slice(0, 6).map((c) => (
                  <div
                    key={c._id}
                    className="flex justify-between items-center p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition"
                  >
                    <p className="font-semibold text-gray-800">
                      {c?.displayName}
                    </p>
                    <span className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full font-bold">
                      {c?.frequencyInPYQ} times
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Revisions */}
        <motion.div
          variants={item}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Revisions
            </h2>
            <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold">
              Last 7 Days
            </span>
          </div>

          {data?.last7DaysRevisions?.length === 0 ? (
            <EmptyState text="No revisions yet. Start revising today ✨" />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {data?.last7DaysRevisions?.slice(0, 8).map((r, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -3 }}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition bg-gradient-to-br from-white to-gray-50"
                >
                  <p className="font-bold text-gray-900">
                    {r?.conceptId?.displayName}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ⏱ {new Date(r?.revisedAt).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ------------------ Small Components ------------------ */

const SummaryCard = ({ title, value, icon, variants }) => {
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 transition"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-semibold">{title}</p>
        <span className="text-xl">{icon}</span>
      </div>

      <p className="text-3xl font-extrabold text-gray-900 mt-3">
        {value ?? 0}
      </p>

      <p className="text-xs text-gray-400 mt-1">Updated just now</p>
    </motion.div>
  );
};

const EmptyState = ({ text }) => {
  return (
    <div className="p-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-gray-600 text-sm font-medium">
      {text}
    </div>
  );
};

export default Dashboard;
