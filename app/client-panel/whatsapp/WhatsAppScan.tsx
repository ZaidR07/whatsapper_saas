"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useDeleteDevice, useDevices, useDisconnectDevice } from "../hooks/useDevices";

type WhatsAppScanProps = {
  method: "qr" | "pairing";
  phoneNumber: string;
  setShowScanModal: (open: boolean) => void;
  onAddDevice?: () => void;
};

export default function WhatsAppScan({ method, phoneNumber, setShowScanModal, onAddDevice }: WhatsAppScanProps) {
  const { data, isLoading } = useDevices();
  const disconnectDevice = useDisconnectDevice();
  const deleteDevice = useDeleteDevice();

  if (isLoading) {
    return <div>Loading WhatsApp status...</div>;
  }

  const handleAddDevice = () => {
    if (onAddDevice) {
      onAddDevice();
      return;
    }

    setShowScanModal(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Channels/Devices</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button
            onClick={handleAddDevice}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Device
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Channel</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">IP Address</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Device Added At</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Token</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data?.devices || []).length > 0 ? (
              (data?.devices || []).map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{d.deviceName || "Connected Device"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{d.ipAddress || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(d.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-mono text-blue-600">{d.sessionToken || "-"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        d.status === "connected"
                          ? "px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase"
                          : "px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase"
                      }
                    >
                      {String(d.status || "disconnected").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => disconnectDevice.mutate(d.id)}
                      className="text-xs font-semibold px-3 py-1 rounded border hover:bg-gray-50"
                      disabled={disconnectDevice.isPending}
                    >
                      Disconnect
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDevice.mutate(d.id)}
                      className="text-xs font-semibold px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                      disabled={deleteDevice.isPending}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                  No connected devices found. Click 'Add Device' to scan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
