"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";

type ClearLogsButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  level: string;
  disabled?: boolean;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Limpando eventos..." : "Limpar todos os eventos"}
    </button>
  );
}

export function ClearLogsButton({
  action,
  level,
  disabled = false,
}: ClearLogsButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        const confirmed = window.confirm(
          "Tem certeza que deseja apagar todos os eventos registrados? Essa ação não pode ser desfeita.",
        );

        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="level" value={level} />
      <SubmitButton disabled={disabled} />
    </form>
  );
}
