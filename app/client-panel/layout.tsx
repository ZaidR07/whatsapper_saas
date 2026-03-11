import React from "react";

import Sidebar from "./components/Sidebar";
import Navbar from "../../components/Navbar";
import ClientPanelShell from "./shell/ClientPanelShell";

export default function ClientPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientPanelShell>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />

        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Navbar />

          <main className="flex-1 overflow-y-auto p-8 space-y-8 pt-24">{children}</main>
        </div>
      </div>
    </ClientPanelShell>
  );
}
