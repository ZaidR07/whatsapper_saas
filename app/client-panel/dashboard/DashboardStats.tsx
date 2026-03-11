"use client";

import React from "react";

import { useDashboardOverview } from "../hooks/useDashboard";

export default function DashboardStats() {
  const { data, isLoading } = useDashboardOverview();

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  const stats = data?.stats;
  const recent = data?.recentCampaigns || [];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Credits Remaining", value: Number(stats?.creditsRemaining ?? 0) },
          { title: "Connected Devices", value: Number(stats?.connectedDevices ?? 0) },
          { title: "Messages Sent Today", value: Number(stats?.messagesSentToday ?? 0) },
          { title: "Total Campaigns", value: Number(stats?.totalCampaigns ?? 0) },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-28 relative overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="relative z-10">
              <h3 className="text-gray-600 font-semibold mb-2">{stat.title}</h3>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            </div>
            <div className="absolute top-0 right-0 w-24 h-full opacity-10 pointer-events-none">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-blue-500">
                <path d="M100,0 C80,20 80,80 100,100 L100,100 L100,0 Z" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Recent Campaigns</h3>
          <p className="text-sm text-gray-500 mt-1">Last 5 campaigns.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Numbers</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sent</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Failed</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.length > 0 ? (
                recent.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{c.campaignName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.numbers}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.sent}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.failed}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{String(c.status || "").toUpperCase()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                    No campaigns yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
