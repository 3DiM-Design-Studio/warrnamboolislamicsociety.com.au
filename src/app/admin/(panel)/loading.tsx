import { AdminPageSkeleton } from "@/components/skeletons";

// Shown inside the admin frame while a page is loading, so the menu stays put.
export default function Loading() {
  return <AdminPageSkeleton />;
}
