"use client";

import React, { useEffect, useState } from "react";

import CampaignForm from "../campaign/CampaignForm";
import CampaignResults from "../campaign/CampaignResults";

import { useWhatsAppStatus } from "../hooks/useWhatsAppStatus";

export default function CampaignsPage() {
  const { data: wsStatus } = useWhatsAppStatus();

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
    </>
  );
}
