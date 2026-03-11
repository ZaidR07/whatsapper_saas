"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../../components/Navbar";
import { clientProfileApi } from "../client-panel/services/clientProfileApi";
import { auth } from "../client-panel/utils/auth";

type ProfileForm = {
 name: string;
 companyName: string;
 username: string;
 email: string;
 mobile: string;
 password: string;
 credits: number;
};

export default function ProfilePage() {
 const router = useRouter();
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState("");
 const [success, setSuccess] = useState("");

 const [form, setForm] = useState<ProfileForm>({
  name: "",
  companyName: "",
  username: "",
  email: "",
  mobile: "",
  password: "",
  credits: 0,
 });

 useEffect(() => {
  const token = auth.getToken();
  if (!token) {
   router.replace("/login");
   return;
  }

  const load = async () => {
   try {
    setLoading(true);
    setError("");

    const data = await clientProfileApi.me();
    const client = data?.client;

    setForm({
     name: client?.name || "",
     companyName: client?.companyName || "",
     username: client?.username || "",
     email: client?.email || "",
     mobile: client?.mobile || "",
     password: "",
     credits: Number(client?.credits ?? 0),
    });

    if (client?.id && client?.username) {
     auth.setClient({
      id: client.id,
      companyName: client.companyName,
      username: client.username,
      credits: Number(client.credits ?? 0),
     });
    }
   } catch (e: any) {
    setError(e?.response?.data?.message || e?.message || "Failed to load profile");
   } finally {
    setLoading(false);
   }
  };

  load();
 }, [router]);

 const onChange = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm((prev) => ({ ...prev, [key]: e.target.value }));
 };

 const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  setError("");
  setSuccess("");

  try {
   const payload: any = {
    name: form.name,
    companyName: form.companyName,
    email: form.email,
    mobile: form.mobile,
   };

   if (form.password) {
    payload.password = form.password;
   }

   const data = await clientProfileApi.updateProfile(payload);
   const client = data?.client;

   setForm((prev) => ({
    ...prev,
    name: client?.name || prev.name,
    companyName: client?.companyName || prev.companyName,
    username: client?.username || prev.username,
    email: client?.email || "",
    mobile: client?.mobile || "",
    password: "",
    credits: Number(client?.credits ?? prev.credits),
   }));

   if (client?.id && client?.username) {
    auth.setClient({
     id: client.id,
     companyName: client.companyName,
     username: client.username,
     credits: Number(client.credits ?? 0),
    });
   }

   setSuccess("Profile updated successfully");
  } catch (e: any) {
   setError(e?.response?.data?.message || e?.message || "Failed to update profile");
  } finally {
   setSaving(false);
  }
 };

 return (
  <div className="min-h-screen bg-gray-50">
   <Navbar />

   <div className="pt-24 px-4 pb-10">
    <div className="max-w-4xl mx-auto">
     <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile &amp; Account</h1>
      <p className="text-sm text-gray-500">Manage your account details.</p>
     </div>

     <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
       <div>
        <div className="text-sm text-gray-500">Credits</div>
        <div className="text-lg font-semibold text-gray-900">{form.credits}</div>
       </div>
       <button
        type="button"
        onClick={() => router.push("/client-panel")}
        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
       >
        Back to Dashboard
       </button>
      </div>

      <div className="px-6 py-6">
       {loading ? <div className="text-gray-600">Loading...</div> : null}

       {!loading ? (
        <form onSubmit={onSubmit} className="space-y-5">
         {error ? (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
         ) : null}

         {success ? (
          <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
           {success}
          </div>
         ) : null}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
           <label className="block text-sm font-semibold text-gray-700">Full Name</label>
           <input
            value={form.name}
            onChange={onChange("name")}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
           />
          </div>

          <div>
           <label className="block text-sm font-semibold text-gray-700">Company Name</label>
           <input
            value={form.companyName}
            onChange={onChange("companyName")}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Company name"
           />
          </div>

          <div>
           <label className="block text-sm font-semibold text-gray-700">Username</label>
           <input
            value={form.username}
            disabled
            className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-600"
           />
          </div>

          <div>
           <label className="block text-sm font-semibold text-gray-700">Email</label>
           <input
            type="email"
            value={form.email}
            onChange={onChange("email")}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="name@company.com"
           />
          </div>

          <div>
           <label className="block text-sm font-semibold text-gray-700">Mobile</label>
           <input
            value={form.mobile}
            onChange={onChange("mobile")}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+91 98765 43210"
           />
          </div>

          <div>
           <label className="block text-sm font-semibold text-gray-700">New Password</label>
           <input
            type="password"
            value={form.password}
            onChange={onChange("password")}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Leave blank to keep current"
           />
          </div>
         </div>

         <div className="pt-2 flex items-center justify-end">
          <button
           type="submit"
           disabled={saving}
           className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-5 py-2 disabled:opacity-60"
          >
           {saving ? "Saving..." : "Update Profile"}
          </button>
         </div>
        </form>
       ) : null}
      </div>
     </div>
    </div>
   </div>
  </div>
 );
}
