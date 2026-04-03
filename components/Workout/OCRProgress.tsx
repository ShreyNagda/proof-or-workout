import { formatNumber } from "@/utils/helpers";

interface OCRProgressProps {
  detectedSteps: number;
}

export default function OCRProgress({ detectedSteps }: OCRProgressProps) {
  return (
    <div className="rounded-lg px-4 py-3 flex items-center gap-3 border-glow-green animate-pulse bg-green-500/10 border-2 border-green-500/40">
      <span className="text-3xl">✅</span>
      <div className="flex-1">
        <p className="text-xs font-semibold text-pow-green">
          Steps Successfully Detected!
        </p>
        <p className="text-2xl font-bold text-pow-green">
          {formatNumber(detectedSteps)} steps
        </p>
        <p className="text-xs mt-1 text-pow-muted">
          Click &quot;Submit Proof&quot; below to record this on the blockchain
        </p>
      </div>
    </div>
  );
}
