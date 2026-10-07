import React from "react";
import Link from "next/link";
import { GitBranch, Layers, ArrowRight, BookOpen } from "lucide-react";
import {
  BlogPost,
  getPillarPost,
  getBranchPosts,
  getBlogPostBySlug,
} from "@/lib/blog-registry";

interface TopicClusterNavProps {
  currentPost: BlogPost;
  className?: string;
}

export function TopicClusterNav({ currentPost, className = "" }: TopicClusterNavProps) {
  if (!currentPost.clusterId) return null;

  const isPillar = currentPost.role === "pillar";
  const pillarPost = isPillar
    ? currentPost
    : currentPost.pillarSlug
    ? getBlogPostBySlug(currentPost.pillarSlug)
    : getPillarPost(currentPost.clusterId);

  // If current is pillar, show its branches.
  // If current is branch, show pillar + sibling branches.
  const branchPosts = pillarPost
    ? getBranchPosts(pillarPost.slug).filter((p) => p.slug !== currentPost.slug)
    : [];

  // If there are no sibling or child guides in this cluster, don't render an empty card
  if (!isPillar && !pillarPost && branchPosts.length === 0) return null;
  if (isPillar && branchPosts.length === 0) return null;

  return (
    <nav
      aria-label="Topic Cluster Guides"
      className={`my-8 rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50/70 via-white to-emerald-50/20 p-6 shadow-xs dark:border-zinc-800 dark:from-zinc-900/60 dark:via-zinc-900 dark:to-emerald-950/20 ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 pb-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
            {isPillar ? (
              <Layers className="h-4 w-4" aria-hidden="true" />
            ) : (
              <GitBranch className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              {isPillar ? "Topic Cluster Sub-Guides" : "Topic Cluster Hub & Related Guides"}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {isPillar
                ? "Deep-dive branch articles connected to this comprehensive pillar guide"
                : "Explore the core pillar authority guide and connected analysis"}
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
          {isPillar ? "Pillar Guide" : "Topic Branch"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {/* If current is branch, render link back to the parent pillar */}
        {!isPillar && pillarPost && (
          <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-3.5 transition-colors hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <Layers className="h-3 w-3" />
                  Core Pillar Guide
                </span>
                <h4 className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                  <Link
                    href={`/blog/${pillarPost.slug}`}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {pillarPost.title}
                  </Link>
                </h4>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                  {pillarPost.description}
                </p>
              </div>
              <Link
                href={`/blog/${pillarPost.slug}`}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                aria-label={`Read core pillar guide: ${pillarPost.title}`}
              >
                <span>Read Pillar</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Branch / Sibling Guides List */}
        {branchPosts.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isPillar ? "Specialized Deep Dives" : "Related Deep Dives in This Series"}
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {branchPosts.map((branch) => (
                <li
                  key={branch.slug}
                  className="group rounded-xl border border-zinc-200/80 bg-white p-3 transition-all hover:border-emerald-300 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900/80"
                >
                  <Link
                    href={`/blog/${branch.slug}`}
                    className="flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                        <span className="font-medium text-emerald-700 dark:text-emerald-400">
                          {branch.category}
                        </span>
                        <span>{branch.readTimeMinutes} min read</span>
                      </div>
                      <h5 className="mt-1 text-xs font-bold text-zinc-900 group-hover:text-emerald-600 dark:text-zinc-100 dark:group-hover:text-emerald-400 line-clamp-2">
                        {branch.title}
                      </h5>
                    </div>
                    <div className="mt-2.5 flex items-center justify-end text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Read Guide</span>
                      <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
