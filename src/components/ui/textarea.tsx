import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, dir = "auto", ...props }, ref) => (
    <textarea
      ref={ref}
      // `dir="auto"` + plaintext bidi: each line keeps its own direction, so
      // mixed Hebrew/English text (e.g. pasted from ChatGPT) isn't reordered.
      dir={dir}
      className={cn(
        "bidi-plaintext flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
