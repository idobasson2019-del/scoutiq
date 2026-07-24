import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, dir, ...props }, ref) => {
    // Free-text inputs follow their content's direction; numeric/date/time
    // inputs keep the browser default so their widgets stay laid out correctly.
    const isText = !type || ["text", "search", "email", "url", "password"].includes(type);
    return (
      <input
        type={type}
        ref={ref}
        dir={dir ?? (isText ? "auto" : undefined)}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          isText && "bidi-plaintext",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
