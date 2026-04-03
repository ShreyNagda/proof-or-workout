"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getProviderWeb3,
  getProviderContract,
  getReadContract,
  maskAddress,
} from "@/utils/contract";
import {
  SEPOLIA_CHAIN_ID,
  formatRewards,
  isMobile,
  isMetaMaskInstalled,
  getMetaMaskDeepLink,
} from "@/utils/helpers";
import type { TxStatus, UseProofOfWorkoutReturn } from "@/types";

interface UseProofOfWorkoutOptions {
  addLog: (
    message: string,
    type?: "info" | "success" | "error" | "warn",
  ) => void;
}

export function useProofOfWorkout({
  addLog,
}: UseProofOfWorkoutOptions): UseProofOfWorkoutReturn {
  // Wallet state
  const [account, setAccount] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [joinTxStatus, setJoinTxStatus] = useState<TxStatus>("idle");

  // Contract data
  const [totalRewards, setTotalRewards] = useState<string>("0");
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);

  // Proof submission
  const [submitTxStatus, setSubmitTxStatus] = useState<TxStatus>("idle");

  // ---------------------------------------------------------------------------
  // Check if user has joined the challenge
  // ---------------------------------------------------------------------------
  const checkJoinStatus = useCallback(
    async (addr: string) => {
      try {
        const contract = getReadContract();
        const joined = await contract.methods.hasJoined(addr).call();
        setHasJoined(Boolean(joined));
        if (joined) addLog("You are enrolled in the challenge.", "info");
      } catch {
        // Contract may not be deployed yet — silently ignore
      }
    },
    [addLog],
  );

  // ---------------------------------------------------------------------------
  // Connect Wallet (with mobile MetaMask support)
  // ---------------------------------------------------------------------------
  const connectWallet = useCallback(async () => {
    // Mobile: redirect to MetaMask app if not in MetaMask browser
    if (isMobile() && !isMetaMaskInstalled()) {
      addLog("Redirecting to MetaMask app...", "info");
      window.location.href = getMetaMaskDeepLink();
      return;
    }

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
  }, [addLog, checkJoinStatus]);

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
  }, [addLog, checkJoinStatus]);

  // ---------------------------------------------------------------------------
  // Join challenge
  // ---------------------------------------------------------------------------
  const joinChallenge = useCallback(async () => {
    if (!account) return;
    setJoinTxStatus("pending");
    addLog("Sending joinChallenge() transaction...", "info");
    try {
      const contract = getProviderContract();
      await contract.methods.joinChallenge().send({
        from: account,
        gas: "100000",
      });
      setHasJoined(true);
      setJoinTxStatus("success");
      addLog("Successfully joined the challenge!", "success");
    } catch (err: unknown) {
      setJoinTxStatus("error");
      addLog(`joinChallenge failed: ${(err as Error).message}`, "error");
    }
  }, [account, addLog]);

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
      setTotalRewards(formatRewards(inEth));
      addLog(`Rewards fetched: ${formatRewards(inEth)} POW`, "success");
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
  // Submit proof on-chain
  // ---------------------------------------------------------------------------
  const submitProof = useCallback(
    async (steps: number) => {
      if (!account) return;
      setSubmitTxStatus("pending");
      addLog(`Submitting proof: ${steps} steps on-chain...`, "info");
      try {
        const contract = getProviderContract();
        await contract.methods.submitProof(steps).send({
          from: account,
          gas: "150000",
        });
        setSubmitTxStatus("success");
        addLog(
          `Proof submitted! ${steps.toLocaleString()} steps recorded.`,
          "success",
        );
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
    },
    [account, addLog, fetchRewards],
  );

  // ---------------------------------------------------------------------------
  // Reset submit status (for UI reset after submission)
  // ---------------------------------------------------------------------------
  const resetSubmitStatus = useCallback(() => {
    setSubmitTxStatus("idle");
  }, []);

  return {
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
  };
}
