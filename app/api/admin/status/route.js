import { isAdminAuthenticated } from "../../../../lib/auth";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return Response.json({ authenticated });
}
