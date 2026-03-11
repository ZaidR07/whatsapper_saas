"use client";

import React, { useMemo } from "react";

import WelcomeCard from "@/components/dashboard/WelcomeCard";
import StatsCard from "@/components/dashboard/StatsCard";
import { auth } from "../utils/auth";

export default function DashboardPage() {
  const client = auth.getClient();

  const clientName = client?.companyName || "User";
  const username = client?.username || "-";
  const userId = client?.id || "-";

  const cards = useMemo(
    () => [
      { title: "Total Sent", accent: "blue" as const },
      { title: "Total Delivered", accent: "green" as const },
      { title: "Total Failed", accent: "red" as const },
      { title: "Total API Sent", accent: "blue" as const },
      { title: "Total API Delivered", accent: "green" as const },
      { title: "Total API Failed", accent: "red" as const },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <WelcomeCard
        clientName={clientName}
        username={username}
        userId={userId}
        mobile={"8626072002"}
        email={"wetrustproperty.business@gmail.com"}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <StatsCard key={c.title} title={c.title} accent={c.accent} />
        ))}
      </div>
    </div>
  );
}
