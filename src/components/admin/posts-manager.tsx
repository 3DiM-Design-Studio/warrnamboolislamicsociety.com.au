"use client";

import { useMemo, useState } from "react";
import { deletePost, savePost } from "@/lib/actions/posts";
import type { PostRow } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { fmtDate, melbourneDay } from "@/components/admin/format";
import { Avatar, List, Row } from "@/components/admin/list";
import { Pager, SearchBox, filterClass, matchesSearch, paginate } from "@/components/admin/list-controls";
import { PhotoField } from "@/components/admin/photo-field";
import { RichEditor } from "@/components/admin/rich-editor";
import { Badge, Button, Card, CardHead, ConfirmDialog, EmptyNote, Modal, ModalActions, Switch, TextField, useFormAction, useRunAction } from "@/components/admin/ui";

const SORTS = {
  first: "Shown first, then newest",
  newest: "Newest posted",
  oldest: "Oldest posted",
  created: "Recently created",
  edited: "Recently edited",
  title: "Title (A–Z)",
} as const;
type SortKey = keyof typeof SORTS;

const NO_AUTHOR = "__none";

const compare: Record<SortKey, (a: PostRow, b: PostRow) => number> = {
  first: (a, b) => Number(b.pinned) - Number(a.pinned) || b.post_date.localeCompare(a.post_date),
  newest: (a, b) => b.post_date.localeCompare(a.post_date),
  oldest: (a, b) => a.post_date.localeCompare(b.post_date),
  created: (a, b) => b.created_at.localeCompare(a.created_at),
  edited: (a, b) => b.updated_at.localeCompare(a.updated_at),
  title: (a, b) => a.title.localeCompare(b.title),
};

export function PostsManager({ posts, today }: { posts: PostRow[]; today: string }) {
  const [editing, setEditing] = useState<PostRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<PostRow | null>(null);
  const { run, pending } = useRunAction();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [author, setAuthor] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [firstOnly, setFirstOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("first");
  const [page, setPage] = useState(1);

  // Any change to the search or a filter starts again from page 1.
  const change = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const authors = useMemo(() => [...new Set(posts.map((p) => p.author).filter(Boolean))].sort(), [posts]);
  const hasUnknownAuthor = posts.some((p) => !p.author);

  const shown = posts
    .filter(
      (p) =>
        matchesSearch(query, p.title, p.excerpt, p.author) &&
        (status === "all" || p.status === status) &&
        (!author || (author === NO_AUTHOR ? !p.author : p.author === author)) &&
        (!from || p.post_date >= from) &&
        (!to || p.post_date <= to) &&
        (!firstOnly || p.pinned),
    )
    .sort(compare[sort]);
  const pg = paginate(shown, page);

  const filtering = query !== "" || status !== "all" || author !== "" || from !== "" || to !== "" || firstOnly;
  const clear = () =>
    change(() => {
      setQuery("");
      setStatus("all");
      setAuthor("");
      setFrom("");
      setTo("");
      setFirstOnly(false);
    });

  return (
    <>
      <Card>
        <CardHead title="All posts">
          <Button variant="primary" onClick={() => setEditing("new")}>
            <Icon name="plus" size={16} />
            New post
          </Button>
        </CardHead>

        {posts.length > 0 && (
          <div className="mb-4 grid gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <SearchBox value={query} onChange={(v) => change(() => setQuery(v))} placeholder="Search posts" />
              <select aria-label="Show posts" value={status} onChange={(e) => change(() => setStatus(e.target.value as typeof status))} className={filterClass}>
                <option value="all">All posts</option>
                <option value="published">On website</option>
                <option value="draft">Drafts</option>
              </select>
              {authors.length > 0 && (
                <select aria-label="Written by" value={author} onChange={(e) => change(() => setAuthor(e.target.value))} className={filterClass}>
                  <option value="">All authors</option>
                  {authors.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                  {hasUnknownAuthor && <option value={NO_AUTHOR}>Not recorded</option>}
                </select>
              )}
              <select aria-label="Sort posts" value={sort} onChange={(e) => change(() => setSort(e.target.value as SortKey))} className={filterClass}>
                {Object.entries(SORTS).map(([k, label]) => (
                  <option key={k} value={k}>
                    Sort: {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <label className="flex items-center gap-2 font-semibold">
                Posted from
                <input type="date" value={from} max={to || undefined} onChange={(e) => change(() => setFrom(e.target.value))} className={filterClass} />
              </label>
              <label className="flex items-center gap-2 font-semibold">
                to
                <input type="date" value={to} min={from || undefined} onChange={(e) => change(() => setTo(e.target.value))} className={filterClass} />
              </label>
              <Switch label="Shown first only" checked={firstOnly} onChange={(e) => change(() => setFirstOnly(e.target.checked))} />
              {filtering && (
                <Button small onClick={clear}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <EmptyNote>No posts yet. Press &ldquo;New post&rdquo; to write the first one.</EmptyNote>
        ) : shown.length === 0 ? (
          <EmptyNote>No posts match. Try a different search or press &ldquo;Clear filters&rdquo;.</EmptyNote>
        ) : (
          <>
            <List>
              {pg.rows.map((p) => (
                <Row
                  key={p.id}
                  lead={
                    <span className="flex items-center gap-3.5">
                      <Avatar name={p.title} photo={p.photo_url} />
                      {p.title}
                    </span>
                  }
                  actions={
                    <>
                      <Button small onClick={() => setEditing(p)}>
                        Edit
                      </Button>
                      <Button small variant="danger" onClick={() => setDeleting(p)}>
                        Delete
                      </Button>
                    </>
                  }
                >
                  <span className="pl-[58px] max-sm:pl-0">Posted {fmtDate(p.post_date)}</span>
                  <span>&middot; Created {fmtDate(melbourneDay(p.created_at))}</span>
                  {p.author && <span>&middot; By {p.author}</span>}
                  {p.status === "published" ? <Badge tone="green">On website</Badge> : <Badge>Draft</Badge>}
                  {p.pinned && <Badge tone="gold">Shown first</Badge>}
                </Row>
              ))}
            </List>
            <Pager {...pg} onPage={setPage} />
          </>
        )}
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "New post" : "Edit post"}>
        {editing && <PostForm key={editing === "new" ? "new" : editing.id} post={editing === "new" ? null : editing} today={today} onClose={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        pending={pending}
        message={deleting ? `Delete "${deleting.title}"? This cannot be undone.` : ""}
        onConfirm={() => deleting && run(() => deletePost(deleting.id), () => setDeleting(null))}
      />
    </>
  );
}

function PostForm({ post, today, onClose }: { post: PostRow | null; today: string; onClose: () => void }) {
  const { state, formAction, pending } = useFormAction(savePost, onClose);
  const e = state?.errors ?? {};
  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <TextField label="Title" name="title" defaultValue={post?.title ?? ""} error={e.title} required />
      <TextField label="Short summary" name="excerpt" defaultValue={post?.excerpt ?? ""} error={e.excerpt} hint="One or two sentences shown on the home page." />
      <RichEditor name="body" defaultValue={post?.body ?? ""} error={e.body} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Date" name="post_date" type="date" defaultValue={post?.post_date ?? today} error={e.post_date} required />
        <PhotoField defaultValue={post?.photo_url} label="Photo" />
      </div>
      <Switch label="Show on the website" name="published" defaultChecked={post ? post.status === "published" : true} />
      <Switch label="Show this post first (up to 2)" name="pinned" defaultChecked={post?.pinned ?? false} />
      <ModalActions onCancel={onClose} pending={pending} message={state && !state.ok ? state.message : undefined} />
    </form>
  );
}
