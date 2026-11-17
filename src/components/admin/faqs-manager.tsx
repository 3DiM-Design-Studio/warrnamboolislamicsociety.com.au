"use client";

import { useState } from "react";
import { deleteFaq, moveFaq, saveFaq } from "@/lib/actions/faqs";
import { FAQ_PAGES, type FaqPage } from "@/content/faqs";
import type { FaqRow } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { List, Row } from "@/components/admin/list";
import { Button, Card, CardHead, ConfirmDialog, EmptyNote, Field, Modal, ModalActions, TextField, inputClass, useFormAction, useRunAction } from "@/components/admin/ui";

export function FaqsManager({ faqs }: { faqs: FaqRow[] }) {
  const [editing, setEditing] = useState<{ faq: FaqRow | null; page: FaqPage } | null>(null);
  const [deleting, setDeleting] = useState<FaqRow | null>(null);
  const { run, pending } = useRunAction();

  return (
    <>
      <Card>
        <CardHead title="Frequently asked questions" />
        <p className="-mt-2 mb-5 text-[13px] text-muted">Each page shows its own questions, in this order. Changes show on the website straight away.</p>
        <div className="grid gap-8">
          {FAQ_PAGES.map((p) => {
            const list = faqs.filter((f) => f.page === p.key);
            return (
              <section key={p.key}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-[15px] font-bold">{p.label}</h3>
                  <Button small variant="primary" onClick={() => setEditing({ faq: null, page: p.key })}>
                    <Icon name="plus" size={14} />
                    Add question
                  </Button>
                </div>
                {list.length === 0 ? (
                  <EmptyNote>No questions here. This section is hidden on the website until you add one.</EmptyNote>
                ) : (
                  <List>
                    {list.map((f, i) => (
                      <Row
                        key={f.id}
                        lead={f.question}
                        actions={
                          <>
                            <Button small aria-label="Move up" disabled={pending || i === 0} onClick={() => run(() => moveFaq(f.id, -1))}>
                              <Icon name="up" size={14} />
                            </Button>
                            <Button small aria-label="Move down" disabled={pending || i === list.length - 1} onClick={() => run(() => moveFaq(f.id, 1))}>
                              <Icon name="down" size={14} />
                            </Button>
                            <Button small onClick={() => setEditing({ faq: f, page: p.key })}>
                              Edit
                            </Button>
                            <Button small variant="danger" onClick={() => setDeleting(f)}>
                              Delete
                            </Button>
                          </>
                        }
                      >
                        <span className="line-clamp-2 basis-full">{f.answer}</span>
                      </Row>
                    ))}
                  </List>
                )}
              </section>
            );
          })}
        </div>
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing?.faq ? "Edit question" : "Add question"}>
        {editing && <FaqForm key={editing.faq?.id ?? `new-${editing.page}`} faq={editing.faq} page={editing.page} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        pending={pending}
        message={deleting ? `Delete the question "${deleting.question}"? This cannot be undone.` : ""}
        onConfirm={() => deleting && run(() => deleteFaq(deleting.id), () => setDeleting(null))}
      />
    </>
  );
}

function FaqForm({ faq, page, onClose }: { faq: FaqRow | null; page: FaqPage; onClose: () => void }) {
  const { state, formAction, pending } = useFormAction(saveFaq, onClose);
  const e = state?.errors ?? {};
  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={faq?.id ?? ""} />
      <input type="hidden" name="page" value={faq?.page ?? page} />
      <TextField label="Question" name="question" defaultValue={faq?.question ?? ""} error={e.question} maxLength={300} placeholder="For example: Who can attend?" required />
      <Field label="Answer" error={e.answer}>
        <textarea name="answer" rows={5} defaultValue={faq?.answer ?? ""} maxLength={2000} className={inputClass} required />
      </Field>
      <ModalActions onCancel={onClose} pending={pending} message={state && !state.ok && !state.errors ? state.message : undefined} />
    </form>
  );
}
