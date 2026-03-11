"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

import { auth } from "../utils/auth";

type HeaderProps = {
  activeTab: string;
};

export default function Header({ activeTab }: HeaderProps) {
  const router = useRouter();
  const client = auth.getClient();

  const handleLogout = () => {
    auth.logout();
    router.replace("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
      <h2 className="text-xl font-semibold text-gray-800">
        {activeTab === "dashboard" ? "Dashboard" : activeTab === "whatsapp-scan" ? "Whatsapp Scan" : "Campaign"}
      </h2>
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          type="button"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
          <User className="w-4 h-4" /> {client?.username ? `Welcome, ${client.username}` : "Client"}
        </div>
      </div>
    </header>
  );
}
