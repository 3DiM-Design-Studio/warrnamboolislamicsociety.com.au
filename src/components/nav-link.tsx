"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useSyncExternalStore, type ComponentProps } from "react";

const noSubscribe = () => () => {};

/** True when `href` is the page the visitor is on, or a page inside it (a news story counts as News). */
export function isCurrent(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}

function Active(props: ComponentProps<typeof Link>) {
  const routerPath = usePathname();
  // The browser's own address is always right, even where the page's first HTML was made without it.
  const path = useSyncExternalStore(noSubscribe, () => window.location.pathname, () => routerPath);
  return <Link {...props} aria-current={isCurrent(path, String(props.href)) ? "page" : undefined} />;
}

// A link that stays underlined (see .link-fx in globals.css) while its page is open.
export function NavLink(props: ComponentProps<typeof Link>) {
  return (
    <Suspense fallback={<Link {...props} />}>
      <Active {...props} />
    </Suspense>
  );
}
