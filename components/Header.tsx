import Image from "next/image";
import { maskAddress, CONTRACT_ADDRESS } from "@/utils/contract";

export default function Header() {
  return (
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
        <h1 className="text-display text-6xl md:text-7xl tracking-widest text-pow-accent uppercase">
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
      <p className="text-xs tracking-[0.4em] uppercase text-pow-muted">
        Decentralized Fitness Verification · Ethereum Sepolia
      </p>
      <div className="inline-block px-3 py-1 text-xs rounded border border-pow-border text-pow-muted font-mono">
        Contract:{" "}
        <span className="text-pow-accent">{maskAddress(CONTRACT_ADDRESS)}</span>
      </div>
    </header>
  );
}
