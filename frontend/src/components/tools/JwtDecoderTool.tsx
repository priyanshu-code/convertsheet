"use client";

import React, { useState, useMemo } from "react";
import { KeyRound, ShieldCheck, AlertCircle, Clock } from "lucide-react";
import {
  CalcCard,
  CalcTextarea,
  CalcResult,
  CalcCopyButton,
  CalcPromptButton,
} from "@/components/calculator";

// Standard sample JWT for initial state
const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTY3MjUwMjQwMCwiZXhwIjoyMDgwMDAwMDAwfQ." +
  "s3cr3ts1gn4tur3_d3m0_only";

export function JwtDecoderTool() {
  const [jwtString, setJwtString] = useState<string>(SAMPLE_JWT);

  const { header, payload, signature, error, isExpired, expDate, iatDate } = useMemo(() => {
    const raw = jwtString.trim();
    if (!raw) return { header: null, payload: null, signature: "", error: null, isExpired: null, expDate: null, iatDate: null };

    const parts = raw.split(".");
    if (parts.length !== 3) {
      return {
        header: null,
        payload: null,
        signature: "",
        error: "Invalid JWT format. A valid token must contain 3 dot-separated parts (Header.Payload.Signature).",
        isExpired: null,
        expDate: null,
        iatDate: null,
      };
    }

    try {
      const base64UrlDecode = (str: string) => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        const bin = atob(base64);
        const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
      };

      const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
      const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));

      let expired: boolean | null = null;
      let expD: string | null = null;
      let iatD: string | null = null;

      if (decodedPayload.exp && typeof decodedPayload.exp === "number") {
        const expMs = decodedPayload.exp * 1000;
        expired = Date.now() > expMs;
        expD = new Date(expMs).toUTCString();
      }

      if (decodedPayload.iat && typeof decodedPayload.iat === "number") {
        iatD = new Date(decodedPayload.iat * 1000).toUTCString();
      }

      return {
        header: decodedHeader,
        payload: decodedPayload,
        signature: parts[2],
        error: null,
        isExpired: expired,
        expDate: expD,
        iatDate: iatD,
      };
    } catch (e: any) {
      return {
        header: null,
        payload: null,
        signature: parts[2] || "",
        error: e.message || "Failed to decode Base64URL segment or parse JSON",
        isExpired: null,
        expDate: null,
        iatDate: null,
      };
    }
  }, [jwtString]);

  const headerJson = useMemo(() => (header ? JSON.stringify(header, null, 2) : ""), [header]);
  const payloadJson = useMemo(() => (payload ? JSON.stringify(payload, null, 2) : ""), [payload]);

  const llmPrompt = `Analyze this JWT token structure:
Header:
${headerJson}

Payload:
${payloadJson}

Please verify the claims, standard security headers, algorithm suitability, and token expiry compliance.`;

  return (
    <CalcCard
      title="JWT Token Inspector & Decoder"
      subtitle="Decode and inspect JSON Web Tokens (JWT) headers, claims, issued timestamps, and expiration status in browser memory."
      icon={KeyRound}
      badge="100% Client-Side"
    >
      <div className="space-y-6">
        <CalcTextarea
          id="jwt-input"
          label="Encoded JWT Token"
          value={jwtString}
          onChange={setJwtString}
          rows={3}
          placeholder="Paste JWT (eyJhbGciOi...)"
        />

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {payload && (
          <CalcResult
            title="Token Claims & Expiry"
            primaryLabel="Token Status"
            primaryValue={isExpired === null ? "No Expiry Claim" : isExpired ? "Expired" : "Active / Valid"}
            primarySubtext={isExpired === true ? "This token has expired" : "Valid active token signature format"}
            items={[
              {
                label: "Issued At (iat)",
                value: iatDate || "Not Specified",
              },
              {
                label: "Expires At (exp)",
                value: expDate || "No Exp Limit",
                highlight: isExpired === false,
              },
            ]}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Header: Algorithm &amp; Token Type
              </span>
              {headerJson && <CalcCopyButton text={headerJson} />}
            </div>
            <pre className="p-4 rounded-xl bg-zinc-900 text-rose-300 font-mono text-xs overflow-x-auto border border-zinc-800 min-h-[120px]">
              {headerJson || "// Header will appear here"}
            </pre>
          </div>

          {/* Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Payload: Data Claims
              </span>
              {payloadJson && <CalcCopyButton text={payloadJson} />}
            </div>
            <pre className="p-4 rounded-xl bg-zinc-900 text-purple-300 font-mono text-xs overflow-x-auto border border-zinc-800 min-h-[120px]">
              {payloadJson || "// Payload claims will appear here"}
            </pre>
          </div>
        </div>

        {signature && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Signature (Base64URL)
            </span>
            <pre className="p-3 rounded-xl bg-zinc-900 text-sky-300 font-mono text-xs overflow-x-auto border border-zinc-800 truncate">
              {signature}
            </pre>
          </div>
        )}

        <div className="pt-2 flex flex-wrap gap-3">
          <CalcPromptButton prompt={llmPrompt} toolName="JWT" />
        </div>
      </div>
    </CalcCard>
  );
}
