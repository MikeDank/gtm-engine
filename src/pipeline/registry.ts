import type { Connector } from "@/core/types";

const connectors = new Map<string, Connector>();

export function registerConnector(connector: Connector): void {
  connectors.set(connector.name, connector);
}

export function getConnector(name: string): Connector | undefined {
  return connectors.get(name);
}

export function listConnectors(): string[] {
  return Array.from(connectors.keys());
}
