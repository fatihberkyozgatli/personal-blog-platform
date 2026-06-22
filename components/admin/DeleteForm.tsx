"use client";

import { useRef, useState } from "react";
import { ConfirmModal } from "./ConfirmModal";

export function DeleteForm({
  action,
  id,
  label,
  title = "Delete this item?",
  message = "This action cannot be undone.",
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label: string;
  title?: string;
  message?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form action={action} ref={formRef}>
      <input type="hidden" name="id" value={id} />
      <button type="button" aria-label={label} onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <ConfirmModal
        open={open}
        title={title}
        message={message}
        confirmLabel="Delete"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
    </form>
  );
}
