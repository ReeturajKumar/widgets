import * as React from "react";

export function Card({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`flex flex-col h-full w-full rounded-lg bg-white text-zinc-950 ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`flex flex-col items-center justify-center shrink-0 p-2 pb-0 text-center ${className}`}
      {...props}
    />
  );
}

export function CardTitle({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`font-semibold leading-tight text-zinc-800 ${className}`}
      {...props}
    />
  );
}

export function CardDescription({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`leading-tight text-zinc-500 ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`flex-1 min-h-0 w-full p-1 ${className}`}
      {...props}
    />
  );
}

export function CardFooter({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`flex flex-col shrink-0 items-center justify-center p-1.5 pt-0 text-[10px] text-zinc-500 text-center leading-tight ${className}`}
      {...props}
    />
  );
}
