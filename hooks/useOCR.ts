"use client";

import { useState, useCallback } from "react";
import { extractStepsFromOCR } from "@/utils/contract";
import type { OCRStatus, UseOCRReturn } from "@/types";

interface UseOCROptions {
  addLog: (
    message: string,
    type?: "info" | "success" | "error" | "warn",
  ) => void;
  onStepsDetected?: (steps: number) => void;
}

export function useOCR({
  addLog,
  onStepsDetected,
}: UseOCROptions): UseOCRReturn {
  const [ocrStatus, setOcrStatus] = useState<OCRStatus>("idle");
  const [detectedSteps, setDetectedSteps] = useState<number | null>(null);

  const processImage = useCallback(
    async (file: File) => {
      setOcrStatus("processing");
      setDetectedSteps(null);
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
          addLog(
            `✅ Successfully detected ${steps.toLocaleString()} steps! Click "Submit Proof" to record on-chain.`,
            "success",
          );
          onStepsDetected?.(steps);
        }
      } catch (err: unknown) {
        setOcrStatus("error");
        addLog(`OCR failed: ${(err as Error).message}`, "error");
      }
    },
    [addLog, onStepsDetected],
  );

  const resetOCR = useCallback(() => {
    setOcrStatus("idle");
    setDetectedSteps(null);
  }, []);

  return {
    ocrStatus,
    detectedSteps,
    processImage,
    resetOCR,
  };
}
