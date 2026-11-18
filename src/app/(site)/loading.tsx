import { PageSkeleton } from "@/components/skeletons";

// Shown instantly while any public page is on its way, so the header and footer stay put and nothing blanks out.
export default function Loading() {
  return <PageSkeleton />;
}
