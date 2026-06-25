"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, Upload, X, Eye, FileText, Film, Image as ImageIcon } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useSendCampaign } from "../hooks/useSendCampaign";
import { useDevices } from "../hooks/useDevices";

type CampaignFormProps = {
  campaignCountryCode: string;
  campaignIntervalSeconds: string;
  campaignNumbers: string;
  campaignMessage: string;
  setCampaignCountryCode: (v: string) => void;
  setCampaignIntervalSeconds: (v: string) => void;
  setCampaignNumbers: (v: string) => void;
  setCampaignMessage: (v: string) => void;
  onResults?: (results: Array<{ number: string; success: boolean; error?: string }>) => void;
  selectedChannel: string;
  setSelectedChannel: (v: string) => void;
  wsStatus: {
    status: string;
    qr: string | null;
    pairingCode: string | null;
    channels?: Array<{ number: string; jid: string }>;
  };
};

export default function CampaignForm({
  campaignCountryCode,
  campaignIntervalSeconds,
  campaignNumbers,
  campaignMessage,
  setCampaignCountryCode,
  setCampaignIntervalSeconds,
  setCampaignNumbers,
  setCampaignMessage,
  onResults,
  selectedChannel,
  setSelectedChannel,
  wsStatus,
}: CampaignFormProps) {
  const sendCampaign = useSendCampaign();
  const devices = useDevices();

  const [campaignName, setCampaignName] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [deviceSearch, setDeviceSearch] = useState("");
  const [deviceDropdownOpen, setDeviceDropdownOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const campaignNameRef = useRef<HTMLInputElement>(null);
  const deviceRef = useRef<HTMLInputElement>(null);
  const countryCodeRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<HTMLInputElement>(null);
  const numbersRef = useRef<HTMLTextAreaElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ file: File; url: string } | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const maxUploadBytes = 5 * 1024 * 1024;

  const allowedImageTypes = useMemo(
    () => new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
    [],
  );
  const allowedVideoTypes = useMemo(
    () => new Set(["video/mp4", "video/webm", "video/quicktime"]),
    [],
  );
  const allowedFileTypes = useMemo(
    () =>
      new Set([
        "application/pdf",
        "text/plain",
        "text/csv",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ]),
    [],
  );

  const eligibleDevices = (devices.data?.devices || []).filter((d) => !!d.phoneNumber);

  const selectedDevice = eligibleDevices.find((d) => d.id === selectedDeviceId) || null;
  const filteredDevices = eligibleDevices.filter((d) => {
    const q = String(deviceSearch || "").trim();
    if (!q) return true;
    return String(d.phoneNumber || "").includes(q);
  });

  useEffect(() => {
    if (!selectedDeviceId) {
      const first = eligibleDevices[0];
      if (first?.id) setSelectedDeviceId(first.id);
    }
  }, [eligibleDevices, selectedDeviceId]);

  useEffect(() => {
    if (formError || Object.keys(errors).length > 0) {
      setFormError("");
      setErrors({});
    }
  }, [campaignName, selectedDeviceId, campaignNumbers, campaignMessage, campaignCountryCode, campaignIntervalSeconds]);

  useEffect(() => {
    if (attachmentError) setAttachmentError("");
  }, [attachments, attachmentError]);

  const validateAndAddAttachment = (file: File | null) => {
    if (!file) return;

    if (file.size > maxUploadBytes) {
      setAttachmentError("Max file size is 5MB.");
      return;
    }

    const mime = String(file.type || "").toLowerCase();
    const isImage = allowedImageTypes.has(mime);
    const isVideo = allowedVideoTypes.has(mime);
    const isDoc = allowedFileTypes.has(mime);

    if (!isImage && !isVideo && !isDoc) {
      setAttachmentError("Unsupported file type.");
      return;
    }

    // Validation for multiple images (max 4)
    if (isImage) {
      const currentImages = attachments.filter((f) => allowedImageTypes.has(String(f.type).toLowerCase()));
      if (currentImages.length >= 4) {
        setAttachmentError("You can upload a maximum of 4 images.");
        return;
      }
    } else {
      // Non-image files: only one allowed at a time (standard behavior for video/docs in many systems)
      // or we can allow one video/doc alongside images.
      // User request specifically mentioned "in image we can upload upto 4 images".
      const hasNonImage = attachments.some((f) => !allowedImageTypes.has(String(f.type).toLowerCase()));
      if (hasNonImage) {
        setAttachmentError("Only one video or document can be uploaded at a time.");
        return;
      }
      if (attachments.length > 0 && isImage === false) {
        // If trying to add a video/doc when there are already images
        // We'll allow it for now or restrict? Let's restrict to either 4 images OR 1 other file for simplicity unless requested otherwise.
        setAttachmentError("You can either upload up to 4 images OR a single video/document.");
        return;
      }
    }

    setAttachments((prev) => [...prev, file]);
    setAttachmentError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    if (!campaignName.trim()) {
      newErrors.campaignName = "Campaign name is required";
    }
    if (!selectedDeviceId) {
      newErrors.selectedDeviceId = "Please select a WhatsApp device";
    }
    if (!campaignCountryCode.trim()) {
      newErrors.campaignCountryCode = "Country code is required";
    }
    if (!campaignIntervalSeconds.trim()) {
      newErrors.campaignIntervalSeconds = "Interval is required";
    }
    if (!campaignNumbers.trim()) {
      newErrors.campaignNumbers = "Mobile numbers are required";
    }
    if (!campaignMessage.trim()) {
      newErrors.campaignMessage = "Message is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const refs: { [key: string]: React.RefObject<any> } = {
        campaignName: campaignNameRef,
        selectedDeviceId: deviceRef,
        campaignCountryCode: countryCodeRef,
        campaignIntervalSeconds: intervalRef,
        campaignNumbers: numbersRef,
        campaignMessage: messageRef,
      };

      const ref = refs[firstErrorKey];
      if (ref && ref.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
        ref.current.focus();
      }
      return;
    }

    const parsedNumbers = campaignNumbers
      .split(/\r?\n|,|;/)
      .map((n) => n.trim())
      .filter(Boolean);

    sendCampaign.mutate(
      {
        campaignName: campaignName.trim(),
        deviceId: selectedDeviceId,
        intervalSeconds: Number(campaignIntervalSeconds || 0),
        countryCode: String(campaignCountryCode || "").trim() || null,
        numbers: parsedNumbers.map((raw) => {
          const n = String(raw || "").trim();
          const cc = String(campaignCountryCode || "").trim();
          if (!cc) return n;
          if (/^[0-9]+$/.test(n) && !n.startsWith(cc)) return `${cc}${n}`;
          return n;
        }),
        message: campaignMessage,
        attachments: attachments, // Fixing property name from attachment to attachments
      },
      {
        onSuccess: (data: any) => {
          onResults?.(data?.results || []);
          setAttachments([]); // Clear after success
          setCampaignName(""); // Clear name after success
        },
      },
    );
  };

  const handlePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewFile({ file, url });
  };

  const closePreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile.url);
      setPreviewFile(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">Campaign</h3>
        <p className="text-sm text-gray-500 mt-1">
          Send a message to multiple numbers with optional delay.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Top Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign Name</label>
            <input
              ref={campaignNameRef}
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className={cn(
                "w-full px-4 py-2.5 bg-white border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500",
                errors.campaignName ? "border-red-500 focus:ring-red-500" : "border-gray-200"
              )}
              placeholder="My Campaign"
            />
            {errors.campaignName && <p className="text-xs text-red-500">{errors.campaignName}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Device Selection</label>
            <div className="relative">
              <input
                ref={deviceRef}
                value={deviceDropdownOpen ? deviceSearch : selectedDevice?.phoneNumber || ""}
                onChange={(e) => {
                  setDeviceSearch(e.target.value);
                  setDeviceDropdownOpen(true);
                }}
                onFocus={() => setDeviceDropdownOpen(true)}
                onBlur={() => {
                  // Allow click selection before closing
                  setTimeout(() => setDeviceDropdownOpen(false), 120);
                }}
                className={cn(
                  "w-full px-4 py-2.5 bg-white border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500",
                  errors.selectedDeviceId ? "border-red-500 focus:ring-red-500" : "border-gray-200"
                )}
                placeholder="-- Channel --"
                disabled={eligibleDevices.length === 0}
                inputMode="numeric"
              />

              {deviceDropdownOpen && eligibleDevices.length > 0 ? (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-auto">
                  {filteredDevices.length > 0 ? (
                    filteredDevices.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedDeviceId(d.id);
                          setDeviceSearch("");
                          setDeviceDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${d.id === selectedDeviceId ? "bg-gray-50" : ""}`}
                      >
                        {String(d.phoneNumber || "")}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No matching channels</div>
                  )}
                </div>
              ) : null}
            </div>

            {eligibleDevices.length === 0 ? (
              <p className="text-[10px] text-gray-400">No WhatsApp devices found. Please add a device in WhatsApp Scan.</p>
            ) : (
              <p className="text-[10px] text-gray-400">All devices with a WhatsApp number appear here.</p>
            )}

            {errors.selectedDeviceId && <p className="text-xs text-red-500">{errors.selectedDeviceId}</p>}
            {formError ? <p className="text-xs text-red-600">{formError}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Country Code
            </label>

            <input
              ref={countryCodeRef}
              type="text"
              value={campaignCountryCode}
              onChange={(e) => setCampaignCountryCode(e.target.value)}
              className={cn(
                "w-full px-4 py-2.5 bg-white border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500",
                errors.campaignCountryCode ? "border-red-500 focus:ring-red-500" : "border-gray-200"
              )}
              placeholder="91"
            />

            {errors.campaignCountryCode && <p className="text-xs text-red-500">{errors.campaignCountryCode}</p>}
            <p className="text-[10px] text-gray-400">
              Keep blank if numbers already include country code.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Interval (seconds)
            </label>

            <input
              ref={intervalRef}
              type="number"
              min={0}
              max={41}
              value={campaignIntervalSeconds}
              onChange={(e) => setCampaignIntervalSeconds(e.target.value)}
              className={cn(
                "w-full px-4 py-2.5 bg-white border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500",
                errors.campaignIntervalSeconds ? "border-red-500 focus:ring-red-500" : "border-gray-200"
              )}
              placeholder="3"
            />

            {errors.campaignIntervalSeconds && <p className="text-xs text-red-500">{errors.campaignIntervalSeconds}</p>}
            <p className="text-[10px] text-gray-400">
              Range 0-41 supported.
            </p>
          </div>
        </div>

        {/* Numbers + Message */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Enter Mobile Number
            </label>

            <textarea
              ref={numbersRef}
              value={campaignNumbers}
              onChange={(e) => setCampaignNumbers(e.target.value)}
              className={cn(
                "w-full h-56 px-4 py-3 bg-white border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none",
                errors.campaignNumbers ? "border-red-500 focus:ring-red-500" : "border-gray-200"
              )}
              placeholder="Enter numbers (one per line, or separated by comma)"
            />

            {errors.campaignNumbers && <p className="text-xs text-red-500">{errors.campaignNumbers}</p>}
            <div className="text-[10px] text-gray-400 flex justify-between">
              <span>Supports comma, semicolon, or newline.</span>
              <span>{campaignNumbers.length}/5000</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Enter Your Message
            </label>

            <div className="relative">
              <textarea
                ref={messageRef}
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
                className={cn(
                  "w-full h-56 px-4 py-3 bg-white border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none",
                  errors.campaignMessage ? "border-red-500 focus:ring-red-500" : "border-gray-200"
                )}
                placeholder="Type your message"
              />
              {errors.campaignMessage && <p className="text-xs text-red-500 mt-1">{errors.campaignMessage}</p>}

              <div className="absolute bottom-2 right-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAttachmentMenuOpen((v) => !v)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
                    title="Upload"
                  >
                    <Paperclip className="w-4 h-4 text-gray-600" />
                  </button>

                  {attachmentMenuOpen ? (
                    <div className="absolute bottom-11 right-0 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setAttachmentMenuOpen(false);
                          imageInputRef.current?.click();
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        Upload image
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setAttachmentMenuOpen(false);
                          videoInputRef.current?.click();
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        Upload video
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setAttachmentMenuOpen(false);
                          fileInputRef.current?.click();
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        Upload file
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <input
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach((f) => validateAndAddAttachment(f));
                  e.target.value = "";
                }}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  validateAndAddAttachment(f);
                  e.target.value = "";
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  validateAndAddAttachment(f);
                  e.target.value = "";
                }}
              />
            </div>

            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 group">
                    <div
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer flex-1"
                      onClick={() => handlePreview(file)}
                    >
                      {allowedImageTypes.has(file.type) ? (
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                      ) : allowedVideoTypes.has(file.type) ? (
                        <Film className="w-4 h-4 text-purple-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-orange-500" />
                      )}
                      <span className="truncate max-w-[200px] font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">({Math.ceil(file.size / 1024)} KB)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePreview(file)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {attachmentError ? <p className="text-xs text-red-600">{attachmentError}</p> : null}

            <div className="text-[10px] text-gray-400 flex justify-end">
              <span>{campaignMessage.length}/4000</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-center">
          <button
            type="submit"
            disabled={sendCampaign.isPending}
            className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {sendCampaign.isPending ? "Sending..." : "Submit"}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="font-bold text-gray-900 truncate max-w-[300px]">{previewFile.file.name}</span>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50 p-4 flex items-center justify-center">
              {allowedImageTypes.has(previewFile.file.type) ? (
                <img src={previewFile.url} alt="Preview" className="max-w-full max-h-full object-contain shadow-md" />
              ) : allowedVideoTypes.has(previewFile.file.type) ? (
                <video src={previewFile.url} controls className="max-w-full max-h-full shadow-md" autoPlay />
              ) : previewFile.file.type === "application/pdf" ? (
                <iframe src={previewFile.url} className="w-full h-full min-h-[600px] border-none" title="PDF Preview" />
              ) : (
                <div className="text-center p-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Preview not available for this file type.</p>
                  <a
                    href={previewFile.url}
                    download={previewFile.file.name}
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
                  >
                    Download to view
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}