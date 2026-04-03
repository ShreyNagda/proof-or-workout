// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const DAILY_UPLOAD_LIMIT = 3;
export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111

// ---------------------------------------------------------------------------
// Mobile detection
// ---------------------------------------------------------------------------
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isMetaMaskInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.ethereum?.isMetaMask);
}

export function isInMetaMaskBrowser(): boolean {
  if (typeof window === "undefined") return false;
  // MetaMask mobile browser injects ethereum and sets isMetaMask
  return Boolean(window.ethereum?.isMetaMask);
}

export function getMetaMaskDeepLink(): string {
  if (typeof window === "undefined") return "";
  // Deep link to open current dApp in MetaMask mobile browser
  const dappUrl = window.location.href.replace(/^https?:\/\//, "");
  return `https://metamask.app.link/dapp/${dappUrl}`;
}

// ---------------------------------------------------------------------------
// Number formatting
// ---------------------------------------------------------------------------
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function formatRewards(inEth: string): string {
  return parseFloat(inEth).toFixed(4);
}

// ---------------------------------------------------------------------------
// Daily upload tracking (sessionStorage)
// ---------------------------------------------------------------------------
export function getDailyUploadCount(): number {
  if (typeof window === "undefined") return 0;

  const storedDate = sessionStorage.getItem("pow_upload_date");
  const today = new Date().toDateString();

  if (storedDate === today) {
    return parseInt(sessionStorage.getItem("pow_upload_count") ?? "0", 10);
  }

  // Reset for new day
  sessionStorage.setItem("pow_upload_date", today);
  sessionStorage.setItem("pow_upload_count", "0");
  return 0;
}

export function incrementDailyUploadCount(currentCount: number): number {
  const next = currentCount + 1;
  sessionStorage.setItem("pow_upload_count", String(next));
  return next;
}

// ---------------------------------------------------------------------------
// Time formatting
// ---------------------------------------------------------------------------
export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString("en-US", { hour12: false });
}
