import { Camera, Users } from "lucide-react";
import { Suspense } from "react";
import { GalleryGrid } from "@/components/gallery-grid";
import { PageShell } from "@/components/page-shell";
import { CardsSkeleton } from "@/components/skeletons";
import { getGallery } from "@/lib/content";

export const metadata = {
  title: "Gallery",
  description: "Photos from Warrnambool Islamic Society: Friday prayers, iftar, Eid, lectures and community gatherings.",
};

async function Photos() {
  const photos = await getGallery();
  return <GalleryGrid photos={photos} />;
}

export default function Gallery() {
  return (
    <PageShell
      title="Moments from our community."
      crumb="Gallery"
      highlight="our community"
      icons={{
        moments: <Camera className="size-[0.75em]" aria-hidden />,
        community: <Users className="size-[0.75em]" aria-hidden />,
      }}
      intro="Friday prayers, iftar, Eid, lectures and gatherings at Warrnambool Islamic Society."
    >
      <Suspense fallback={<CardsSkeleton kind="post" count={6} label="Loading photos" />}>
        <Photos />
      </Suspense>
    </PageShell>
  );
}
