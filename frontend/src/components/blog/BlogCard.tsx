import React from "react";
import Link from "next/link";
import { Clock, Calendar, ArrowRight, BookOpen } from "lucide-react";
import type { BlogPost } from "@/lib/blog-registry";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            {post.category}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {post.readTimeMinutes} min read
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold tracking-tight text-zinc-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
          <Link href={`/blog/${post.slug}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {post.title}
          </Link>
        </h3>

        <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {post.description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          <span>{post.author.name}</span>
        </div>
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
          Read Guide
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
