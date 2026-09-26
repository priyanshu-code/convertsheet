import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ToolEmbedBanner } from "../ToolEmbedBanner";
import { BlogCard } from "../BlogCard";
import { AuthorBioCard } from "../AuthorBioCard";
import { BLOG_POSTS, FOUNDER_AUTHOR } from "@/lib/blog-registry";

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

  it("renders ToolEmbedBanner with /tools/ link for calculator/tool slugs", () => {
    render(
      <ToolEmbedBanner
        toolSlug="income-tax-calculator"
        toolTitle="Income Tax Calculator"
      />
    );
    expect(screen.getByRole("link", { name: /Open Free In-Browser Tool/i })).toHaveAttribute(
      "href",
      "/tools/income-tax-calculator"
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

  it("renders AuthorBioCard with verified author, bio, and social profile links", () => {
    render(<AuthorBioCard author={FOUNDER_AUTHOR} />);
    expect(screen.getByText("Priyanshu Rawat")).toBeInTheDocument();
    expect(screen.getByText("Founder & Lead Software Engineer")).toBeInTheDocument();
    expect(screen.getByText(/Software engineer and founder of ConvertSheet/i)).toBeInTheDocument();
    expect(screen.getByText("Verified Author")).toBeInTheDocument();

    const linkedInLink = screen.getByRole("link", { name: /Priyanshu Rawat on LinkedIn/i });
    expect(linkedInLink).toHaveAttribute("href", "https://www.linkedin.com/in/priyanshu-rawat-570b7a19b/");

    const githubLink = screen.getByRole("link", { name: /Priyanshu Rawat on GitHub/i });
    expect(githubLink).toHaveAttribute("href", "https://github.com/priyanshu-code");

    const twitterLink = screen.getByRole("link", { name: /Priyanshu Rawat on X/i });
    expect(twitterLink).toHaveAttribute("href", "https://x.com/priyanshuz_code");
  });
});
