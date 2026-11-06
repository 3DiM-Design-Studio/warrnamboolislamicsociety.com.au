import { Card } from "@/components/admin/ui";

type DbError = { code?: string; message: string } | null;

/** True when the database tables have not been created yet. */
export function isMissingSetup(error: DbError) {
  return Boolean(error && (error.code === "42P01" || error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message)));
}

export function LoadError({ error }: { error: NonNullable<DbError> }) {
  if (isMissingSetup(error)) {
    return (
      <Card>
        <h2 className="text-base font-bold">The database is not set up yet</h2>
        <p className="mt-2 text-sm">
          Open <code>supabase/setup.sql</code>, copy everything into Supabase (SQL Editor, New query), and press Run. Then reload this page.
        </p>
      </Card>
    );
  }
  return (
    <Card>
      <h2 className="text-base font-bold">This page could not load</h2>
      <p className="mt-2 text-sm text-muted">Please reload. If it keeps happening, tell the website team.</p>
    </Card>
  );
}
