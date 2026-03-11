"use client";

import React from "react";

import { useIpLogs } from "../../hooks/useIpLogs";

export default function IpLogsPage() {
  const { data, isLoading } = useIpLogs();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">IP Logs</h3>
        <p className="text-sm text-gray-500 mt-1">Login history for your account.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">IP Address</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Login Time</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Device Info</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data?.logs || []).length > 0 ? (
              (data?.logs || []).map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{l.ipAddress}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(l.loginTime).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{l.deviceInfo || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500 italic">
                  {isLoading ? "Loading IP logs..." : "No IP logs found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
