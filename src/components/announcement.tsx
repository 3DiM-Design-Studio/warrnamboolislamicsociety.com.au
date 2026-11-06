import { getSettings } from "@/lib/content";

// Optional message bar at the very top of every page. The committee turns it on and edits it in the admin.
export async function Announcement() {
  const s = await getSettings();
  if (!s.banner_on || !s.banner_text.trim()) return null;
  return (
    <div className="bg-brand-gradient px-4 py-2 text-center text-sm font-medium text-brand-dark">
      {s.banner_text}
    </div>
  );
}
