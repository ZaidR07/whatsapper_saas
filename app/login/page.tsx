"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { clientAuthApi } from "../client-panel/services/clientAuthApi";
import { auth } from "../client-panel/utils/auth";

export default function LoginPage() {
 const router = useRouter();
 const [username, setUsername] = useState("");
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
   const data = await clientAuthApi.login({ username, password });

   if (data?.token) {
    auth.setToken(data.token);
   }
   if (data?.client) {
    auth.setClient(data.client);
   }

   router.replace("/client-panel");
  } catch (err: any) {
   setError(err?.response?.data?.message || "Login failed");
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
   <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
    <h1 className="text-2xl font-bold text-gray-900">Client Login</h1>
    <p className="text-sm text-gray-500 mt-1">Login with credentials provided by admin.</p>

    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
     <div>
      <label className="block text-sm font-semibold text-gray-700">Username</label>
      <input
       value={username}
       onChange={(e) => setUsername(e.target.value)}
       className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
       placeholder="Enter username"
       autoComplete="username"
      />
     </div>

     <div>
      <label className="block text-sm font-semibold text-gray-700">Password</label>
      <input
       type="password"
       value={password}
       onChange={(e) => setPassword(e.target.value)}
       className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
       placeholder="Enter password"
       autoComplete="current-password"
      />
     </div>

     {error ? <div className="text-sm text-red-600">{error}</div> : null}

     <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 disabled:opacity-60"
     >
      {loading ? "Logging in..." : "Login"}
     </button>
    </form>
   </div>
  </div>
 );
}
