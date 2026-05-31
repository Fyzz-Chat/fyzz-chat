import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSignedUrlForKey } from "@/lib/aws/s3";
import { isOwnedFileKey } from "@/lib/backend/file-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mints a fresh, short-lived signed CloudFront URL on every request and
// redirects to it. Messages cached in the browser store the stable
// `/api/files/<key>` path (never a time-bound URL), so attachment URLs can
// never go stale — this route signs on demand.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { key: segments } = await params;
  const key = segments.join("/");

  if (!isOwnedFileKey(key, session.user.id)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const signedUrl = getSignedUrlForKey(key);
  if (!signedUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.redirect(signedUrl, 302);
}
