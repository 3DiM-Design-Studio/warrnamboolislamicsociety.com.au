"use client";

import { useState } from "react";
import { deleteMessage, setReplied } from "@/lib/actions/messages";
import type { ContactRow } from "@/lib/types";
import { fmtDate } from "@/components/admin/format";
import { Avatar, List, Row } from "@/components/admin/list";
import { Pager, SearchBox, filterClass, matchesSearch, paginate } from "@/components/admin/list-controls";
import { Badge, Button, Card, CardHead, ConfirmDialog, EmptyNote, Modal, cx, useRunAction } from "@/components/admin/ui";

export function MessagesManager({ messages }: { messages: ContactRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "new" | "replied">("all");
  const [oldestFirst, setOldestFirst] = useState(false);
  const [page, setPage] = useState(1);
  const [reading, setReading] = useState<ContactRow | null>(null);
  const [deleting, setDeleting] = useState<ContactRow | null>(null);
  const { run, pending } = useRunAction();

  // Any change to the search or a filter starts again from page 1.
  const change = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const fresh = messages.filter((m) => m.status === "new").length;
  const shown = messages
    .filter((m) => (status === "all" || m.status === status) && matchesSearch(query, m.name, m.email, m.message))
    .sort((a, b) => (oldestFirst ? a.submitted_date.localeCompare(b.submitted_date) : b.submitted_date.localeCompare(a.submitted_date)));
  const pg = paginate(shown, page);
  const filtering = query !== "" || status !== "all";

  // The message being read, kept in step with the list so its status button updates after a click.
  const open = reading ? (messages.find((m) => m.id === reading.id) ?? reading) : null;

  return (
    <>
      <Card>
        <CardHead title="Contact messages">
          {fresh > 0 && <Badge tone="gold">{fresh} new</Badge>}
        </CardHead>
        <p className="mb-4 text-[13px] text-muted">Messages sent from the website&rsquo;s Contact page appear here.</p>

        {messages.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchBox value={query} onChange={(v) => change(() => setQuery(v))} placeholder="Search messages" />
            <select aria-label="Show messages" value={status} onChange={(e) => change(() => setStatus(e.target.value as typeof status))} className={filterClass}>
              <option value="all">All ({messages.length})</option>
              <option value="new">New ({fresh})</option>
              <option value="replied">Replied ({messages.length - fresh})</option>
            </select>
            <select aria-label="Sort messages" value={oldestFirst ? "oldest" : "newest"} onChange={(e) => change(() => setOldestFirst(e.target.value === "oldest"))} className={filterClass}>
              <option value="newest">Sort: Newest first</option>
              <option value="oldest">Sort: Oldest first</option>
            </select>
            {filtering && (
              <Button
                small
                onClick={() =>
                  change(() => {
                    setQuery("");
                    setStatus("all");
                  })
                }
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {messages.length === 0 ? (
          <EmptyNote>No messages yet. When someone uses the Contact page, their message shows up here.</EmptyNote>
        ) : shown.length === 0 ? (
          <EmptyNote>No messages match. Try a different search or press &ldquo;Clear filters&rdquo;.</EmptyNote>
        ) : (
          <>
            <List>
              {pg.rows.map((m) => (
                <Row
                  key={m.id}
                  lead={
                    <span className="flex items-center gap-3.5">
                      <Avatar name={m.name} round />
                      <span className={cx(m.status === "new" ? "font-bold" : "font-semibold")}>
                        {m.name} {m.status === "new" ? <Badge tone="gold">New</Badge> : <Badge tone="green">Replied</Badge>}
                      </span>
                    </span>
                  }
                  actions={
                    <>
                      <Button small variant="primary" onClick={() => setReading(m)}>
                        Read
                      </Button>
                      <Button small variant="danger" onClick={() => setDeleting(m)}>
                        Delete
                      </Button>
                    </>
                  }
                >
                  <span className="pl-[58px] max-sm:pl-0">
                    {m.email} &middot; {fmtDate(m.submitted_date.slice(0, 10))}
                  </span>
                  <span className="line-clamp-2 basis-full whitespace-pre-line pl-[58px] max-sm:pl-0">{m.message}</span>
                </Row>
              ))}
            </List>
            <Pager {...pg} onPage={setPage} />
          </>
        )}
      </Card>

      <Modal open={open !== null} onClose={() => setReading(null)} title={open ? `Message from ${open.name}` : "Message"}>
        {open && (
          <div className="grid gap-4">
            <div className="grid gap-1 text-sm">
              <span>
                <span className="font-semibold">Email:</span> <span className="select-all break-all">{open.email}</span>
              </span>
              <span className="text-muted">Sent {fmtDate(open.submitted_date.slice(0, 10), true)}</span>
            </div>
            <p className="max-h-[50dvh] overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-background p-4 text-[15px]" data-lenis-prevent>
              {open.message}
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button onClick={() => setReading(null)}>Close</Button>
              <Button disabled={pending} onClick={() => run(() => setReplied(open.id, open.status !== "replied"))}>
                {open.status === "replied" ? "Mark as new" : "Mark as replied"}
              </Button>
              <a
                href={`mailto:${open.email}?subject=${encodeURIComponent("Re: your message to Warrnambool Islamic Society")}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-brand-dark transition hover:brightness-95"
              >
                Reply by email
              </a>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        pending={pending}
        message={deleting ? `Delete the message from ${deleting.name}? This cannot be undone.` : ""}
        onConfirm={() => deleting && run(() => deleteMessage(deleting.id), () => setDeleting(null))}
      />
    </>
  );
}
