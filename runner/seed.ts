import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const demoSignals = [
  {
    source: "https://twitter.com/example/status/123",
    excerpt:
      "Just launched our new API platform! Looking for developers to integrate. #devtools #api",
    status: "pending",
    capturedAt: new Date("2026-01-15T10:00:00Z"),
  },
  {
    source: "https://news.ycombinator.com/item?id=456",
    excerpt:
      "Show HN: We built an open-source alternative to Segment - We're a small team looking for feedback on our data pipeline tool.",
    status: "pending",
    capturedAt: new Date("2026-01-14T15:30:00Z"),
  },
  {
    source: "https://linkedin.com/posts/example-789",
    excerpt:
      "Excited to announce I'm joining Acme Corp as VP of Engineering! Looking forward to building out the platform team.",
    status: "reviewed",
    capturedAt: new Date("2026-01-13T09:00:00Z"),
  },
  {
    source: "https://blog.example.com/scaling-our-infrastructure",
    excerpt:
      "How we scaled from 100 to 10,000 requests per second - lessons learned and tools we evaluated.",
    status: "pending",
    capturedAt: new Date("2026-01-12T14:00:00Z"),
  },
  {
    source: "https://github.com/example/repo/issues/42",
    excerpt:
      "Feature request: We need better integration with CI/CD pipelines. Currently evaluating alternatives.",
    status: "converted",
    capturedAt: new Date("2026-01-11T11:00:00Z"),
  },
];

async function seed() {
  console.log("Seeding database with demo signals...");

  for (const signal of demoSignals) {
    await db.signal.create({ data: signal });
    console.log(`  ✓ ${signal.excerpt.slice(0, 50)}...`);
  }

  console.log(`\nSeeded ${demoSignals.length} demo signals`);
  await db.$disconnect();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
