"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import { auth } from "../utils/auth";

export default function ClientPanelShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = auth.getToken();
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}
