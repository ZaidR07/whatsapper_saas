"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { MoreVertical, Plus, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import AddDeviceModal from "../whatsapp/AddDeviceModal";
import {
  useConnectDevice,
  useDeviceQr,
  useDeviceStatus,
  useDevices,
  useLogoutDeleteDevice,
  useRefreshDevice,
  useSetDeviceUserStatus,
} from "../hooks/useDevices";

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

const truncateMiddle = (s: string, left = 10, right = 6) => {
  if (!s) return "";
  if (s.length <= left + right + 3) return s;
  return `${s.slice(0, left)}...${s.slice(-right)}`;
};

function BySystemBadge({ status }: { status: string }) {
  const normalized = String(status || "").toLowerCase();
  const label =
    normalized === "connected"
      ? "CONNECTED"
      : normalized === "waiting_for_qr"
        ? "QRCODE"
        : normalized === "connecting"
          ? "CONNECTING"
          : "DISCONNECTED";
  const cls =
    label === "CONNECTED"
      ? "bg-green-100 text-green-700"
      : label === "QRCODE"
        ? "bg-blue-600 text-white"
        : label === "CONNECTING"
          ? "bg-yellow-100 text-yellow-800"
        : "bg-gray-100 text-gray-700";
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls}`}>{label}</span>;
}

function ByUserBadge({ userStatus }: { userStatus?: string }) {
  const normalized = String(userStatus || "").toLowerCase();
  if (!normalized) return <span className="text-gray-400">null</span>;
  const label = normalized === "online" ? "ONLINE" : "OFFLINE";
  const cls = label === "ONLINE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls}`}>{label}</span>;
}

