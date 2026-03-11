"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WhatsAppScanPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/client-panel/scan-device");
  }, [router]);

  return null;
}
