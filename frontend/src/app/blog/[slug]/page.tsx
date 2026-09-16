import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllBlogPostSlugs,
  getBlogPostBySlug,
} from "@/lib/blog-registry";
import { ToolEmbedBanner } from "@/components/blog/ToolEmbedBanner";
import {
  Clock,
  Calendar,
  ChevronRight,
  User,
  ListOrdered,
  ArrowLeft,
} from "lucide-react";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return getAllBlogPostSlugs().map((slug) => ({
    slug,
  }));
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Article Not Found | ConvertSheet",
    };
  }

  return {
    title: `${post.title} | ConvertSheet Blog`,
    description: post.description,
    authors: [{ name: post.author.name }],
    alternates: {
      canonical: `https://convertsheet.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      url: `https://convertsheet.com/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: {
      "@type": "Organization",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "ConvertSheet",
      url: "https://convertsheet.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://convertsheet.com/blog/${post.slug}`,
    },
  };

  return (
    <article className="min-h-screen bg-zinc-50/40 pb-20 dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Header */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-zinc-200 bg-white py-3.5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 text-xs font-medium text-zinc-500 sm:px-6 lg:px-8 dark:text-zinc-400">
          <Link
            href="/"
            className="transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
          <Link
            href="/blog"
            className="transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
          <span className="truncate text-zinc-900 dark:text-white font-medium" aria-current="page">
            {post.title}
          </span>
        </div>
      </nav>

      {/* Article Hero */}
      <header className="border-b border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to All Guides
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {post.readTimeMinutes} min read
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl sm:leading-tight dark:text-white">
            {post.title}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
            {post.description}
          </p>

          <div className="mt-6 flex items-center gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
              <User className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                {post.author.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {post.author.role}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Article Body with Sticky Sidebar TOC and Content */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Table of Contents - Desktop sticky navigation */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <ListOrdered className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                Table of Contents
              </div>
              <nav aria-label="Table of Contents">
                <ul className="space-y-2.5 text-sm">
                  {post.tableOfContents.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="text-zinc-600 transition-colors hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Article Content & Embedded Interactive Tool */}
          <div className="lg:col-span-8">
            {/* Top Interactive Tool Embed */}
            <ToolEmbedBanner
              toolSlug={post.attachedToolSlug}
              toolTitle={post.attachedToolTitle}
              ariaLabel={`Try Tool: ${post.attachedToolTitle}`}
            />

            {/* Render Article HTML Content */}
            <div
              className="prose prose-zinc max-w-none dark:prose-invert [&_section]:scroll-mt-24 prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-pre:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Bottom Interactive Tool Embed for conversion */}
            <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
              <ToolEmbedBanner
                toolSlug={post.attachedToolSlug}
                toolTitle={post.attachedToolTitle}
                ariaLabel={`Convert Now: ${post.attachedToolTitle}`}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
