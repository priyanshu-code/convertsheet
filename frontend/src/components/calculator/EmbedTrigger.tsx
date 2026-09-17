"use client";

import React, { useState } from "react";
import { Code } from "lucide-react";
import { ToolConfig } from "@/types/tool";
import { EmbedModal, EmbedTarget } from "@/components/calculator/EmbedModal";

export interface EmbedTriggerProps {
  tool: ToolConfig | EmbedTarget;
}

export function EmbedTrigger({ tool }: EmbedTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer shadow-xs active:scale-95"
        title={`Embed ${tool.name} on your website or blog`}
        aria-label="Embed calculator widget"
      >
        <Code className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Embed</span>
      </button>

      <EmbedModal tool={tool} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
