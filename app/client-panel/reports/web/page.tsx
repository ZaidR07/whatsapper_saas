"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Search, SlidersHorizontal } from "lucide-react";

import { reportApi, type WebReportRow } from "../../services/reportApi";

const formatDateLabel = (d: Date) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
};

const toISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
};

function StatusBadge({ status }: { status: WebReportRow["status"] }) {
  const cls =
    status === "completed"
      ? "bg-blue-600 text-white"
      : status === "failed"
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-700";

  const label = status === "completed" ? "Completed" : status === "failed" ? "Failed" : "Pending";

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
}

export default function WebReportPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<WebReportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const dateParam = useMemo(() => toISODate(selectedDate), [selectedDate]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    reportApi
      .webReport({ date: dateParam, search: search.trim() || undefined, page, limit })
      .then((data) => {
        if (!mounted) return;
        setRows(Array.isArray(data?.rows) ? data.rows : []);
        setTotal(Number(data?.total ?? 0));
      })
      .catch(() => {
        if (!mounted) return;
        setRows([]);
        setTotal(0);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [dateParam, search, page]);

  const pageCount = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <button type="button" className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold shadow-sm">
          Sent Messages
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-semibold">Date</span>
            </div>

            <div className="relative">
              <input
                type="date"
                value={dateParam}
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  if (!Number.isNaN(d.getTime())) {
                    setSelectedDate(d);
                    setPage(1);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="px-4 py-2 rounded-md bg-gray-50 border border-gray-200 text-sm text-gray-700 min-w-[140px]">
                {formatDateLabel(selectedDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 font-semibold">Search:</div>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search"
                className="pl-9 pr-3 py-2 rounded-md bg-white border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="text-left px-4 py-3 font-semibold">Job ID</th>
                <th className="text-left px-4 py-3 font-semibold">Channel</th>
                <th className="text-center px-4 py-3 font-semibold">Bill</th>
                <th className="text-center px-4 py-3 font-semibold">Message</th>
                <th className="text-left px-4 py-3 font-semibold">Sent Time</th>
                <th className="text-right px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.jobId} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/client-panel/reports/web/${encodeURIComponent(String(r.jobId))}`}
                        className="inline-flex px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                        title="View job details"
                      >
                        {r.jobId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.channel}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{r.bill}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setModalMessage(r.message || "")}
                        className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                        title="View message"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                        {formatDateTime(r.sentTime)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm font-semibold disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm font-semibold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {modalMessage !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalMessage(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="text-sm font-bold text-gray-800">Message</div>
              <button
                type="button"
                onClick={() => setModalMessage(null)}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-4 text-sm text-gray-700 whitespace-pre-wrap">{modalMessage || "-"}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
