'use client'

import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { Color } from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
} from 'lucide-react'
import { FontSize } from '@/lib/tiptap-font-size'
import { EMAIL_FONT_FAMILIES, EMAIL_FONT_SIZES } from '@/lib/email-templates'
import { cn } from '@/lib/utils'

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  ...EMAIL_FONT_FAMILIES,
]

const FONT_SIZES = [
  { label: 'Size', value: '' },
  ...EMAIL_FONT_SIZES,
]

type EmailHtmlEditorProps = {
  value: string
  onChange: (html: string) => void
  className?: string
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded border text-ink transition',
        active
          ? 'border-brand bg-brand-light text-brand-dark'
          : 'border-transparent hover:border-border hover:bg-surface-raised',
        disabled && 'opacity-40'
      )}
    >
      {children}
    </button>
  )
}

export function EmailHtmlEditor({
  value,
  onChange,
  className,
}: EmailHtmlEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: 'color:#1a6b3c;text-decoration:underline',
        },
      }),
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'email-html-editor min-h-[220px] px-3 py-2 text-sm leading-snug text-ink outline-none max-w-none [&_p]:m-0 [&_p]:mb-1.5 [&_h1]:mt-2 [&_h1]:mb-1.5 [&_h2]:mt-2 [&_h2]:mb-1.5 [&_h3]:mt-2 [&_h3]:mb-1.5 [&_ul]:my-1 [&_ol]:my-1',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
    }
    // Only sync when parent value changes externally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  if (!editor) {
    return (
      <div
        className={cn(
          'rounded-md border border-border bg-surface-raised p-4 text-sm text-ink-muted',
          className
        )}
      >
        Loading editor…
      </div>
    )
  }

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', previous || 'https://')
    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  return (
    <div className={cn('overflow-hidden rounded-md border border-border bg-white', className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-raised px-2 py-1.5">
        <ToolbarButton
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-border" />
        <select
          className="h-8 rounded border border-border bg-white px-2 text-xs"
          title="Font family"
          value={editor.getAttributes('textStyle').fontFamily || ''}
          onChange={(e) => {
            const v = e.target.value
            if (!v) editor.chain().focus().unsetFontFamily().run()
            else editor.chain().focus().setFontFamily(v).run()
          }}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          className="h-8 rounded border border-border bg-white px-2 text-xs"
          title="Font size (Outlook points)"
          value={editor.getAttributes('textStyle').fontSize || ''}
          onChange={(e) => {
            const v = e.target.value
            if (!v) editor.chain().focus().unsetFontSize().run()
            else editor.chain().focus().setFontSize(v).run()
          }}
        >
          {FONT_SIZES.map((s) => (
            <option key={s.label + s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <label className="inline-flex h-8 items-center gap-1 rounded border border-transparent px-1 text-xs text-ink-muted hover:border-border">
          Color
          <input
            type="color"
            className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
            value={editor.getAttributes('textStyle').color || '#111111'}
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />
        </label>
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Link"
          active={editor.isActive('link')}
          onClick={setLink}
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <select
          className="ml-1 h-8 rounded border border-border bg-white px-2 text-xs"
          title="Heading"
          value={
            editor.isActive('heading', { level: 1 })
              ? '1'
              : editor.isActive('heading', { level: 2 })
                ? '2'
                : editor.isActive('heading', { level: 3 })
                  ? '3'
                  : 'p'
          }
          onChange={(e) => {
            const v = e.target.value
            if (v === 'p') editor.chain().focus().setParagraph().run()
            else
              editor
                .chain()
                .focus()
                .toggleHeading({ level: Number(v) as 1 | 2 | 3 })
                .run()
          }}
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
