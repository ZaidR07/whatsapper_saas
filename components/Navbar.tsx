"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

import { auth } from "../app/client-panel/utils/auth";
import { clientMeApi } from "../app/client-panel/services/clientMeApi";

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const client = auth.getClient();
    setCredits(Number(client?.credits ?? 0));
  }, []);

  useEffect(() => {
    let mounted = true;

    const tick = async () => {
      try {
        const token = auth.getToken();
        if (!token) return;

        const data = await clientMeApi.me();
        const c = data?.client;
        if (!mounted || !c) return;
        setCredits(Number(c.credits ?? 0));

        const cached = auth.getClient();
        if (cached) {
          auth.setClient({ ...cached, credits: Number(c.credits ?? 0) });
        }
      } catch {
        // ignore
      }
    };

    tick();
    const onFocus = () => tick();
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mounted = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

 useEffect(() => {
  const onStorage = () => {
   const client = auth.getClient();
   setCredits(Number(client?.credits ?? 0));
  };

  const onAuthChanged = () => {
   const client = auth.getClient();
   setCredits(Number(client?.credits ?? 0));
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("auth_changed", onAuthChanged);
  return () => {
   window.removeEventListener("storage", onStorage);
   window.removeEventListener("auth_changed", onAuthChanged);
  };
 }, []);

 useEffect(() => {
  const onClick = (e: MouseEvent) => {
   if (!open) return;
   const el = containerRef.current;
   if (!el) return;
   if (e.target instanceof Node && !el.contains(e.target)) {
    setOpen(false);
   }
  };

  document.addEventListener("mousedown", onClick);
  return () => document.removeEventListener("mousedown", onClick);
 }, [open]);

 const logout = () => {
  auth.logout();
  router.replace("/login");
 };

 return (
  <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-gray-200">
   <div className="h-full px-6 flex items-center justify-end">
    <div className="flex items-center gap-4" ref={containerRef}>
     <div className="text-sm font-semibold text-gray-700">
      Credit available Whatsapp Api <span className="text-blue-600">[{credits}]</span>
     </div>

     <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-50"
      aria-label="Open user menu"
     >
      <User className="h-5 w-5 text-gray-700" />
     </button>

     {open ? (
      <div className="absolute right-6 top-14 w-52 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
       <button
        type="button"
        onClick={() => {
         setOpen(false);
         router.push("/profile");
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
       >
        Profile &amp; Account
       </button>
       <button
        type="button"
        onClick={logout}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
       >
        Logout
       </button>
      </div>
     ) : null}
    </div>
   </div>
  </div>
 );
}
