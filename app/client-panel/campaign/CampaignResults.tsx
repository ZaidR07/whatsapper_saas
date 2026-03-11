"use client";

import React from "react";

type CampaignResultsProps = {
  campaignResults: Array<{ number: string; success: boolean; error?: string }>;
};

export default function CampaignResults({ campaignResults }: CampaignResultsProps) {
  if (campaignResults.length === 0) return null;

  return (
    <div className="border-t border-gray-100 p-6">
      <h4 className="font-bold text-gray-900 mb-3">Results</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border border-gray-100">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Number</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaignResults.map((r, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 text-sm font-mono text-gray-800">{r.number}</td>
                <td className="px-4 py-3 text-sm">
                  {r.success ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">SENT</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">FAILED</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.error || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
