"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Header,
  Footer,
  ActivityLog,
  HowItWorks,
  StatsCard,
  WalletCard,
  UploadZone,
  OCRProgress,
} from "@/components";
import { useActivityLog, useProofOfWorkout, useOCR } from "@/hooks";
import {
  DAILY_UPLOAD_LIMIT,
  getDailyUploadCount,
  incrementDailyUploadCount,
  formatNumber,
} from "@/utils/helpers";

export default function ProofOfWorkoutPage() {
  // --- Daily upload tracking ---
  const [uploadsToday, setUploadsToday] = useState<number>(0);

  // --- Activity log hook ---
  const { logs, addLog } = useActivityLog();

  // --- Web3 / Contract hook ---
  const {
    account,
    isConnecting,
    hasJoined,
    joinTxStatus,
    totalRewards,
    isLoadingRewards,
    submitTxStatus,
    connectWallet,
    joinChallenge,
    submitProof,
    fetchRewards,
  } = useProofOfWorkout({ addLog });

  // --- OCR hook ---
  const { ocrStatus, detectedSteps, processImage, resetOCR } = useOCR({
    addLog,
  });

  // Load daily upload count on mount
  useEffect(() => {
    setUploadsToday(getDailyUploadCount());
  }, []);

  // --- File upload handler ---
  const handleFileSelect = useCallback(
    async (file: File) => {
      if (uploadsToday >= DAILY_UPLOAD_LIMIT) {
        addLog(
          `Daily upload limit (${DAILY_UPLOAD_LIMIT}) reached. Try again tomorrow.`,
          "warn",
        );
        return;
      }
      await processImage(file);
      setUploadsToday((prev) => incrementDailyUploadCount(prev));
    },
    [uploadsToday, addLog, processImage],
  );

  // --- Submit proof handler ---
  const handleSubmitProof = useCallback(async () => {
    if (detectedSteps === null) return;
    await submitProof(detectedSteps);
    resetOCR();
  }, [detectedSteps, submitProof, resetOCR]);

  // --- Derived UI state ---
  const uploadsRemaining = DAILY_UPLOAD_LIMIT - uploadsToday;
  const canUpload =
    !!account &&
    hasJoined &&
    uploadsRemaining > 0 &&
    ocrStatus !== "processing";
  const canSubmit =
    !!account && detectedSteps !== null && submitTxStatus !== "pending";

  return (
    <div className="min-h-screen grid-bg relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div
        className="pointer-events-none fixed -top-50 -right-50 w-150 h-150 rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, #f97316 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none fixed -bottom-50 -left-50 w-125 h-125 rounded-full opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, #22c55e 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10 space-y-6">
        <Header />

        <WalletCard
          account={account}
          hasJoined={hasJoined}
          isConnecting={isConnecting}
          joinTxStatus={joinTxStatus}
          onConnect={connectWallet}
          onJoin={joinChallenge}
        />

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            label="Current Steps"
            value={detectedSteps !== null ? formatNumber(detectedSteps) : "—"}
            accent={detectedSteps !== null ? "green" : "muted"}
            icon="👟"
          />
          <StatsCard
            label="Total Rewards"
            value={`${totalRewards} POW`}
            accent="orange"
            icon="🏆"
            loading={isLoadingRewards}
          />
          <StatsCard
            label="Uploads Today"
            value={`${uploadsToday} / ${DAILY_UPLOAD_LIMIT}`}
            accent={uploadsRemaining === 0 ? "red" : "muted"}
            icon="📤"
          />
          <StatsCard
            label="Network"
            value="Sepolia"
            accent="orange"
            icon="🔗"
          />
        </div>

        {/* Upload & Submit Section */}
        {account && hasJoined && (
          <section className="rounded-xl p-5 space-y-4 bg-pow-card border border-pow-border">
            <h2 className="text-xs uppercase tracking-widest text-pow-muted">
              Upload Workout Proof
            </h2>

            <div className="flex flex-col sm:flex-row gap-4">
              <UploadZone
                canUpload={canUpload}
                ocrStatus={ocrStatus}
                uploadsRemaining={uploadsRemaining}
                onFileSelect={handleFileSelect}
              />

              <div className="flex flex-col gap-3 justify-center min-w-40">
                <button
                  onClick={handleSubmitProof}
                  disabled={!canSubmit}
                  className={`px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-30 ${
                    canSubmit
                      ? "bg-pow-green text-black glow-green"
                      : "bg-pow-border text-pow-muted"
                  }`}
                  title={
                    !canSubmit && detectedSteps === null
                      ? "Upload a screenshot first"
                      : ""
                  }
                >
                  {submitTxStatus === "pending"
                    ? "⏳ Submitting..."
                    : submitTxStatus === "success"
                    ? "✓ Submitted!"
                    : detectedSteps !== null
                    ? `Submit ${formatNumber(detectedSteps)} Steps`
                    : "Submit Proof"}
                </button>

                <button
                  onClick={fetchRewards}
                  disabled={isLoadingRewards || !hasJoined}
                  className="px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border disabled:opacity-30 border-pow-accent text-pow-accent"
                  title={
                    !hasJoined ? "Join the challenge first to see rewards" : ""
                  }
                >
                  {isLoadingRewards ? "⏳ Loading..." : "Refresh Rewards"}
                </button>
              </div>
            </div>

            {detectedSteps !== null && (
              <OCRProgress detectedSteps={detectedSteps} />
            )}
          </section>
        )}

        <ActivityLog logs={logs} />

        <HowItWorks />

        <Footer />
      </div>
    </div>
  );
}
