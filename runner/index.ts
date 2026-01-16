#!/usr/bin/env node
import { Command } from "commander";
import Parser from "rss-parser";
import { db } from "./db";

const program = new Command();
const parser = new Parser();

program
  .name("runner")
  .description("GTM Engine CLI runner for data ingestion and tasks")
  .version("0.1.0");

program
  .command("ingest:rss <url>")
  .description("Ingest signals from an RSS feed URL")
  .action(async (url: string) => {
    console.log(`Fetching RSS feed: ${url}`);

    try {
      const feed = await parser.parseURL(url);
      console.log(`Found ${feed.items.length} items in feed: ${feed.title}`);

      let insertedCount = 0;

      for (const item of feed.items) {
        const excerpt = [item.title, item.contentSnippet]
          .filter(Boolean)
          .join(" - ")
          .slice(0, 500);

        const source = item.link || url;
        const capturedAt = item.pubDate ? new Date(item.pubDate) : new Date();

        await db.signal.create({
          data: {
            source,
            excerpt,
            status: "pending",
            capturedAt,
          },
        });

        insertedCount++;
        console.log(`  ✓ ${item.title?.slice(0, 60)}...`);
      }

      console.log(`\nInserted ${insertedCount} signals into database`);
      await db.$disconnect();
    } catch (error) {
      console.error("Failed to ingest RSS feed:", error);
      await db.$disconnect();
      process.exit(1);
    }
  });

program
  .command("ingest:github <repo>")
  .description("Ingest signals from GitHub repo (e.g., owner/repo)")
  .action(async (repo: string) => {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      console.error("Error: GITHUB_TOKEN environment variable is required");
      console.error("Set it in your .env file or export it in your shell");
      process.exit(1);
    }

    const [owner, repoName] = repo.split("/");
    if (!owner || !repoName) {
      console.error(
        "Error: Invalid repo format. Use owner/repo (e.g., facebook/react)"
      );
      process.exit(1);
    }

    console.log(`Fetching merged PRs from GitHub: ${owner}/${repoName}`);

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/pulls?state=closed&sort=updated&direction=desc&per_page=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}`
        );
      }

      const pulls = (await response.json()) as Array<{
        number: number;
        title: string;
        html_url: string;
        merged_at: string | null;
        user: { login: string } | null;
        body: string | null;
      }>;

      const mergedPRs = pulls.filter((pr) => pr.merged_at !== null);
      console.log(`Found ${mergedPRs.length} recently merged PRs`);

      for (const pr of mergedPRs) {
        console.log(`  - PR #${pr.number}: ${pr.title.slice(0, 60)}...`);
      }

      console.log("\nPRs fetched successfully (DB insert in next task)");
    } catch (error) {
      console.error("Failed to fetch from GitHub:", error);
      process.exit(1);
    }

    await db.$disconnect();
  });

program.parse();
