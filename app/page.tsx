"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  getProviderWeb3,
  getProviderContract,
  getReadContract,
  maskAddress,
  extractStepsFromOCR,
  CONTRACT_ADDRESS,
} from "@/utils/contract";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DAILY_UPLOAD_LIMIT = 3;
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TxStatus = "idle" | "pending" | "success" | "error";
type OCRStatus = "idle" | "processing" | "done" | "error";

interface LogEntry {
  id: number;
  time: string;
  message: string;
  type: "info" | "success" | "error" | "warn";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ProofOfWorkoutPage() {
  // --- Wallet state ---
  const [account, setAccount] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [joinTxStatus, setJoinTxStatus] = useState<TxStatus>("idle");

  // --- Contract data ---
  const [totalRewards, setTotalRewards] = useState<string>("0");
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);

  // --- OCR state ---
  const [ocrStatus, setOcrStatus] = useState<OCRStatus>("idle");
  const [detectedSteps, setDetectedSteps] = useState<number | null>(null);
  const [submitTxStatus, setSubmitTxStatus] = useState<TxStatus>("idle");

  // --- Daily limit ---
  const [uploadsToday, setUploadsToday] = useState<number>(0);

  // --- Activity log ---
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logCounter = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  // --- File input ref ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Logging helper
  // ---------------------------------------------------------------------------
  const addLog = useCallback(
    (message: string, type: LogEntry["type"] = "info") => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", { hour12: false });
      setLogs((prev) => [
        ...prev.slice(-49), // keep last 50
        { id: ++logCounter.current, time, message, type },
      ]);
    },
    [],
  );

  // Removed auto-scroll to allow users to review logs without interruption

  // ---------------------------------------------------------------------------
  // Load daily upload count from sessionStorage on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const storedDate = sessionStorage.getItem("pow_upload_date");
    const today = new Date().toDateString();
    if (storedDate === today) {
      const count = parseInt(
        sessionStorage.getItem("pow_upload_count") ?? "0",
        10,
      );
      setUploadsToday(count);
    } else {
      sessionStorage.setItem("pow_upload_date", today);
      sessionStorage.setItem("pow_upload_count", "0");
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Persist upload count
  // ---------------------------------------------------------------------------
  const incrementUploadCount = useCallback(() => {
    const next = uploadsToday + 1;
    setUploadsToday(next);
    sessionStorage.setItem("pow_upload_count", String(next));
  }, [uploadsToday]);

  // ---------------------------------------------------------------------------
  // Connect MetaMask
  // ---------------------------------------------------------------------------
  const connectWallet = async () => {
    if (!window.ethereum) {
      addLog("MetaMask not detected. Please install it.", "error");
      return;
    }
    setIsConnecting(true);
    try {
      // Request accounts
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Switch to / verify Sepolia
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchErr: unknown) {
        // Chain not added — add it
        if ((switchErr as { code: number }).code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: "Sepolia Testnet",
                rpcUrls: [
                  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
                    "https://rpc.sepolia.org",
                ],
                nativeCurrency: {
                  name: "SepoliaETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        }
      }

      const addr = accounts[0];
      setAccount(addr);
      addLog(`Connected: ${maskAddress(addr)}`, "success");
      await checkJoinStatus(addr);
    } catch (err: unknown) {
      addLog(`Connection failed: ${(err as Error).message}`, "error");
    } finally {
      setIsConnecting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Listen for account / chain changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount("");
        setHasJoined(false);
        addLog("Wallet disconnected.", "warn");
      } else {
        setAccount(accounts[0]);
        addLog(`Account switched to ${maskAddress(accounts[0])}`, "info");
        checkJoinStatus(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      addLog("Chain changed — refreshing...", "warn");
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Check if user has joined the challenge
  // ---------------------------------------------------------------------------
  const checkJoinStatus = async (addr: string) => {
    try {
      const contract = getReadContract();
      const joined = await contract.methods.hasJoined(addr).call();
      setHasJoined(Boolean(joined));
      if (joined) addLog("You are enrolled in the challenge.", "info");
    } catch {
      // Contract may not be deployed yet — silently ignore
    }
  };

  // ---------------------------------------------------------------------------
  // Join challenge
  // ---------------------------------------------------------------------------
  const joinChallenge = async () => {
    if (!account) return;
    setJoinTxStatus("pending");
    addLog("Sending joinChallenge() transaction...", "info");
    try {
      const contract = getProviderContract();
      await contract.methods.joinChallenge().send({
        from: account,
        gas: "100000", // Simple write operation
      });
      setHasJoined(true);
      setJoinTxStatus("success");
      addLog("Successfully joined the challenge!", "success");
    } catch (err: unknown) {
      setJoinTxStatus("error");
      addLog(`joinChallenge failed: ${(err as Error).message}`, "error");
    }
  };

  // ---------------------------------------------------------------------------
  // Fetch rewards (read-only call)
  // ---------------------------------------------------------------------------
  const fetchRewards = useCallback(async () => {
    if (!account) return;
    if (!hasJoined) {
      addLog("Join the challenge first to see rewards", "warn");
      return;
    }
    setIsLoadingRewards(true);
    addLog("Fetching on-chain rewards...", "info");
    try {
      const contract = getReadContract();
      const raw = await contract.methods.getRewards().call({ from: account });
      const web3 = getProviderWeb3();
      const inEth = web3.utils.fromWei(String(raw), "ether");
      setTotalRewards(parseFloat(inEth).toFixed(4));
      addLog(`Rewards fetched: ${parseFloat(inEth).toFixed(4)} POW`, "success");
    } catch (err: unknown) {
      addLog(`getRewards failed: ${(err as Error).message}`, "error");
    } finally {
      setIsLoadingRewards(false);
    }
  }, [account, hasJoined, addLog]);

  // Auto-fetch rewards when account changes and user has joined
  useEffect(() => {
    if (account && hasJoined) fetchRewards();
  }, [account, hasJoined, fetchRewards]);

  // ---------------------------------------------------------------------------
  // OCR — process uploaded image
  // ---------------------------------------------------------------------------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadsToday >= DAILY_UPLOAD_LIMIT) {
      addLog(
        `Daily upload limit (${DAILY_UPLOAD_LIMIT}) reached. Try again tomorrow.`,
        "warn",
      );
      return;
    }

    setOcrStatus("processing");
    setDetectedSteps(null);
    setSubmitTxStatus("idle");
    addLog(`Processing "${file.name}" with Tesseract OCR...`, "info");

    try {
      // Dynamically import Tesseract to avoid SSR issues
      const Tesseract = (await import("tesseract.js")).default;

      const result = await Tesseract.recognize(file, "eng", {
        logger: (m: { status: string; progress?: number }) => {
          if (m.status === "recognizing text" && m.progress !== undefined) {
            const pct = Math.round((m.progress ?? 0) * 100);
            if (pct % 25 === 0) addLog(`OCR progress: ${pct}%`, "info");
          }
        },
      });

      const rawText = result.data.text;
      addLog(
        `Raw OCR output (truncated): ${rawText
          .slice(0, 120)
          .replace(/\n/g, " ")}`,
        "info",
      );

      const steps = extractStepsFromOCR(rawText);
      if (steps === null) {
        setOcrStatus("error");
        addLog(
          "No valid step count found in image (need 3–6 digit number).",
          "error",
        );
      } else {
        setOcrStatus("done");
        setDetectedSteps(steps);
        incrementUploadCount();
        addLog(
          `✅ Successfully detected ${steps.toLocaleString()} steps! Click "Submit Proof" to record on-chain.`,
          "success",
        );
      }
    } catch (err: unknown) {
      setOcrStatus("error");
      addLog(`OCR failed: ${(err as Error).message}`, "error");
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---------------------------------------------------------------------------
  // Submit proof on-chain (via provider wallet)
  // In production this would be the relayer — shown here as a wallet TX
  // ---------------------------------------------------------------------------
  const submitProof = async () => {
    if (!account || detectedSteps === null) return;
    setSubmitTxStatus("pending");
    addLog(`Submitting proof: ${detectedSteps} steps on-chain...`, "info");
    try {
      const contract = getProviderContract();
      await contract.methods.submitProof(detectedSteps).send({
        from: account,
        gas: "150000", // Slightly more complex write operation
      });
      setSubmitTxStatus("success");
      addLog(
        `Proof submitted! ${detectedSteps.toLocaleString()} steps recorded.`,
        "success",
      );
      setDetectedSteps(null);
      setOcrStatus("idle");
      await fetchRewards();
    } catch (err: unknown) {
      setSubmitTxStatus("error");
      const errorMessage = (err as Error).message;

      // Better error messages for common failures
      if (errorMessage.includes("Cooldown")) {
        addLog(
          "⏰ Cooldown active: You can only submit proof once every 20 hours. Please try again later.",
          "error",
        );
      } else if (
        errorMessage.includes("Not enrolled") ||
        errorMessage.includes("Not joined")
      ) {
        addLog(
          "❌ You must join the challenge first before submitting proofs!",
          "error",
        );
      } else if (errorMessage.includes("Steps out of range")) {
        addLog("❌ Step count must be between 100 and 999,999", "error");
      } else if (errorMessage.includes("gas")) {
        addLog(
          `⛽ Gas error: ${errorMessage}. Try again with a different gas amount.`,
          "error",
        );
      } else {
        addLog(`❌ Submit failed: ${errorMessage}`, "error");
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Derived UI state helpers
  // ---------------------------------------------------------------------------
  const uploadsRemaining = DAILY_UPLOAD_LIMIT - uploadsToday;
  const canUpload =
    !!account &&
    hasJoined &&
    uploadsRemaining > 0 &&
    ocrStatus !== "processing";
  const canSubmit =
    !!account && detectedSteps !== null && submitTxStatus !== "pending";

  const logTypeClass: Record<LogEntry["type"], string> = {
    info: "text-slate-400",
    success: "text-green-400",
    error: "text-red-400",
    warn: "text-yellow-400",
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
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
        {/* ── Header ── */}
        <header className="text-center space-y-2 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-1">
            <Image
              src="/logo.png"
              alt="POW Logo"
              width={64}
              height={64}
              className="animate-pulse-glow"
              priority
            />
            <h1
              className="text-display text-6xl md:text-7xl tracking-widest text-pow-accent uppercase"
              style={{ color: "var(--color-pow-accent)" }}
            >
              PROOF OF WORKOUT
            </h1>
            <Image
              src="/logo.png"
              alt="POW Logo"
              width={64}
              height={64}
              className="animate-pulse-glow"
              priority
            />
          </div>
          <p
            className="text-xs tracking-[0.4em] uppercase"
            style={{ color: "var(--color-pow-muted)" }}
          >
            Decentralized Fitness Verification · Ethereum Sepolia
          </p>
          <div
            className="inline-block px-3 py-1 text-xs rounded border"
            style={{
              borderColor: "var(--color-pow-border)",
              color: "var(--color-pow-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Contract:{" "}
            <span style={{ color: "var(--color-pow-accent)" }}>
              {maskAddress(CONTRACT_ADDRESS)}
            </span>
          </div>
        </header>

        {/* ── Wallet Card ── */}
        <section
          className="relative rounded-xl p-5 scanline"
          style={{
            background: "var(--color-pow-card)",
            border: "1px solid var(--color-pow-border)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: "var(--color-pow-muted)" }}
              >
                Wallet
              </p>
              {account ? (
                <p
                  className="text-xl font-semibold"
                  style={{
                    color: "var(--color-pow-text)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {maskAddress(account)}
                  <span
                    className="ml-2 inline-block w-2 h-2 rounded-full animate-pulse-glow"
                    style={{ background: "var(--color-pow-green)" }}
                  />
                </p>
              ) : (
                <p
                  style={{ color: "var(--color-pow-muted)" }}
                  className="text-sm"
                >
                  Not connected
                </p>
              )}
              {account && (
                <p
                  className="text-xs mt-1"
                  style={{
                    color: hasJoined
                      ? "var(--color-pow-green)"
                      : "var(--color-pow-muted)",
                  }}
                >
                  {hasJoined ? "✓ Enrolled in challenge" : "○ Not enrolled"}
                </p>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              {!account ? (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: "var(--color-pow-accent)",
                    color: "#000",
                    boxShadow: "var(--shadow-glow-orange)",
                  }}
                >
                  {isConnecting ? "Connecting..." : "Connect MetaMask"}
                </button>
              ) : !hasJoined ? (
                <button
                  onClick={joinChallenge}
                  disabled={joinTxStatus === "pending"}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 border"
                  style={{
                    borderColor: "var(--color-pow-accent)",
                    color: "var(--color-pow-accent)",
                  }}
                >
                  {joinTxStatus === "pending"
                    ? "⏳ Joining..."
                    : "Join Challenge"}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Current Steps */}
          <StatCard
            label="Current Steps"
            value={
              detectedSteps !== null ? detectedSteps.toLocaleString() : "—"
            }
            accent={detectedSteps !== null ? "green" : "muted"}
            icon="👟"
          />

          {/* Total Rewards */}
          <StatCard
            label="Total Rewards"
            value={`${totalRewards} POW`}
            accent="orange"
            icon="🏆"
            loading={isLoadingRewards}
          />

          {/* Uploads Today */}
          <StatCard
            label="Uploads Today"
            value={`${uploadsToday} / ${DAILY_UPLOAD_LIMIT}`}
            accent={uploadsRemaining === 0 ? "red" : "muted"}
            icon="📤"
          />

          {/* Network */}
          <StatCard label="Network" value="Sepolia" accent="orange" icon="🔗" />
        </div>

        {/* ── Upload & Submit ── */}
        {account && hasJoined && (
          <section
            className="rounded-xl p-5 space-y-4"
            style={{
              background: "var(--color-pow-card)",
              border: "1px solid var(--color-pow-border)",
            }}
          >
            <h2
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--color-pow-muted)" }}
            >
              Upload Workout Proof
            </h2>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* File picker */}
              <label
                className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-all duration-200 ${
                  canUpload
                    ? "hover:border-orange-500 hover:bg-orange-500/5"
                    : "opacity-40 cursor-not-allowed"
                }`}
                style={{ borderColor: "var(--color-pow-border)" }}
              >
                <span className="text-3xl">
                  {ocrStatus === "processing" ? (
                    <span className="inline-block animate-spin-slow">⚙️</span>
                  ) : ocrStatus === "done" ? (
                    "✅"
                  ) : ocrStatus === "error" ? (
                    "❌"
                  ) : (
                    "📸"
                  )}
                </span>
                <span
                  className="text-xs text-center"
                  style={{ color: "var(--color-pow-muted)" }}
                >
                  {ocrStatus === "processing"
                    ? "Running OCR..."
                    : ocrStatus === "done"
                    ? "Steps detected!"
                    : ocrStatus === "error"
                    ? "OCR failed — try another image"
                    : uploadsRemaining > 0
                    ? `Drop Google Fit / Apple Health screenshot\n(${uploadsRemaining} upload${
                        uploadsRemaining !== 1 ? "s" : ""
                      } remaining today)`
                    : "Daily limit reached"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!canUpload}
                  onChange={handleFileUpload}
                />
                {canUpload && (
                  <span
                    className="px-3 py-1.5 rounded text-xs font-medium"
                    style={{
                      background: "var(--color-pow-accent)",
                      color: "#000",
                    }}
                  >
                    Choose File
                  </span>
                )}
              </label>

              {/* Submit proof */}
              <div className="flex flex-col gap-3 justify-center min-w-40">
                <button
                  onClick={submitProof}
                  disabled={!canSubmit}
                  className="px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-30"
                  style={{
                    background: canSubmit
                      ? "var(--color-pow-green)"
                      : "var(--color-pow-border)",
                    color: canSubmit ? "#000" : "var(--color-pow-muted)",
                    boxShadow: canSubmit ? "var(--shadow-glow-green)" : "none",
                  }}
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
                    ? `Submit ${detectedSteps.toLocaleString()} Steps`
                    : "Submit Proof"}
                </button>

                <button
                  onClick={fetchRewards}
                  disabled={isLoadingRewards || !hasJoined}
                  className="px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border disabled:opacity-30"
                  style={{
                    borderColor: "var(--color-pow-accent)",
                    color: "var(--color-pow-accent)",
                  }}
                  title={
                    !hasJoined ? "Join the challenge first to see rewards" : ""
                  }
                >
                  {isLoadingRewards ? "⏳ Loading..." : "Refresh Rewards"}
                </button>
              </div>
            </div>

            {/* Detected steps banner */}
            {detectedSteps !== null && (
              <div
                className="rounded-lg px-4 py-3 flex items-center gap-3 border-glow-green animate-pulse"
                style={{
                  background: "rgba(34,197,94,0.12)",
                  border: "2px solid rgba(34,197,94,0.4)",
                }}
              >
                <span className="text-3xl">✅</span>
                <div className="flex-1">
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "var(--color-pow-green)" }}
                  >
                    Steps Successfully Detected!
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-pow-green)" }}
                  >
                    {detectedSteps.toLocaleString()} steps
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--color-pow-muted)" }}
                  >
                    Click "Submit Proof" below to record this on the blockchain
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Activity Log ── */}
        <section
          className="rounded-xl p-4 space-y-2"
          style={{
            background: "var(--color-pow-surface)",
            border: "1px solid var(--color-pow-border)",
          }}
        >
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--color-pow-muted)" }}
          >
            Activity Log
          </p>
          <div
            className="h-44 overflow-y-auto space-y-1 text-xs pr-1"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {logs.length === 0 ? (
              <p style={{ color: "var(--color-pow-muted)" }}>
                Awaiting events...
              </p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex gap-2 ${logTypeClass[log.type]}`}
                >
                  <span className="shrink-0 opacity-50">[{log.time}]</span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            {
              step: "01",
              icon: "🦊",
              title: "Connect",
              desc: "Link MetaMask on Sepolia testnet",
            },
            {
              step: "02",
              icon: "📸",
              title: "Upload",
              desc: "Screenshot from Google Fit or Apple Health",
            },
            {
              step: "03",
              icon: "⛓️",
              title: "Earn",
              desc: "OCR extracts steps, proof goes on-chain",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl p-4 space-y-2"
              style={{
                background: "var(--color-pow-card)",
                border: "1px solid var(--color-pow-border)",
              }}
            >
              <p
                className="text-xs"
                style={{
                  color: "var(--color-pow-accent)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {item.step}
              </p>
              <p className="text-2xl">{item.icon}</p>
              <p
                className="font-semibold text-sm"
                style={{ color: "var(--color-pow-text)" }}
              >
                {item.title}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-pow-muted)" }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </section>

        {/* ── Footer ── */}
        <footer
          className="text-center text-xs pb-4"
          style={{ color: "var(--color-pow-muted)" }}
        >
          POW · Proof of Workout · Ethereum Sepolia Testnet · Built with Next.js
          + Web3.js
        </footer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard sub-component
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  accent,
  icon,
  loading = false,
}: {
  label: string;
  value: string;
  accent: "orange" | "green" | "muted" | "red";
  icon: string;
  loading?: boolean;
}) {
  const colorMap = {
    orange: "var(--color-pow-accent)",
    green: "var(--color-pow-green)",
    muted: "var(--color-pow-text)",
    red: "#f87171",
  };

  return (
    <div
      className="rounded-xl p-4 space-y-1"
      style={{
        background: "var(--color-pow-card)",
        border: "1px solid var(--color-pow-border)",
      }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--color-pow-muted)" }}
        >
          {label}
        </p>
        <span className="text-lg">{icon}</span>
      </div>
      {loading ? (
        <div
          className="h-6 rounded animate-pulse"
          style={{ background: "var(--color-pow-border)" }}
        />
      ) : (
        <p
          className="text-xl font-bold leading-tight"
          style={{ color: colorMap[accent], fontFamily: "var(--font-mono)" }}
        >
          {value}
        </p>
      )}
    </div>
  );
}
