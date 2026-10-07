import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllBlogPostSlugs,
  getBlogPostBySlug,
  getPillarPost,
} from "@/lib/blog-registry";
import { ToolEmbedBanner } from "@/components/blog/ToolEmbedBanner";
import { AuthorBioCard } from "@/components/blog/AuthorBioCard";
import { TopicClusterNav } from "@/components/blog/TopicClusterNav";
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
      canonical: `https://www.convertsheet.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      url: `https://www.convertsheet.com/blog/${post.slug}`,
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

  const isPillar = post.role === "pillar";
  const pillarPost = !isPillar && post.pillarSlug ? getBlogPostBySlug(post.pillarSlug) : undefined;

  const breadcrumbItems = [
    { name: "Home", url: "https://www.convertsheet.com" },
    { name: "Blog", url: "https://www.convertsheet.com/blog" },
    ...(pillarPost
      ? [{ name: pillarPost.title, url: `https://www.convertsheet.com/blog/${pillarPost.slug}` }]
      : []),
    { name: post.title, url: `https://www.convertsheet.com/blog/${post.slug}` },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        author: {
          "@type": "Person",
          name: post.author.name,
          jobTitle: post.author.role,
          url: "https://www.convertsheet.com/about",
          sameAs: [
            post.author.linkedInUrl,
            post.author.twitterUrl,
            post.author.githubUrl,
          ].filter(Boolean),
        },
        publisher: {
          "@type": "Organization",
          name: "ConvertSheet",
          url: "https://www.convertsheet.com",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://www.convertsheet.com/blog/${post.slug}`,
        },
      },
      breadcrumbJsonLd,
    ],
  };

  return (
    <article className="min-h-screen bg-zinc-50/40 pb-20 dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Header with Topic Hierarchy */}
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
          {pillarPost && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
              <Link
                href={`/blog/${pillarPost.slug}`}
                className="max-w-[200px] truncate transition-colors hover:text-zinc-900 dark:hover:text-white"
                title={pillarPost.title}
              >
                {pillarPost.title}
              </Link>
            </>
          )}
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

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-extrabold text-sm shadow-xs">
                {post.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    {post.author.name}
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                    Founder
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {post.author.role}
                </p>
              </div>
            </div>

            {/* Quick Author Verification Links */}
            <div className="flex items-center gap-2 text-xs">
              {post.author.linkedInUrl && (
                <a
                  href={post.author.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-[#0A66C2] transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.37 9.74V9.95H5.09v8.55h2.74z" />
                  </svg>
                  <span className="text-[11px] font-medium">LinkedIn</span>
                </a>
              )}
              {post.author.githubUrl && (
                <a
                  href={post.author.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 transition-colors"
                  aria-label="GitHub Profile"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                  </svg>
                  <span className="text-[11px] font-medium">GitHub</span>
                </a>
              )}
              {post.author.twitterUrl && (
                <a
                  href={post.author.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 transition-colors"
                  aria-label="X Profile"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-[11px] font-medium">X</span>
                </a>
              )}
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

            {/* Author Bio Box for E-E-A-T and Personal Authority */}
            <AuthorBioCard author={post.author} className="mt-12" />

            {/* Pillar & Branch Topic Cluster Cross-Linking Hub */}
            <TopicClusterNav currentPost={post} className="mt-10" />

            {/* Bottom Interactive Tool Embed for conversion */}
            <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
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
