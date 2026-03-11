"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  LayoutDashboard,
  Lightbulb,
  List,
  LogOut,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { auth } from "../utils/auth";

const navItemBase = "w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors";

type MenuLabel = { type: "label"; label: string };
type MenuLink = { label: string; icon: React.ElementType; path: string };
type MenuAction = { label: string; icon: React.ElementType; action: "logout" };
type MenuGroup = { label: string; icon: React.ElementType; key: "reports" | "utilities"; children: Array<{ label: string; path: string }> };
type MenuItem = MenuLabel | MenuLink | MenuAction | MenuGroup;

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        navItemBase,
        active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100",
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<null | "reports" | "utilities">(null);

  const menu: MenuItem[] = useMemo(
    () => [
      { label: "Dashboard", icon: LayoutDashboard, path: "/client-panel/dashboard" },
      { label: "Logout", icon: LogOut, action: "logout" },

      { type: "label", label: "User" },

      { label: "Campaign", icon: Calendar, path: "/client-panel/campaigns" },

      {
        label: "Reports",
        icon: List,
        key: "reports",
        children: [
          { label: "Web Report", path: "/client-panel/reports/web" },
        ],
      },

      {
        label: "Utilities",
        icon: Lightbulb,
        key: "utilities",
        children: [
          { label: "IP Logs", path: "/client-panel/utilities/ip-logs" },
          { label: "Transaction Details", path: "/client-panel/utilities/transactions" },
          { label: "Credit Usage", path: "/client-panel/utilities/credit-usage" },
        ],
      },

      { type: "label", label: "Scan Device" },

      // CRITICAL: must always remain visible & clickable
      { label: "Whatsapp Scan", icon: MessageCircle, path: "/client-panel/scan-device" },
    ],
    [],
  );

  useEffect(() => {
    if (pathname.startsWith("/client-panel/reports")) {
      setOpenMenu("reports");
      return;
    }
    if (pathname.startsWith("/client-panel/utilities")) {
      setOpenMenu("utilities");
    }
  }, [pathname]);

  const handleAction = (action: MenuAction["action"]) => {
    if (action === "logout") {
      auth.logout();
      router.replace("/login");
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 text-blue-600 font-bold text-xl">
          <MessageSquare className="w-6 h-6" />
          WA Panel
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menu.map((item) => {
          if ("type" in item && item.type === "label") {
            return (
              <div
                key={`label:${item.label}`}
                className="pt-4 pb-2 px-4 text-[12px] font-medium text-gray-400 uppercase tracking-wider"
              >
                {item.label}
              </div>
            );
          }

          if ("action" in item) {
            const Icon = item.icon;
            return (
              <button
                key={`action:${item.label}`}
                type="button"
                onClick={() => handleAction(item.action)}
                className={cn(navItemBase, "text-gray-600 hover:bg-gray-100")}
              >
                <Icon className="w-5 h-5" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          }

          if ("children" in item) {
            const Icon = item.icon;
            const isOpen = openMenu === item.key;
            const hasActiveChild = item.children.some((c) => pathname === c.path);

            return (
              <div key={`group:${item.key}`} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setOpenMenu(isOpen ? null : item.key)}
                  className={cn(
                    navItemBase,
                    hasActiveChild ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen ? "rotate-180" : "rotate-0")} />
                </button>

                {isOpen ? (
                  <div className="space-y-1">
                    {item.children.map((c) => {
                      const active = pathname === c.path;
                      return (
                        <Link
                          key={c.path}
                          href={c.path}
                          className={cn(
                            "w-full flex items-center px-4 py-2 rounded-lg transition-colors text-sm",
                            "pl-7",
                            active ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100",
                          )}
                        >
                          {c.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          }

          if ("path" in item) {
            return <NavLink key={`link:${item.path}`} href={item.path} label={item.label} icon={item.icon} />;
          }

          return null;
        })}
      </nav>
    </div>
  );
}
