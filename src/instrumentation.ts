/*
  Runs once when the server boots. In production this connects to your
  Supabase Postgres, creates schema "gadda" + all tables if missing, and
  imports the old data/ files the first time.
*/
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { migrate } = await import("@/lib/migrate");
  try {
    await migrate();
  } catch (e) {
    console.error("[db] startup migration failed — will retry on first request:", (e as Error).message);
  }
}
