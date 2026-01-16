#!/usr/bin/env node
import { Command } from "commander";
import Parser from "rss-parser";

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

      for (const item of feed.items) {
        const excerpt = [item.title, item.contentSnippet]
          .filter(Boolean)
          .join(" - ");

        console.log(`  - ${item.title}`);
        console.log(`    Source: ${item.link}`);
        console.log(`    Date: ${item.pubDate}`);
        console.log(`    Excerpt: ${excerpt.slice(0, 100)}...`);
        console.log();
      }

      console.log(
        `Parsed ${feed.items.length} items (DB insert not implemented yet)`
      );
    } catch (error) {
      console.error("Failed to fetch/parse RSS feed:", error);
      process.exit(1);
    }
  });

program.parse();
