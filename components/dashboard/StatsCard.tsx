"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/app/lib/utils";

export default function StatsCard({
  title,
  href,
  accent = "blue",
}: {
  title: string;
  href?: string;
  accent?: "blue" | "green" | "orange" | "red" | "purple";
}) {
  const accentClass =
    accent === "green"
      ? "from-green-50 to-white"
      : accent === "orange"
        ? "from-orange-50 to-white"
        : accent === "red"
          ? "from-red-50 to-white"
          : accent === "purple"
            ? "from-purple-50 to-white"
            : "from-blue-50 to-white";

  return (
    <div className={cn("rounded-xl shadow-sm border border-gray-100 bg-gradient-to-r", accentClass)}>
      <div className="p-5">
        <div className="text-sm font-semibold text-gray-700">{title}</div>
        {href ? (
          <Link href={href} className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline">
            Get Count
          </Link>
        ) : (
          <button type="button" className="mt-2 text-sm font-semibold text-blue-600 hover:underline">
            Get Count
          </button>
        )}
      </div>
    </div>
  );
}
