import React from "react";
import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog-registry";
import { BlogCard } from "@/components/blog/BlogCard";
import { BookOpen, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Engineering Blog & Data Guides | ConvertSheet",
  description:
    "In-depth guides, privacy-first data processing tutorials, and conversion benchmarks from the ConvertSheet engineering team.",
  alternates: {
    canonical: "https://www.convertsheet.com/blog",
  },
  openGraph: {
    title: "ConvertSheet Engineering & Data Privacy Blog",
    description:
      "Guides and tutorials on processing nested JSON, CSVs, and Excel spreadsheets locally with zero server uploads.",
    type: "website",
    url: "https://www.convertsheet.com/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>ConvertSheet Engineering & Data Guides</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            Guides, Benchmarks & Privacy Insights
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
            Learn how to handle massive JSON files, extract nested structures, and perform instant spreadsheet calculations locally in your browser with zero data leaks.
          </p>

          {/* Value Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              100% In-Browser Privacy
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Developer & Financial Analyst Tutorials
            </span>
          </div>
        </div>
      </section>

      {/* Topic Pillars & Comprehensive Hubs */}
      <section className="mx-auto max-w-5xl px-4 pt-12 pb-6 sm:px-6 lg:px-8" aria-label="Core Topic Pillars">
        <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Latest Articles &amp; Guides
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Foundational architectural breakdowns and benchmark frameworks
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            {posts.filter((p) => p.role === "pillar").length} Pillars
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {posts
            .filter((p) => p.role === "pillar")
            .map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
        </div>
      </section>

      {/* Deep Dive Branch Articles */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" aria-label="Branch Articles & Deep Dives">
        <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              🌿 Specialized Deep Dives & Branch Studies
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Targeted scenario analyses, mathematical proofs, and actionable strategies
            </p>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {posts.filter((p) => p.role !== "pillar").length} Deep Dives
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {posts
            .filter((p) => p.role !== "pillar")
            .map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
        </div>
      </section>
    </div>
  );
}
