import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ id, label, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="field" htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} {...props} />
    </label>
  );
}
