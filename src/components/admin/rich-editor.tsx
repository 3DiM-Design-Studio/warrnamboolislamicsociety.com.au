"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { Button, cx } from "@/components/admin/ui";

/** Simple text box with Bold, Italic and lists. Its HTML goes into a hidden field called `name`. */
export function RichEditor({ name, defaultValue, error }: { name: string; defaultValue: string; error?: string }) {
  const [html, setHtml] = useState(defaultValue);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: false,
      }),
    ],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => setHtml(e.isEmpty ? "" : e.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-40 rounded-xl border border-[#cfd1c7] bg-white px-3.5 py-3 text-[15px] leading-relaxed outline-none focus:border-[#0f8a63] focus:ring-4 focus:ring-[#dcf1e8] [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5",
        "aria-label": "Post text",
      },
    },
  });

  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive("bold") ?? false,
      italic: e?.isActive("italic") ?? false,
      bullet: e?.isActive("bulletList") ?? false,
      ordered: e?.isActive("orderedList") ?? false,
    }),
  });

  return (
    <div className="grid gap-1.5 text-sm">
      <span className="font-semibold">Text</span>
      <div className="flex flex-wrap gap-1.5">
        <Button small className={cx(active?.bold && "!border-brand-dark !bg-brand-dark !text-white")} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <b>B</b>
        </Button>
        <Button small className={cx(active?.italic && "!border-brand-dark !bg-brand-dark !text-white")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <i>I</i>
        </Button>
        <Button small className={cx(active?.bullet && "!border-brand-dark !bg-brand-dark !text-white")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          Bullet list
        </Button>
        <Button small className={cx(active?.ordered && "!border-brand-dark !bg-brand-dark !text-white")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          Numbered list
        </Button>
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
      {error && <span className="text-[13px] text-[#b3261e]">{error}</span>}
    </div>
  );
}
