// ---------------------------------------------------------------------------
// Transaction & OCR Status Types
// ---------------------------------------------------------------------------
export type TxStatus = "idle" | "pending" | "success" | "error";
export type OCRStatus = "idle" | "processing" | "done" | "error";

// ---------------------------------------------------------------------------
// Activity Log
// ---------------------------------------------------------------------------
export type LogType = "info" | "success" | "error" | "warn";

export interface LogEntry {
  id: number;
  time: string;
  message: string;
  type: LogType;
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
export type StatAccent = "orange" | "green" | "muted" | "red";

export interface StatCardProps {
  label: string;
  value: string;
  accent: StatAccent;
  icon: string;
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// OCR Hook Return Type
// ---------------------------------------------------------------------------
export interface UseOCRReturn {
  ocrStatus: OCRStatus;
  detectedSteps: number | null;
  processImage: (file: File) => Promise<void>;
  resetOCR: () => void;
}

// ---------------------------------------------------------------------------
// Proof of Workout Hook Return Type
// ---------------------------------------------------------------------------
export interface UseProofOfWorkoutReturn {
  // Wallet state
  account: string;
  isConnecting: boolean;
  hasJoined: boolean;
  joinTxStatus: TxStatus;

  // Contract data
  totalRewards: string;
  isLoadingRewards: boolean;

  // Proof submission
  submitTxStatus: TxStatus;

  // Actions
  connectWallet: () => Promise<void>;
  joinChallenge: () => Promise<void>;
  submitProof: (steps: number) => Promise<void>;
  fetchRewards: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Activity Log Hook Return Type
// ---------------------------------------------------------------------------
export interface UseActivityLogReturn {
  logs: LogEntry[];
  addLog: (message: string, type?: LogType) => void;
  clearLogs: () => void;
}

// ---------------------------------------------------------------------------
// Upload Zone Props
// ---------------------------------------------------------------------------
export interface UploadZoneProps {
  canUpload: boolean;
  ocrStatus: OCRStatus;
  uploadsRemaining: number;
  onFileSelect: (file: File) => void;
}

// ---------------------------------------------------------------------------
// Wallet Card Props
// ---------------------------------------------------------------------------
export interface WalletCardProps {
  account: string;
  hasJoined: boolean;
  isConnecting: boolean;
  joinTxStatus: TxStatus;
  onConnect: () => void;
  onJoin: () => void;
}
