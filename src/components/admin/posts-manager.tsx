"use client";

import { useState } from "react";
import { deletePost, savePost } from "@/lib/actions/posts";
import type { PostRow } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { fmtDate } from "@/components/admin/format";
import { Avatar, List, Row } from "@/components/admin/list";
import { PhotoField } from "@/components/admin/photo-field";
import { RichEditor } from "@/components/admin/rich-editor";
import { Badge, Button, Card, CardHead, ConfirmDialog, EmptyNote, Modal, ModalActions, Switch, TextField, useFormAction, useRunAction } from "@/components/admin/ui";

export function PostsManager({ posts, today }: { posts: PostRow[]; today: string }) {
  const [editing, setEditing] = useState<PostRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<PostRow | null>(null);
  const { run, pending } = useRunAction();

  return (
    <>
      <Card>
        <CardHead title="All posts">
          <Button variant="primary" onClick={() => setEditing("new")}>
            <Icon name="plus" size={16} />
            New post
          </Button>
        </CardHead>
        {posts.length === 0 ? (
          <EmptyNote>No posts yet. Press &ldquo;New post&rdquo; to write the first one.</EmptyNote>
        ) : (
          <List>
            {posts.map((p) => (
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
                <span className="pl-[58px] max-sm:pl-0">{fmtDate(p.post_date)}</span>
                {p.status === "published" ? <Badge tone="green">On website</Badge> : <Badge>Draft</Badge>}
                {p.pinned && <Badge tone="gold">Shown first</Badge>}
              </Row>
            ))}
          </List>
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
