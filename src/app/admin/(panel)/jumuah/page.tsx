import { redirect } from "next/navigation";

// Jumu’ah times now live on the Prayer times page. This keeps old bookmarks and links working.
export default function JumuahPage() {
  redirect("/admin/prayer");
}
