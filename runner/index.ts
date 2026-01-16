#!/usr/bin/env node
import { Command } from "commander";
import { db } from "./db";
import { registerAllConnectors } from "@/connectors";
import { ingest } from "@/pipeline/ingest";

registerAllConnectors();

const program = new Command();

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
      const result = await ingest("rss", url);
      console.log(`Found ${result.signals.length} items in feed`);

      let insertedCount = 0;

      for (const signal of result.signals) {
        await db.signal.create({
          data: {
            source: signal.source,
            excerpt: signal.excerpt,
            status: signal.status,
            capturedAt: signal.capturedAt,
          },
        });

        insertedCount++;
        console.log(`  ✓ ${signal.excerpt.slice(0, 60)}...`);
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
    console.log(`Fetching merged PRs from GitHub: ${repo}`);

    try {
      const result = await ingest("github", repo);
      console.log(`Found ${result.signals.length} recently merged PRs`);

      let insertedCount = 0;

      for (const signal of result.signals) {
        await db.signal.create({
          data: {
            source: signal.source,
            excerpt: signal.excerpt,
            status: signal.status,
            capturedAt: signal.capturedAt,
          },
        });

        insertedCount++;
        console.log(`  ✓ ${signal.excerpt.slice(0, 60)}...`);
      }

      console.log(`\nInserted ${insertedCount} signals from GitHub PRs`);
    } catch (error) {
      console.error("Failed to fetch from GitHub:", error);
      process.exit(1);
    }

    await db.$disconnect();
  });

program.parse();
