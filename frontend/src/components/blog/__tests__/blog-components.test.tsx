import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ToolEmbedBanner } from "../ToolEmbedBanner";
import { BlogCard } from "../BlogCard";
import { BLOG_POSTS } from "@/lib/blog-registry";

describe("Blog UI Components", () => {
  it("renders ToolEmbedBanner with direct action link", () => {
    render(
      <ToolEmbedBanner
        toolSlug="json-to-excel"
        toolTitle="JSON to Excel Converter"
      />
    );
    expect(screen.getByText("Interactive Tool")).toBeInTheDocument();
    expect(screen.getByText("JSON to Excel Converter")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open Free In-Browser Tool/i })).toHaveAttribute(
      "href",
      "/convert/json-to-excel"
    );
  });

  it("renders BlogCard with title, category, read time, and link", () => {
    const post = BLOG_POSTS[0];
    render(<BlogCard post={post} />);
    expect(screen.getByText(post.title)).toBeInTheDocument();
    expect(screen.getByText(post.category)).toBeInTheDocument();
    expect(screen.getByText(`${post.readTimeMinutes} min read`)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", `/blog/${post.slug}`);
  });
});
