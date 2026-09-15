"use client";

import React, { useState, useEffect, useCallback } from "react";
import { KeyRound, Shield } from "lucide-react";
import {
  CalcCard,
  CalcTextarea,
  CalcResult,
} from "@/components/calculator";

export function HashGeneratorTool() {
  const [input, setInput] = useState("ConvertSheet Privacy-First Engine");
  const [hashes, setHashes] = useState<{
    sha256: string;
    sha512: string;
    sha1: string;
  }>({
    sha256: "",
    sha512: "",
    sha1: "",
  });

  const computeHashes = useCallback(async (text: string) => {
    if (!text) {
      setHashes({ sha256: "", sha512: "", sha1: "" });
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const bufferToHex = (buffer: ArrayBuffer) => {
      const bytes = new Uint8Array(buffer);
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    };

    try {
      const [sha256Buffer, sha512Buffer, sha1Buffer] = await Promise.all([
        crypto.subtle.digest("SHA-256", data),
        crypto.subtle.digest("SHA-512", data),
        crypto.subtle.digest("SHA-1", data),
      ]);

      setHashes({
        sha256: bufferToHex(sha256Buffer),
        sha512: bufferToHex(sha512Buffer),
        sha1: bufferToHex(sha1Buffer),
      });
    } catch {
      // Fallback if crypto.subtle is restricted
    }
  }, []);

  useEffect(() => {
    computeHashes(input);
  }, [input, computeHashes]);

  return (
    <CalcCard
      title="Cryptographic Hash Generator"
      subtitle="Compute secure, one-way SHA-256, SHA-512, and SHA-1 cryptographic digests using native Web Crypto hardware acceleration."
      icon={KeyRound}
      badge="Web Crypto API"
    >
      <CalcTextarea
        id="hash-input"
        label="Input Text or Secret"
        value={input}
        onChange={setInput}
        placeholder="Enter plain text to hash..."
        rows={4}
      />

      <div className="space-y-4 pt-2">
        <CalcResult
          title="SHA-256 Hash (Recommended Standard)"
          primaryLabel="256-bit Hexadecimal Digest"
          primaryValue={hashes.sha256 || "(Enter text above)"}
          copyValue={hashes.sha256}
          items={[
            { label: "Bit Length", value: "256 bits" },
            { label: "Hex Length", value: "64 characters" },
            { label: "Security Level", value: "NIST Approved", badge: "Secure" },
          ]}
        />

        <CalcResult
          title="SHA-512 Hash"
          primaryLabel="512-bit High-Entropy Digest"
          primaryValue={hashes.sha512 || "(Enter text above)"}
          copyValue={hashes.sha512}
          items={[
            { label: "Bit Length", value: "512 bits" },
            { label: "Hex Length", value: "128 characters" },
            { label: "Security Level", value: "Military Grade", badge: "Max" },
          ]}
        />

        <CalcResult
          title="SHA-1 Checksum (Legacy)"
          primaryLabel="160-bit Legacy Digest"
          primaryValue={hashes.sha1 || "(Enter text above)"}
          copyValue={hashes.sha1}
          items={[
            { label: "Bit Length", value: "160 bits" },
            { label: "Hex Length", value: "40 characters" },
            { label: "Status", value: "Git / Legacy Checksums" },
          ]}
        />
      </div>
    </CalcCard>
  );
}
