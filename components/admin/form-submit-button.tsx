"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  name?: string;
  value?: string;
  style?: React.CSSProperties;
};

export function FormSubmitButton({
  children,
  pendingText,
  className,
  name,
  value,
  style
}: FormSubmitButtonProps) {
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
    >
      {pending ? pendingText ?? "Working..." : children}
    </button>
  );
}
