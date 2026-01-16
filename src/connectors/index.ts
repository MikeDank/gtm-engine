import { registerConnector } from "@/pipeline/registry";
import { githubConnector } from "./github";
import { rssConnector } from "./rss";

export function registerAllConnectors(): void {
  registerConnector(githubConnector);
  registerConnector(rssConnector);
}

export { githubConnector } from "./github";
export { rssConnector } from "./rss";
