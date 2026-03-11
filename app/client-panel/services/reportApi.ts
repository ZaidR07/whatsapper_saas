import { api } from "./api";

export type WebReportRow = {
  jobId: string;
  channel: string;
  bill: number;
  message: string;
  sentTime: string;
  status: "completed" | "failed" | "pending";
};

export type WebReportResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  rows: WebReportRow[];
};

export type JobReportLogRow = {
  number: string;
  sentAt: string;
  credit: number;
  refund: boolean;
  status: "sent" | "failed" | "pending";
};

export type JobReportResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  job: {
    jobId: string;
    status: string;
    channel: string;
    ip: string;
    message: string;
    date: string;
    totalBillCredit: number;
    type: string;
    summary?: { sent: number; failed: number; pending: number };
  };
  logs: JobReportLogRow[];
};

export const reportApi = {
  webReport: async (params: { date?: string; search?: string; page?: number; limit?: number }) => {
    const res = await api.get("/client/web-report", { params });
    return res.data as WebReportResponse;
  },

  jobReport: async (jobId: string, params?: { search?: string; page?: number; limit?: number }) => {
    const res = await api.get(`/client/job-report/${encodeURIComponent(String(jobId))}`, { params });
    return res.data as JobReportResponse;
  },
};
