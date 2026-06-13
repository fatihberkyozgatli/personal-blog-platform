import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

/**
 * The schema-contributing extension set. The editor (admin) and the read-only
 * renderer (public) MUST share this exact set, or content renders differently
 * than it was authored. See CLAUDE.md "Tiptap extension parity".
 */
export const contentExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
  }),
  Image.configure({ inline: false, allowBase64: false }),
  Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
];
