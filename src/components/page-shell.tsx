export function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      {intro && <p className="mt-3 text-lg text-muted">{intro}</p>}
      <div className="mt-8 space-y-4 leading-relaxed">{children}</div>
    </div>
  );
}
