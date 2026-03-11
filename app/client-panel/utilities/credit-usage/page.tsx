"use client";

import React from "react";

import { useCreditUsage } from "../../hooks/useCredits";

export default function CreditUsagePage() {
  const { data, isLoading } = useCreditUsage();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">Credit Usage</h3>
        <p className="text-sm text-gray-500 mt-1">Credit usage per message/campaign.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Number</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Credits Used</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data?.usage || []).length > 0 ? (
              (data?.usage || []).map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{u.campaignId || "-"}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{u.number || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{u.creditsUsed}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.date).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                  {isLoading ? "Loading credit usage..." : "No credit usage found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
