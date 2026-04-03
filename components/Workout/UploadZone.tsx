"use client";

import { useRef } from "react";
import type { UploadZoneProps } from "@/types";

export default function UploadZone({
  canUpload,
  ocrStatus,
  uploadsRemaining,
  onFileSelect,
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getStatusIcon = () => {
    switch (ocrStatus) {
      case "processing":
        return <span className="inline-block animate-spin-slow">⚙️</span>;
      case "done":
        return "✅";
      case "error":
        return "❌";
      default:
        return "📸";
    }
  };

  const getStatusText = () => {
    switch (ocrStatus) {
      case "processing":
        return "Running OCR...";
      case "done":
        return "Steps detected!";
      case "error":
        return "OCR failed — try another image";
      default:
        return uploadsRemaining > 0
          ? `Drop Google Fit / Apple Health screenshot\n(${uploadsRemaining} upload${
              uploadsRemaining !== 1 ? "s" : ""
            } remaining today)`
          : "Daily limit reached";
    }
  };

  return (
    <label
      className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-all duration-200 border-pow-border ${
        canUpload
          ? "hover:border-orange-500 hover:bg-orange-500/5"
          : "opacity-40 cursor-not-allowed"
      }`}
    >
      <span className="text-3xl">{getStatusIcon()}</span>
      <span className="text-xs text-center text-pow-muted whitespace-pre-line">
        {getStatusText()}
      </span>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={!canUpload}
        onChange={handleChange}
      />
      {canUpload && (
        <span className="px-3 py-1.5 rounded text-xs font-medium bg-pow-accent text-black">
          Choose File
        </span>
      )}
    </label>
  );
}