function ConfirmModal({
  open,
  title,
  message,
  confirmText,
  onCancel,
  onConfirm,
  busy,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="text-lg font-bold text-gray-900">{title}</div>
          <div className="text-sm text-gray-600 mt-1">{message}</div>
        </div>
        <div className="p-5 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold disabled:opacity-50"
          >
            ❌ No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            ✔ Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScanDevicePage() {
  const qc = useQueryClient();
  const devices = useDevices();
  const connectDevice = useConnectDevice();
  const refreshDevice = useRefreshDevice();
  const setUserStatus = useSetDeviceUserStatus();
  const logoutDelete = useLogoutDeleteDevice();

  const [showScanModal, setShowScanModal] = useState(false);
  const [method, setMethod] = useState<"qr" | "pairing">("qr");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const deviceStatus = useDeviceStatus(activeDeviceId);
  const deviceQr = useDeviceQr(activeDeviceId);

  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [confirm, setConfirm] = useState<null | {
    deviceId: string;
    type: "online" | "offline" | "logout_delete";
  }>(null);

  const list = devices.data?.devices || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((d) => {
      const channel = String(d.phoneNumber || "");
      const ip = String(d.ipAddress || "");
      const token = String(d.sessionToken || "");
      return channel.toLowerCase().includes(q) || ip.toLowerCase().includes(q) || token.toLowerCase().includes(q);
    });
  }, [list, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleAddDevice = async () => {
    try {
      const res = await connectDevice.mutateAsync({
        deviceName: deviceName.trim() || undefined,
        method,
        phoneNumber: method === "pairing" ? phoneNumber : undefined,
      });
      setActiveDeviceId(res?.device?.id || null);
      setShowScanModal(true);
    } catch {
      setShowScanModal(true);
    }
  };

  useEffect(() => {
    const s = deviceStatus.data?.wsStatus?.status;
    if (s === "connected") {
      devices.refetch();
      setShowScanModal(false);
      setActiveDeviceId(null);
      setPhoneNumber("");
      setDeviceName("");
    }
  }, [deviceStatus.data, devices]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = menuRef.current;
      if (!el) return;
      if (openMenuFor && !el.contains(e.target as Node)) {
        setOpenMenuFor(null);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [openMenuFor]);

  const patchDeviceInCache = (deviceId: string, patch: Partial<(typeof list)[number]>) => {
    qc.setQueryData(["devices"], (old: any) => {
      if (!old || !Array.isArray(old.devices)) return old;
      return {
        ...old,
        devices: old.devices.map((d: any) => (String(d.id) === String(deviceId) ? { ...d, ...patch } : d)),
      };
    });
  };

  const removeDeviceFromCache = (deviceId: string) => {
    qc.setQueryData(["devices"], (old: any) => {
      if (!old || !Array.isArray(old.devices)) return old;
      return {
        ...old,
        devices: old.devices.filter((d: any) => String(d.id) !== String(deviceId)),
      };
    });
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Channels / Devices</h3>
          <button
            type="button"
            onClick={handleAddDevice}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Device
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 flex items-center justify-end">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 font-semibold">Search:</div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search:"
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left min-w-[1100px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Channel</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Device Added At</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Token</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">By System</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">By User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(pageItems || []).length > 0 ? (
                pageItems.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{d.phoneNumber || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{d.ipAddress || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(d.createdAt)}</td>
                    <td className="px-6 py-4 text-sm font-mono text-blue-600" title={d.sessionToken || ""}>
                      {truncateMiddle(d.sessionToken || "-")}
                    </td>
                    <td className="px-6 py-4">
                      <BySystemBadge status={d.status} />
                    </td>
                    <td className="px-6 py-4">
                      <ByUserBadge userStatus={d.userStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative overflow-visible inline-block" ref={openMenuFor === d.id ? menuRef : null}>
                        <button
                          type="button"
                          onClick={() => setOpenMenuFor((cur) => (cur === d.id ? null : d.id))}
                          className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>

                        {openMenuFor === d.id ? (
                          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                            <button
                              type="button"
                              onClick={async () => {
                                setOpenMenuFor(null);
                                const res = await refreshDevice.mutateAsync(d.id).catch(() => null);
                                const status = (res as any)?.device?.status;
                                const phoneNumber = (res as any)?.device?.phoneNumber;
                                if (status || phoneNumber) {
                                  patchDeviceInCache(d.id, {
                                    ...(status ? { status } : {}),
                                    ...(phoneNumber ? { phoneNumber } : {}),
                                  });
                                }
                              }}
                              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                            >
                              Refresh Channel Status
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                setOpenMenuFor(null);
                                setConfirm({ deviceId: d.id, type: "online" });
                              }}
                              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                            >
                              Put ONLINE
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                setOpenMenuFor(null);
                                setConfirm({ deviceId: d.id, type: "offline" });
                              }}
                              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                            >
                              Put OFFLINE
                            </button>
                            <div className="h-px bg-gray-100" />
                            <button
                              type="button"
                              onClick={async () => {
                                setOpenMenuFor(null);
                                setConfirm({ deviceId: d.id, type: "logout_delete" });
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                            >
                              Logout &amp; Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                    No devices found. Click 'Add Device' to scan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-semibold"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-semibold"
          >
            Next
          </button>
        </div>
      </div>

      <AddDeviceModal
        showScanModal={showScanModal}
        setShowScanModal={setShowScanModal}
        method={method}
        setMethod={setMethod}
        deviceName={deviceName}
        setDeviceName={setDeviceName}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        wsStatus={{
          ...(deviceStatus.data?.wsStatus || { status: "disconnected", qr: null, pairingCode: null, channels: [] }),
          qr: deviceQr.data?.status === "ready" ? deviceQr.data?.qr || null : deviceStatus.data?.wsStatus?.qr || null,
        }}
        handleAddDevice={handleAddDevice}
      />

      <ConfirmModal
        open={!!confirm}
        title={confirm?.type === "logout_delete" ? "Logout & Delete" : "Change status"}
        message={
          confirm?.type === "online"
            ? `Really put ${(list.find((x) => x.id === confirm.deviceId)?.phoneNumber || "-")} as ONLINE ?`
            : confirm?.type === "offline"
              ? `Really put ${(list.find((x) => x.id === confirm.deviceId)?.phoneNumber || "-")} as OFFLINE ?`
              : "Are you sure you want to logout and delete this device?"
        }
        confirmText="Confirm"
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (!confirm) return;
          const { deviceId, type } = confirm;

          if (type === "online") {
            patchDeviceInCache(deviceId, { userStatus: "online" });
            setConfirm(null);
            await setUserStatus.mutateAsync({ deviceId, userStatus: "online" }).catch(() => {
              patchDeviceInCache(deviceId, { userStatus: "" });
            });
            return;
          }

          if (type === "offline") {
            patchDeviceInCache(deviceId, { userStatus: "offline" });
            setConfirm(null);
            await setUserStatus.mutateAsync({ deviceId, userStatus: "offline" }).catch(() => {
              patchDeviceInCache(deviceId, { userStatus: "" });
            });
            return;
          }

          if (type === "logout_delete") {
            removeDeviceFromCache(deviceId);
            setConfirm(null);
            await logoutDelete.mutateAsync(deviceId).catch(() => {
              devices.refetch();
            });
          }
        }}
        busy={setUserStatus.isPending || logoutDelete.isPending}
      />
    </>
  );
}
