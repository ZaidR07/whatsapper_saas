"use client";

import React, { useEffect, useState } from "react";

import CampaignForm from "../campaign/CampaignForm";
import CampaignResults from "../campaign/CampaignResults";

import { useWhatsAppStatus } from "../hooks/useWhatsAppStatus";
import { useCampaigns } from "../hooks/useCampaigns";

export default function CampaignsPage() {
  const { data: wsStatus } = useWhatsAppStatus();
  const campaigns = useCampaigns();

  const [campaignCountryCode, setCampaignCountryCode] = useState("91");
  const [campaignIntervalSeconds, setCampaignIntervalSeconds] = useState("3");
  const [campaignNumbers, setCampaignNumbers] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [campaignResults, setCampaignResults] = useState<Array<{ number: string; success: boolean; error?: string }>>([]);
  const [selectedChannel, setSelectedChannel] = useState("");

  useEffect(() => {
    const channels = wsStatus?.channels || [];
    if (!selectedChannel && channels.length > 0) {
      setSelectedChannel(channels[0].number);
    }
  }, [wsStatus, selectedChannel]);

  return (
    <>
      <CampaignForm
        campaignCountryCode={campaignCountryCode}
        campaignIntervalSeconds={campaignIntervalSeconds}
        campaignNumbers={campaignNumbers}
        campaignMessage={campaignMessage}
        setCampaignCountryCode={setCampaignCountryCode}
        setCampaignIntervalSeconds={setCampaignIntervalSeconds}
        setCampaignNumbers={setCampaignNumbers}
        setCampaignMessage={setCampaignMessage}
        onResults={(results) => setCampaignResults(results)}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
        wsStatus={
          wsStatus || {
            status: "disconnected",
            qr: null,
            pairingCode: null,
            channels: [],
          }
        }
      />

      <CampaignResults campaignResults={campaignResults} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Campaigns</h3>
          <p className="text-sm text-gray-500 mt-1">Recent campaigns for your account.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Device</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Numbers</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sent</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Failed</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(campaigns.data?.campaigns || []).length > 0 ? (
                (campaigns.data?.campaigns || []).map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{c.campaignName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{String(c.deviceId || "-")}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.numbers}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.sent}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.failed}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.date).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                    {campaigns.isLoading ? "Loading campaigns..." : "No campaigns found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
