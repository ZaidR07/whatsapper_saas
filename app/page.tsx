"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  LogOut,
  User,
  Phone,
  LayoutDashboard,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  QrCode,
  X
} from "lucide-react";
import { cn } from "./lib/utils";

const API_BASE_URL = "http://localhost:4000/api";

export default function WhatsAppPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showScanModal, setShowScanModal] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [method, setMethod] = useState<"qr" | "pairing">("qr");

  const [campaignCountryCode, setCampaignCountryCode] = useState("91");
  const [campaignIntervalSeconds, setCampaignIntervalSeconds] = useState("3");
  const [campaignNumbers, setCampaignNumbers] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [campaignSending, setCampaignSending] = useState(false);
  const [campaignResults, setCampaignResults] = useState<Array<{ number: string; success: boolean; error?: string }>>([]);
  const [selectedChannel, setSelectedChannel] = useState("");

  // WhatsApp State
  const [wsStatus, setWsStatus] = useState<{ 
    status: string; 
    qr: string | null;
    pairingCode: string | null;
    channels?: Array<{ number: string; jid: string }>;
  }>({
    status: "disconnected",
    qr: null,
    pairingCode: null,
  });
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("trex_admin_token") : null;
    if (token) {
      setIsAuthenticated(true);
      fetchWhatsAppStatus();
    }
    
    const interval = setInterval(() => {
      if (isAuthenticated) fetchWhatsAppStatus();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchWhatsAppStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/whatsapp/status`);
      setWsStatus(response.data);
    } catch (err) {
      console.error("Failed to fetch WhatsApp status", err);
    }
  };

  useEffect(() => {
    const channels = wsStatus.channels || [];
    if (!selectedChannel && channels.length > 0) {
      setSelectedChannel(channels[0].number);
    }
  }, [wsStatus.channels, selectedChannel]);

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignNumbers.trim() || !campaignMessage.trim()) return;

    setCampaignSending(true);
    setCampaignResults([]);
    setError("");
    setSuccess("");

    const parsedNumbers = campaignNumbers
      .split(/\r?\n|,|;/)
      .map((n) => n.trim())
      .filter(Boolean);

    try {
      const resp = await axios.post(`${API_BASE_URL}/whatsapp/campaign`, {
        numbers: parsedNumbers,
        message: campaignMessage,
        intervalSeconds: Number(campaignIntervalSeconds || 0),
        countryCode: campaignCountryCode?.trim() || null,
      });
      setCampaignResults(resp.data?.results || []);
      setSuccess("Campaign sent!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send campaign");
    } finally {
      setCampaignSending(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // The backend decryptData(req.body, KEY) returns the object directly if req.body is an object.
      // AdminLogin then destructures { email } from that returned object.
      const response = await axios.post(`${API_BASE_URL}/adminlogin`, { email });
      setSuccess(response.data.message);
      setShowOtp(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_BASE_URL}/verifyotp`, { email, otp });
      if (response.data.success) {
        setIsAuthenticated(true);
        localStorage.setItem("trex_admin_token", "verified");
        fetchWhatsAppStatus();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("trex_admin_token");
    setIsAuthenticated(false);
    setEmail("");
    setOtp("");
    setShowOtp(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !message) return;
    
    setIsSending(true);
    setError("");
    setSuccess("");
    
    try {
      await axios.post(`${API_BASE_URL}/whatsapp/send`, {
        number: recipient,
        message: message,
      });
      setSuccess("Message sent successfully!");
      setMessage("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Panel</h1>
            <p className="text-gray-500 mt-2">Sign in to manage your WhatsApp bot</p>
          </div>

          <form onSubmit={showOtp ? handleVerifyOtp : handleLogin} className="space-y-4">
            {!showOtp ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Enter OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none tracking-widest text-center text-xl font-bold"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}

            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4" /> {error}
            </div>}
            
            {success && !error && <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {success}
            </div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (showOtp ? "Verify OTP" : "Send Login OTP")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleAddDevice = async () => {
    setShowScanModal(true);
    try {
      await axios.post(`${API_BASE_URL}/whatsapp/start`, { 
        phoneNumber: method === "pairing" ? phoneNumber : null 
      });
    } catch (err) {
      console.error("Failed to start WhatsApp engine", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 text-blue-600 font-bold text-xl">
            <MessageSquare className="w-6 h-6" />
            WA Panel
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors",
              activeTab === "dashboard" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Scan device
          </div>
          
          <button 
            onClick={() => setActiveTab("whatsapp-scan")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors",
              activeTab === "whatsapp-scan" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <QrCode className="w-5 h-5" /> Whatsapp Scan
          </button>

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Messaging
          </div>

          <button 
            onClick={() => setActiveTab("campaign")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors",
              activeTab === "campaign" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Send className="w-5 h-5" /> Campaign
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {activeTab === "dashboard" ? "Dashboard" : activeTab === "whatsapp-scan" ? "Whatsapp Scan" : "Campaign"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              <User className="w-4 h-4" /> Admin
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === "dashboard" ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  { title: "Total Sent", count: 0 },
                  { title: "Total Delivered", count: 0 },
                  { title: "Total Failed", count: 0 },
                  { title: "Total API Sent", count: 0 },
                  { title: "Total API Delivered", count: 0 },
                  { title: "Total API Failed", count: 0 },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                      <h3 className="text-gray-600 font-semibold mb-2">{stat.title}</h3>
                      <div className="flex items-baseline gap-2">
                        <button className="text-blue-600 text-sm font-medium hover:underline">Get Count</button>
                        <span className="text-2xl font-bold text-gray-300">{stat.count}</span>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-full opacity-10 pointer-events-none">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-blue-500">
                        <path d="M100,0 C80,20 80,80 100,100 L100,100 L100,0 Z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : activeTab === "whatsapp-scan" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Channels/Devices</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                  </div>
                  <button 
                    onClick={handleAddDevice}
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Device
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Channel</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">IP Address</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Device Added At</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Token</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {wsStatus.status === "connected" ? (
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">Connected Device</td>
                        <td className="px-6 py-4 text-sm text-gray-500">127.0.0.1</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date().toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-mono text-blue-600">active_session_token</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                            CONNECTED
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-gray-400 hover:text-gray-600">...</button>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                          No connected devices found. Click 'Add Device' to scan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Campaign</h3>
                <p className="text-sm text-gray-500 mt-1">Send a message to multiple numbers with optional delay.</p>
              </div>

              <form onSubmit={handleSendCampaign} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Channel</label>
                    <select
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!wsStatus.channels || wsStatus.channels.length === 0}
                    >
                      {(!wsStatus.channels || wsStatus.channels.length === 0) ? (
                        <option value="">No device connected</option>
                      ) : (
                        wsStatus.channels.map((c) => (
                          <option key={c.jid} value={c.number}>{c.number}</option>
                        ))
                      )}
                    </select>
                    <p className="text-[10px] text-gray-400">Connect a device in Whatsapp Scan to enable channels.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Country Code</label>
                    <input
                      type="text"
                      value={campaignCountryCode}
                      onChange={(e) => setCampaignCountryCode(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="91"
                    />
                    <p className="text-[10px] text-gray-400">Keep blank if numbers already include country code.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interval (seconds)</label>
                    <input
                      type="number"
                      min={0}
                      max={41}
                      value={campaignIntervalSeconds}
                      onChange={(e) => setCampaignIntervalSeconds(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3"
                    />
                    <p className="text-[10px] text-gray-400">Range 0-41 supported.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enter Mobile Number</label>
                    <textarea
                      value={campaignNumbers}
                      onChange={(e) => setCampaignNumbers(e.target.value)}
                      className="w-full h-56 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Enter numbers (one per line, or separated by comma)"
                    />
                    <div className="text-[10px] text-gray-400 flex justify-between">
                      <span>Supports comma, semicolon, or newline.</span>
                      <span>{campaignNumbers.length}/5000</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enter Your Message</label>
                    <textarea
                      value={campaignMessage}
                      onChange={(e) => setCampaignMessage(e.target.value)}
                      className="w-full h-56 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Type your message"
                    />
                    <div className="text-[10px] text-gray-400 flex justify-end">
                      <span>{campaignMessage.length}/4000</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    type="submit"
                    disabled={campaignSending}
                    className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {campaignSending ? "Sending..." : "Submit"}
                  </button>
                </div>
              </form>

              {campaignResults.length > 0 && (
                <div className="border-t border-gray-100 p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Results</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border border-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Number</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {campaignResults.map((r, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm font-mono text-gray-800">{r.number}</td>
                            <td className="px-4 py-3 text-sm">
                              {r.success ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">SENT</span>
                              ) : (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">FAILED</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{r.error || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Device Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowScanModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-gray-800">Add New Device</h3>
              <button onClick={() => setShowScanModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-gray-50 flex gap-4 shrink-0">
              <button 
                onClick={() => setMethod("qr")}
                className={cn(
                  "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                  method === "qr" ? "bg-blue-50 text-blue-600 border border-blue-100" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                QR Code
              </button>
              <button 
                onClick={() => setMethod("pairing")}
                className={cn(
                  "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                  method === "pairing" ? "bg-blue-50 text-blue-600 border border-blue-100" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                Pairing Code
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto flex flex-col items-center bg-white space-y-6 text-center">
              {method === "qr" ? (
                <div className="p-4 border-2 border-blue-50 rounded-2xl bg-white shadow-xl transition-all hover:scale-[1.01] flex items-center justify-center min-h-[300px] w-full max-w-[320px]">
                  {wsStatus.qr ? (
                    <div className="relative p-2 bg-white rounded-lg">
                      <QRCodeSVG value={wsStatus.qr} size={260} level="H" includeMargin={true} />
                      <div className="absolute inset-0 border-4 border-blue-500/5 rounded-lg pointer-events-none" />
                    </div>
                  ) : (
                    <div className="w-64 h-64 flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-sm gap-4 rounded-xl border border-slate-100">
                      <div className="relative">
                        <RefreshCw className="w-12 h-12 animate-spin text-blue-500/50" />
                        <QrCode className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
                      </div>
                      <p className="font-medium px-4">Initializing QR Engine...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-[320px] space-y-6 flex flex-col items-center">
                  <div className="w-full space-y-2 text-left">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. 919876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                      />
                      <button 
                        onClick={handleAddDevice}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 ml-1 italic">* Enter with country code, no "+" or spaces</p>
                  </div>

                  <div className="p-8 border-2 border-dashed border-blue-100 rounded-2xl bg-blue-50/30 w-full flex flex-col items-center justify-center min-h-[120px]">
                    {wsStatus.pairingCode ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-2">
                          {wsStatus.pairingCode.split('').map((char, i) => (
                            <span key={i} className={cn(
                              "w-8 h-10 flex items-center justify-center bg-white border border-blue-200 rounded-lg text-xl font-bold text-blue-600 shadow-sm",
                              char === '-' && "bg-transparent border-none w-4 text-blue-300"
                            )}>
                              {char}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-2">Enter this code on your phone</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <p className="text-sm font-medium text-gray-400">Pairing code will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button 
                onClick={handleAddDevice}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 underline flex items-center justify-center gap-2 py-2 px-4 hover:bg-blue-50 rounded-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Retry Connection
              </button>
            </div>

            <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-center sm:justify-end gap-3 shrink-0">
              <button 
                onClick={() => setShowScanModal(false)}
                className="px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
