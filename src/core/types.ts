export interface NormalizedSignal {
  source: string;
  excerpt: string;
  status: "pending" | "reviewed" | "converted" | "discarded";
  capturedAt: Date;
}

export interface ConnectorResult {
  signals: NormalizedSignal[];
  meta?: {
    source: string;
    fetchedAt: Date;
    itemCount: number;
  };
}

export interface Connector {
  name: string;
  ingest(input: string): Promise<ConnectorResult>;
}
