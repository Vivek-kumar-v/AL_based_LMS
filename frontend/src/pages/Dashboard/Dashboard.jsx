import { useEffect, useState } from "react";
import { getDashboardApi } from "../../api/dashboardApi";
import { useAuth } from "../../hooks/useAuth";
import React from "react";

const Dashboard = () => {
  const { student, logout } = useAuth();

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

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Welcome, {student?.fullName || "Student"} 👋
        </h1>

        {/* <button
          onClick={logout}
          className="rounded bg-red-600 text-white px-4 py-2"
        >
          Logout
        </button> */}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Uploads</p>
          <p className="text-xl font-bold">{data?.summary?.totalUploads}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Searches</p>
          <p className="text-xl font-bold">{data?.summary?.totalSearches}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">AI Queries</p>
          <p className="text-xl font-bold">{data?.summary?.totalAIQueries}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Revisions</p>
          <p className="text-xl font-bold">{data?.summary?.totalRevisions}</p>
        </div>
      </div>

      {/* Weak Concepts */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-bold mb-3">Weak Concepts</h2>

        {data?.weakConcepts?.length === 0 ? (
          <p>No weak concepts yet.</p>
        ) : (
          <ul className="space-y-2">
            {data?.weakConcepts?.map((c) => (
              <li
                key={c._id}
                className="flex justify-between border p-2 rounded"
              >
                <span>{c?.conceptId?.displayName}</span>
                <span className="font-bold text-red-600">
                  {c?.strengthScore}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Top PYQ Concepts */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-bold mb-3">Most Repeated PYQ Concepts</h2>

        {data?.mostRepeatedPYQConcepts?.length === 0 ? (
          <p>No PYQ concepts yet.</p>
        ) : (
          <ul className="space-y-2">
            {data?.mostRepeatedPYQConcepts?.map((c) => (
              <li
                key={c._id}
                className="flex justify-between border p-2 rounded"
              >
                <span>{c?.displayName}</span>
                <span className="font-bold">{c?.frequencyInPYQ}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Revision Tracker */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-3">Recent Revisions</h2>

        {data?.last7DaysRevisions?.length === 0 ? (
          <p>No revisions yet.</p>
        ) : (
          <ul className="space-y-2">
            {data?.last7DaysRevisions?.map((r, idx) => (
              <li key={idx} className="border p-2 rounded">
                <p className="font-medium">{r?.conceptId?.displayName}</p>
                <p className="text-sm text-gray-500">
                  {new Date(r?.revisedAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
