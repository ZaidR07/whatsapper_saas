"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/app/lib/utils";

export type QuickLinkItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

export default function QuickLinks({ items }: { items: QuickLinkItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} className={cn("group flex items-center gap-3")}> 
            <div className="w-9 h-9 rounded-md bg-white/80 border border-white shadow-sm flex items-center justify-center group-hover:bg-white transition-colors">
              <Icon className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div className="text-sm font-semibold text-blue-700 group-hover:underline">{item.title}</div>
          </Link>
        );
      })}
    </div>
  );
}
