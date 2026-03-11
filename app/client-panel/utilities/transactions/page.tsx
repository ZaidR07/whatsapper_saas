"use client";

import React from "react";

import { useTransactions } from "../../hooks/useCredits";

export default function TransactionsPage() {
  const { data, isLoading } = useTransactions();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">Transaction Details</h3>
        <p className="text-sm text-gray-500 mt-1">Credit transactions for your account.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Credits</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data?.transactions || []).length > 0 ? (
              (data?.transactions || []).map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(t.date).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{String(t.type || "").toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{t.credits}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.description || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                  {isLoading ? "Loading transactions..." : "No transactions found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
