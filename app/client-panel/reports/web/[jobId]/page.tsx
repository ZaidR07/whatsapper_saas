"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Eye, Search, ChevronLeft, ChevronRight, Download } from "lucide-react";

import { reportApi, type JobReportLogRow, type JobReportResponse } from "../../../services/reportApi";

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
};

function DeliveryBadge({ status }: { status: JobReportLogRow["status"] }) {
  const cls =
    status === "sent"
      ? "bg-emerald-500 text-white"
      : status === "failed"
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-700";

  const label = status === "sent" ? "Sent" : status === "failed" ? "Failed" : "Pending";

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
}

function StatusLabel({ status }: { status: string }) {
  const s = String(status || "").toLowerCase();
  const label = s === "completed" ? "Completed" : s === "failed" ? "Failed" : s === "running" ? "Running" : status || "-";
  return <span className="text-gray-600">{label}</span>;
}

function PieChart({ sent, failed, pending }: { sent: number; failed: number; pending: number }) {
  const total = Math.max(0, Number(sent || 0) + Number(failed || 0) + Number(pending || 0));

  const chartData = useMemo(
    () => [
      { name: "Sent", value: Number(sent || 0), color: "#4f46e5" },
      { name: "Failed", value: Number(failed || 0), color: "#ef4444" },
      { name: "Pending", value: Number(pending || 0), color: "#f59e0b" },
    ],
    [sent, failed, pending],
  );

  const filtered = useMemo(() => chartData.filter((d) => d.value > 0), [chartData]);

  const gradient = useMemo(() => {
    if (total <= 0 || filtered.length === 0) return "";

    let acc = 0;
    const stops: string[] = [];
    for (const d of filtered) {
      const start = acc;
      acc += (d.value / total) * 100;
      stops.push(`${d.color} ${start}% ${acc}%`);
    }
    return `conic-gradient(from -90deg, ${stops.join(", ")})`;
  }, [filtered, total]);

  return (
    <div className="w-full h-[320px] flex flex-col items-center justify-center">
      {total <= 0 || filtered.length === 0 ? (
        <div className="text-sm text-gray-500">No message data available</div>
      ) : (
        <div
          className="w-[220px] max-w-full aspect-square rounded-full"
          style={{ backgroundImage: gradient }}
        />
      )}

      <div className="mt-4 flex flex-col gap-2 text-sm">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-gray-600">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
            <span>
              {d.name} ({d.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function JobDetailsPage() {
  const params = useParams<{ jobId?: string }>();
  const jobId = String(params?.jobId || "");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<JobReportResponse | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [modalMessage, setModalMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    reportApi
      .jobReport(jobId, { search: search.trim() || undefined, page, limit })
      .then((d) => {
        if (!mounted) return;
        setData(d || null);
      })
      .catch(() => {
        if (!mounted) return;
        setData(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [jobId, search, page]);

  const job = data?.job;
  const rows = data?.logs || [];

  const total = Number(data?.total ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < pageCount;

  const sent = Number(job?.summary?.sent ?? 0);
  const failed = Number(job?.summary?.failed ?? 0);
  const pending = Number(job?.summary?.pending ?? 0);

  const infoRow = (label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-lg font-semibold text-gray-900">My Job Details : - {jobId}</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-900">Job Information</div>
          </div>

          <div className="p-4">
            {infoRow("Job ID:", <span className="font-medium">{job?.jobId || jobId}</span>)}
            {infoRow("Job Status:", <StatusLabel status={String(job?.status || "-")} />)}
            {infoRow("Channel:", job?.channel || "-")}
            {infoRow("IP Address:", job?.ip || "-")}
            {infoRow(
              "Message:",
              <button
                type="button"
                onClick={() => setModalMessage(String(job?.message || ""))}
                className="inline-flex items-center justify-center p-1.5 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                title="View message"
                disabled={!job?.message}
              >
                <Eye className="w-4 h-4" />
              </button>,
            )}
            {infoRow("Date:", job?.date ? formatDateTime(job.date) : "-")}
            {infoRow("Total Bill Credit:", job?.totalBillCredit ?? 0)}
            {infoRow("Message Type:", job?.type || "WEB")}
            {infoRow(
              "Download Attachment:",
              <button
                type="button"
                className="px-4 py-1.5 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Download
              </button>,
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-900">Summary</div>
          </div>
          <div className="p-6 flex items-center justify-center">
            <PieChart sent={sent} failed={failed} pending={pending} />
          </div>
        </div>
      </div>

      {/* Message Delivery Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            type="button"
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-1 w-fit"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <div className="relative">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder=""
                className="w-48 px-3 py-1.5 rounded border border-gray-300 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-gray-700">
                <th className="text-left px-4 py-3 font-semibold">Number</th>
                <th className="text-left px-4 py-3 font-semibold">Sent At</th>
                <th className="text-center px-4 py-3 font-semibold">Bill Credit</th>
                <th className="text-center px-4 py-3 font-semibold">Refund</th>
                <th className="text-center px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={`${r.number}-${idx}`} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{r.number}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDateTime(r.sentAt)}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{r.credit}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{r.refund ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-center">
                      <DeliveryBadge status={r.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex items-center justify-end gap-1">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {modalMessage !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalMessage(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Message</div>
              <button
                type="button"
                onClick={() => setModalMessage(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
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
