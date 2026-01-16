import Parser from "rss-parser";
import type { Connector, ConnectorResult, NormalizedSignal } from "@/core/types";

const parser = new Parser();

export const rssConnector: Connector = {
  name: "rss",

  async ingest(url: string): Promise<ConnectorResult> {
    const feed = await parser.parseURL(url);
    const signals: NormalizedSignal[] = [];

    for (const item of feed.items) {
      const excerpt = [item.title, item.contentSnippet]
        .filter(Boolean)
        .join(" - ")
        .slice(0, 500);

      const source = item.link || url;
      const capturedAt = item.pubDate ? new Date(item.pubDate) : new Date();

      signals.push({
        source,
        excerpt,
        status: "pending",
        capturedAt,
      });
    }

    return {
      signals,
      meta: {
        source: url,
        fetchedAt: new Date(),
        itemCount: signals.length,
      },
    };
  },
};
