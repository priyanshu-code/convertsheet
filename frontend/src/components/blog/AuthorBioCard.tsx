import React from "react";
import type { BlogAuthor } from "@/lib/blog-registry";
import { ExternalLink, CheckCircle2 } from "lucide-react";

export interface AuthorBioCardProps {
  author: BlogAuthor;
  className?: string;
}

export function AuthorBioCard({ author, className = "" }: AuthorBioCardProps) {
  return (
    <aside
      aria-label={`About the Author: ${author.name}`}
      className={`p-6 sm:p-7 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Avatar badge */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-extrabold text-xl shadow-md">
          {author.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {author.name}
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Author</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {author.role}
          </p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {author.bio}
      </p>

      {/* Social and verification profiles */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-2.5">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
          Connect:
        </span>
        {author.linkedInUrl && (
          <a
            href={author.linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 border border-zinc-200 dark:border-zinc-700 transition-all"
            aria-label={`${author.name} on LinkedIn`}
          >
            <svg
              className="w-3.5 h-3.5 fill-current text-[#0A66C2]"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.37 9.74V9.95H5.09v8.55h2.74z" />
            </svg>
            <span>LinkedIn</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </a>
        )}
        {author.githubUrl && (
          <a
            href={author.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 border border-zinc-200 dark:border-zinc-700 transition-all"
            aria-label={`${author.name} on GitHub`}
          >
            <svg
              className="w-3.5 h-3.5 fill-current text-zinc-800 dark:text-zinc-200"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
            </svg>
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </a>
        )}
        {author.twitterUrl && (
          <a
            href={author.twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 border border-zinc-200 dark:border-zinc-700 transition-all"
            aria-label={`${author.name} on X`}
          >
            <svg
              className="w-3.5 h-3.5 fill-current text-zinc-900 dark:text-zinc-100"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X (Twitter)</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </a>
        )}
      </div>
    </aside>
  );
}
