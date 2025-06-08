import { readFileSync } from "fs";
import { join } from "path";
import prisma from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
const APP_VERSION = packageJson.version;

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "PASS", message: "Connected" };
  } catch (error: any) {
    return { status: "FAIL", message: error.message };
  }
}

export async function GET() {
  const startTime = Date.now();

  try {
    const dbCheck = await checkDatabase();

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return NextResponse.json(
      {
        status: dbCheck.status === "PASS" ? "OK" : "WARNING",
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
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
    console.error("Health check failed:", error);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return NextResponse.json(
      {
        status: "ERROR",
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
