"use client";

import React, { useMemo } from "react";
import {
  FileBarChart,
  Mail,
  MessageCircle,
  Send,
  Smartphone,
  User,
  UserCircle,
  Hash,
} from "lucide-react";

import QuickLinks, { type QuickLinkItem } from "./QuickLinks";

export default function WelcomeCard({
  clientName,
  username,
  userId,
  mobile,
  email,
}: {
  clientName: string;
  username: string;
  userId: string;
  mobile: string;
  email: string;
}) {
  const links = useMemo<QuickLinkItem[]>(
    () => [
      { title: "Campaign", href: "/client-panel/campaigns", icon: Send },
      { title: "Report", href: "/client-panel/reports/web", icon: FileBarChart },
      { title: "Whatsapp Scan", href: "/client-panel/whatsapp-scan", icon: MessageCircle },
      { title: "My Profile", href: "/profile", icon: UserCircle },
    ],
    [],
  );

  const info: Array<{ label: string; value: string; icon: React.ElementType; isEmail?: boolean }> = [
    { label: "Username", value: username, icon: User },
    { label: "User ID", value: userId, icon: Hash },
    { label: "Mobile", value: mobile, icon: Smartphone },
    { label: "Mail ID", value: email, icon: Mail, isEmail: true },
  ];

  return (
    <div className="rounded-xl shadow-sm border border-gray-100 overflow-hidden bg-white">
      <div className="relative bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-6">
        <div className="absolute right-0 top-0 h-full w-32 bg-emerald-100/30 rounded-l-full" />
        <div className="absolute right-10 bottom-0 h-40 w-40 bg-sky-100/40 rounded-full translate-y-1/3" />

        <div className="relative">
          <div className="text-lg font-semibold text-blue-700">Welcome {clientName}</div>
          <div className="text-sm text-gray-500 mt-1">Here are some quick links for you to start</div>

          <div className="mt-6">
            <QuickLinks items={links} />
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-6">
            {info.map((x) => {
              const Icon = x.icon;
              return (
                <div key={x.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-white/80 border border-white shadow-sm flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-600">{x.label}</div>
                    {x.isEmail ? (
                      <a
                        className="text-xs text-gray-400 truncate hover:underline"
                        href={`mailto:${x.value}`}
                        title={x.value}
                      >
                        {x.value}
                      </a>
                    ) : (
                      <div className="text-xs text-gray-400 truncate" title={x.value}>
                        {x.value}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
