import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { getHomeGallery } from "@/lib/content";
import { albumLabel, photoLabel } from "@/lib/gallery";

// Where each photo sits in the block. On a phone the first photo is wide and the rest are squares (a last odd one is wide too).
// From a laptop up it is a block of 4 columns by 2 rows, shaped to the number of photos so there are never gaps.
function tileClass(count: number, i: number) {
  const phone = i === 0 || (i === count - 1 && (count - 1) % 2 === 1) ? "col-span-2 aspect-[16/10]" : "aspect-square";
  const desktop: string[][] = [
    ["lg:col-span-4 lg:row-span-2"], // 1 photo
    ["lg:col-span-2 lg:row-span-2", "lg:col-span-2 lg:row-span-2"], // 2
    ["lg:col-span-2 lg:row-span-2", "lg:col-span-2 lg:row-span-1", "lg:col-span-2 lg:row-span-1"], // 3
    ["lg:col-span-2 lg:row-span-2", "lg:col-span-2 lg:row-span-1", "lg:col-span-1 lg:row-span-1", "lg:col-span-1 lg:row-span-1"], // 4
    ["lg:col-span-2 lg:row-span-2", "lg:col-span-1 lg:row-span-1", "lg:col-span-1 lg:row-span-1", "lg:col-span-1 lg:row-span-1", "lg:col-span-1 lg:row-span-1"], // 5
  ];
  return `${phone} lg:aspect-auto ${desktop[count - 1][i]}`;
}

/** Home page: 1 to 5 photos in a bento block with a button to the full Gallery. Shows nothing until there is a photo. */
export async function HomeGallery() {
  const photos = await getHomeGallery();
  if (photos.length === 0) return null;
  return (
    <section aria-labelledby="home-gallery" className="mt-16">
      <SectionHeading id="home-gallery" title="Our community in pictures" href="/gallery" label="See all photos" />
      <ul className="mt-8 grid grid-cols-2 gap-3 lg:h-[34rem] lg:grid-cols-4 lg:grid-rows-2">
        {photos.map((p, i) => (
          <li key={p.id} className={tileClass(photos.length, i)}>
            <Link href={`/gallery#p-${p.id}`} className="group relative block size-full overflow-hidden rounded-2xl bg-card" aria-label={`View photo: ${photoLabel(p)}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i === 0 ? p.photo_url : p.thumb_url} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
              <span className="absolute inset-0 flex items-end bg-black/60 p-3.5 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="grid gap-0.5">
                  <span className="line-clamp-4 text-sm font-semibold leading-snug">{p.caption || albumLabel(p.album)}</span>
                  {p.caption && <span className="text-xs text-white/70">{albumLabel(p.album)}</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
