"use client";

import React, { useMemo } from "react";

import WelcomeCard from "@/components/dashboard/WelcomeCard";

import { auth } from "../utils/auth";

export default function DashboardPage() {
  const client = auth.getClient();

  const clientName = client?.companyName || "User";
  const username = client?.username || "-";
  const userId = client?.id || "-";
  const mobile = client?.mobile || "-";
  const email = client?.email || "-";



  return (
    <div className="space-y-6">
      <WelcomeCard
        clientName={clientName}
        username={username}
        userId={userId}
        mobile={mobile}
        email={email}
      />
    </div>
  );
}
