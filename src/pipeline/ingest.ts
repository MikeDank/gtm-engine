import type { ConnectorResult } from "@/core/types";
import { getConnector } from "./registry";

export async function ingest(
  connectorName: string,
  input: string
): Promise<ConnectorResult> {
  const connector = getConnector(connectorName);

  if (!connector) {
    throw new Error(
      `Unknown connector: ${connectorName}. Available connectors: ${connectorName}`
    );
  }

  return connector.ingest(input);
}
