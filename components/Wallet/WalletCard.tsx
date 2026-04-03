"use client";

import { maskAddress } from "@/utils/contract";
import { isMobile, isMetaMaskInstalled } from "@/utils/helpers";
import type { WalletCardProps } from "@/types";

export default function WalletCard({
  account,
  hasJoined,
  isConnecting,
  joinTxStatus,
  onConnect,
  onJoin,
}: WalletCardProps) {
  const showMobileHint = isMobile() && !isMetaMaskInstalled() && !account;

  return (
    <section className="relative rounded-xl p-5 scanline bg-pow-card border border-pow-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest mb-1 text-pow-muted">
            Wallet
          </p>
          {account ? (
            <p className="text-xl font-semibold text-pow-text font-mono">
              {maskAddress(account)}
              <span className="ml-2 inline-block w-2 h-2 rounded-full animate-pulse-glow bg-pow-green" />
            </p>
          ) : (
            <p className="text-pow-muted text-sm">Not connected</p>
          )}
          {account && (
            <p
              className={`text-xs mt-1 ${
                hasJoined ? "text-pow-green" : "text-pow-muted"
              }`}
            >
              {hasJoined ? "✓ Enrolled in challenge" : "○ Not enrolled"}
            </p>
          )}
          {showMobileHint && (
            <p className="text-xs mt-1 text-pow-accent">
              📱 Tap to open in MetaMask app
            </p>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          {!account ? (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 bg-pow-accent text-black glow-orange"
            >
              {isConnecting
                ? "Connecting..."
                : showMobileHint
                ? "Open in MetaMask"
                : "Connect MetaMask"}
            </button>
          ) : !hasJoined ? (
            <button
              onClick={onJoin}
              disabled={joinTxStatus === "pending"}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 border border-pow-accent text-pow-accent"
            >
              {joinTxStatus === "pending" ? "⏳ Joining..." : "Join Challenge"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
