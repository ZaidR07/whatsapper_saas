"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/app/lib/utils";
import { QrCode, RefreshCw, X } from "lucide-react";

type AddDeviceModalProps = {
  showScanModal: boolean;
  setShowScanModal: (open: boolean) => void;
  method: "qr" | "pairing";
  setMethod: (m: "qr" | "pairing") => void;
  deviceName: string;
  setDeviceName: (v: string) => void;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  wsStatus: {
    status: string;
    qr: string | null;
    pairingCode: string | null;
    channels?: Array<{ number: string; jid: string }>;
  };
  handleAddDevice: () => void;
};

export default function AddDeviceModal({
  showScanModal,
  setShowScanModal,
  method,
  setMethod,
  deviceName,
  setDeviceName,
  phoneNumber,
  setPhoneNumber,
  wsStatus,
  handleAddDevice,
}: AddDeviceModalProps) {
  if (!showScanModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowScanModal(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-bold text-gray-800">Add New Device</h3>
          <button onClick={() => setShowScanModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-50 flex gap-4 shrink-0">
          <button
            onClick={() => setMethod("qr")}
            className={cn(
              "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
              method === "qr" ? "bg-blue-50 text-blue-600 border border-blue-100" : "text-gray-500 hover:bg-gray-50",
            )}
          >
            QR Code
          </button>
          <button
            onClick={() => setMethod("pairing")}
            className={cn(
              "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
              method === "pairing" ? "bg-blue-50 text-blue-600 border border-blue-100" : "text-gray-500 hover:bg-gray-50",
            )}
          >
            Pairing Code
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto flex flex-col items-center bg-white space-y-6 text-center">
          <div className="w-full max-w-[320px] space-y-2 text-left">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Device Name</label>
            <input
              type="text"
              placeholder="e.g. Office WhatsApp"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
            />
            <p className="text-[10px] text-gray-400 ml-1 italic">* Optional, helps you identify devices</p>
          </div>

          {method === "qr" ? (
            <div className="p-4 border-2 border-blue-50 rounded-2xl bg-white shadow-xl transition-all hover:scale-[1.01] flex items-center justify-center min-h-[300px] w-full max-w-[320px]">
              {wsStatus.qr ? (
                <div className="relative p-2 bg-white rounded-lg">
                  <QRCodeSVG value={wsStatus.qr} size={260} level="H" includeMargin={true} />
                  <div className="absolute inset-0 border-4 border-blue-500/5 rounded-lg pointer-events-none" />
                </div>
              ) : (
                <div className="w-64 h-64 flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-sm gap-4 rounded-xl border border-slate-100">
                  <div className="relative">
                    <RefreshCw className="w-12 h-12 animate-spin text-blue-500/50" />
                    <QrCode className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
                  </div>
                  <p className="font-medium px-4">Initializing QR Engine...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-[320px] space-y-6 flex flex-col items-center">
              <div className="w-full space-y-2 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 919876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                  />
                  <button
                    onClick={handleAddDevice}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 ml-1 italic">* Enter with country code, no "+" or spaces</p>
              </div>

              <div className="p-8 border-2 border-dashed border-blue-100 rounded-2xl bg-blue-50/30 w-full flex flex-col items-center justify-center min-h-[120px]">
                {wsStatus.pairingCode ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-2">
                      {wsStatus.pairingCode.split("").map((char, i) => (
                        <span
                          key={i}
                          className={cn(
                            "w-8 h-10 flex items-center justify-center bg-white border border-blue-200 rounded-lg text-xl font-bold text-blue-600 shadow-sm",
                            char === "-" && "bg-transparent border-none w-4 text-blue-300",
                          )}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-2">Enter this code on your phone</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-gray-400">Pairing code will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleAddDevice}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 underline flex items-center justify-center gap-2 py-2 px-4 hover:bg-blue-50 rounded-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Retry Connection
          </button>
        </div>

        <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-center sm:justify-end gap-3 shrink-0">
          <button
            onClick={() => setShowScanModal(false)}
            className="px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
