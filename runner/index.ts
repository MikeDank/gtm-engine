#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("runner")
  .description("GTM Engine CLI runner for data ingestion and tasks")
  .version("0.1.0");

program
  .command("ingest:rss <url>")
  .description("Ingest signals from an RSS feed URL")
  .action(async (url: string) => {
    console.log(`TODO: Ingest RSS from ${url}`);
  });

program.parse();
