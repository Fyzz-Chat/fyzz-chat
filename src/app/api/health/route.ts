import { readFileSync } from "fs";
import { join } from "path";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
const APP_VERSION = packageJson.version;

const CONNECTION_QUERY = `
SELECT 
  client_addr as ip,
  state,
  COUNT(*) as connection_count
FROM pg_stat_activity
WHERE backend_type = 'client backend'
GROUP BY 1, 2
ORDER BY connection_count DESC;
`;

async function checkDatabase() {
  try {
    const connections =
      await prisma.$queryRawUnsafe<
        {
          ip: string;
          state: string;
          connection_count: number;
        }[]
      >(CONNECTION_QUERY);
    logger.debug("Database connections:");
    connections.forEach((c: any) => {
      logger.debug(`IP: ${c.ip},\tState: ${c.state},\tCount: ${c.connection_count}`);
    });
    return { status: "PASS", message: "Connected" };
  } catch (error: any) {
    return { status: "FAIL", message: error.message };
  }
}

export async function GET() {
  const startTime = performance.now();

  try {
    const dbCheck = await checkDatabase();

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    return NextResponse.json(
      {
        status: dbCheck.status === "PASS" ? "OK" : "WARNING",
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime.toFixed(2)}ms`,
        checks: {
          config: "PASS",
          database: dbCheck.status,
        },
        details: {
          database: dbCheck.message,
        },
      },
      { status: dbCheck.status === "PASS" ? 200 : 207 }
    );
  } catch (error: any) {
    logger.error("Health check failed:", error);

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    return NextResponse.json(
      {
        status: "ERROR",
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime.toFixed(2)}ms`,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
