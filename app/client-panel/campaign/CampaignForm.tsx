"use client";

import React, { useEffect, useState } from "react";
import { useSendCampaign } from "../hooks/useSendCampaign";
import { useDevices } from "../hooks/useDevices";

type CampaignFormProps = {
  campaignCountryCode: string;
  campaignIntervalSeconds: string;
  campaignNumbers: string;
  campaignMessage: string;
  setCampaignCountryCode: (v: string) => void;
  setCampaignIntervalSeconds: (v: string) => void;
  setCampaignNumbers: (v: string) => void;
  setCampaignMessage: (v: string) => void;
  onResults?: (results: Array<{ number: string; success: boolean; error?: string }>) => void;
  selectedChannel: string;
  setSelectedChannel: (v: string) => void;
  wsStatus: {
    status: string;
    qr: string | null;
    pairingCode: string | null;
    channels?: Array<{ number: string; jid: string }>;
  };
};

export default function CampaignForm({
  campaignCountryCode,
  campaignIntervalSeconds,
  campaignNumbers,
  campaignMessage,
  setCampaignCountryCode,
  setCampaignIntervalSeconds,
  setCampaignNumbers,
  setCampaignMessage,
  onResults,
  selectedChannel,
  setSelectedChannel,
  wsStatus,
}: CampaignFormProps) {
  const sendCampaign = useSendCampaign();
  const devices = useDevices();

  const [campaignName, setCampaignName] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [deviceSearch, setDeviceSearch] = useState("");
  const [deviceDropdownOpen, setDeviceDropdownOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const eligibleDevices = (devices.data?.devices || []).filter(
    (d) => !!d.phoneNumber,
  );

  const selectedDevice = eligibleDevices.find((d) => d.id === selectedDeviceId) || null;
  const filteredDevices = eligibleDevices.filter((d) => {
    const q = String(deviceSearch || "").trim();
    if (!q) return true;
    return String(d.phoneNumber || "").includes(q);
  });

  useEffect(() => {
    if (!selectedDeviceId) {
      const first = eligibleDevices[0];
      if (first?.id) setSelectedDeviceId(first.id);
    }
  }, [eligibleDevices, selectedDeviceId]);

  useEffect(() => {
    if (formError) setFormError("");
  }, [campaignName, selectedDeviceId, campaignNumbers, campaignMessage, formError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDeviceId) {
      setFormError("Please select a WhatsApp device before sending campaign.");
      return;
    }

    if (!campaignName.trim() || !campaignNumbers.trim() || !campaignMessage.trim()) return;

    const parsedNumbers = campaignNumbers
      .split(/\r?\n|,|;/)
      .map((n) => n.trim())
      .filter(Boolean);

    sendCampaign.mutate(
      {
        campaignName: campaignName.trim(),
        deviceId: selectedDeviceId,
        numbers: parsedNumbers.map((raw) => {
          const n = String(raw || "").trim();
          const cc = String(campaignCountryCode || "").trim();
          if (!cc) return n;
          if (/^[0-9]+$/.test(n) && !n.startsWith(cc)) return `${cc}${n}`;
          return n;
        }),
        message: campaignMessage,
      },
      {
        onSuccess: (data: any) => {
          onResults?.(data?.results || []);
        },
      },
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">Campaign</h3>
        <p className="text-sm text-gray-500 mt-1">
          Send a message to multiple numbers with optional delay.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* Top Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign Name</label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Campaign"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Device Selection</label>
            <div className="relative">
              <input
                value={deviceDropdownOpen ? deviceSearch : selectedDevice?.phoneNumber || ""}
                onChange={(e) => {
                  setDeviceSearch(e.target.value);
                  setDeviceDropdownOpen(true);
                }}
                onFocus={() => setDeviceDropdownOpen(true)}
                onBlur={() => {
                  // Allow click selection before closing
                  setTimeout(() => setDeviceDropdownOpen(false), 120);
                }}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="-- Channel --"
                disabled={eligibleDevices.length === 0}
                inputMode="numeric"
              />

              {deviceDropdownOpen && eligibleDevices.length > 0 ? (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-auto">
                  {filteredDevices.length > 0 ? (
                    filteredDevices.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedDeviceId(d.id);
                          setDeviceSearch("");
                          setDeviceDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${d.id === selectedDeviceId ? "bg-gray-50" : ""}`}
                      >
                        {String(d.phoneNumber || "")}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No matching channels</div>
                  )}
                </div>
              ) : null}
            </div>

            {eligibleDevices.length === 0 ? (
              <p className="text-[10px] text-gray-400">No WhatsApp devices found. Please add a device in WhatsApp Scan.</p>
            ) : (
              <p className="text-[10px] text-gray-400">All devices with a WhatsApp number appear here.</p>
            )}

            {formError ? <p className="text-xs text-red-600">{formError}</p> : null}
          </div>

          {/* Country Code */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Country Code
            </label>

            <input
              type="text"
              value={campaignCountryCode}
              onChange={(e) => setCampaignCountryCode(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="91"
            />

            <p className="text-[10px] text-gray-400">
              Keep blank if numbers already include country code.
            </p>
          </div>

          {/* Interval */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Interval (seconds)
            </label>

            <input
              type="number"
              min={0}
              max={41}
              value={campaignIntervalSeconds}
              onChange={(e) => setCampaignIntervalSeconds(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3"
            />

            <p className="text-[10px] text-gray-400">
              Range 0-41 supported.
            </p>
          </div>

        </div>

        {/* Numbers + Message */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Numbers */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Enter Mobile Number
            </label>

            <textarea
              value={campaignNumbers}
              onChange={(e) => setCampaignNumbers(e.target.value)}
              className="w-full h-56 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter numbers (one per line, or separated by comma)"
            />

            <div className="text-[10px] text-gray-400 flex justify-between">
              <span>Supports comma, semicolon, or newline.</span>
              <span>{campaignNumbers.length}/5000</span>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Enter Your Message
            </label>

            <textarea
              value={campaignMessage}
              onChange={(e) => setCampaignMessage(e.target.value)}
              className="w-full h-56 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Type your message"
            />

            <div className="text-[10px] text-gray-400 flex justify-end">
              <span>{campaignMessage.length}/4000</span>
            </div>
          </div>

        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-center">
          <button
            type="submit"
            disabled={sendCampaign.isPending}
            className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {sendCampaign.isPending ? "Sending..." : "Submit"}
          </button>
        </div>

      </form>
    </div>
  );
}