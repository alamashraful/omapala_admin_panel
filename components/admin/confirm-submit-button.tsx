"use client";

import { useFormStatus } from "react-dom";

type ConfirmSubmitButtonProps = {
  children: React.ReactNode;
  confirmMessage: string;
  pendingText?: string;
  className?: string;
  name?: string;
  value?: string;
  style?: React.CSSProperties;
};

export function ConfirmSubmitButton({
  children,
  confirmMessage,
  pendingText,
  className,
  name,
  value,
  style
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      name={name}
      value={value}
      disabled={pending}
      aria-disabled={pending}
      style={{
        ...style,
        ...(pending ? { opacity: 0.7, cursor: "progress" } : {})
      }}
      onClick={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }

        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? pendingText ?? "Working..." : children}
    </button>
  );
}
