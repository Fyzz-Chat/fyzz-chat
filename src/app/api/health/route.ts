import { NextResponse } from "next/server";
import { getVersion } from "@/lib/backend/utils";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma/prisma";

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
    connections.forEach((c) => {
      logger.debug(`IP: ${c.ip},\tState: ${c.state},\tCount: ${c.connection_count}`);
    });
    return { status: "PASS", message: "Connected" };
  } catch (error) {
    return {
      status: "FAIL",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function GET() {
  const startTime = performance.now();

  const app_version = getVersion();

  try {
    const dbCheck = await checkDatabase();

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    return NextResponse.json(
      {
        status: dbCheck.status === "PASS" ? "OK" : "WARNING",
        version: app_version,
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
  } catch (error) {
    logger.error("Health check failed:", error);

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    return NextResponse.json(
      {
        status: "ERROR",
        version: app_version,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
