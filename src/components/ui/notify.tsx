import * as React from "react";
import { toast as sonnerToast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NotifyVariant = "success" | "error" | "warning" | "info";

const DEFAULT_DURATION = 5000;

const VARIANT_CONFIG: Record<
  NotifyVariant,
  { icon: typeof CheckCircle2; textClassName: string; iconWrapClassName: string; barClassName: string }
> = {
  success: {
    icon: CheckCircle2,
    textClassName: "text-success",
    iconWrapClassName: "bg-success/10 text-success",
    barClassName: "bg-success",
  },
  error: {
    icon: XCircle,
    textClassName: "text-destructive",
    iconWrapClassName: "bg-destructive/10 text-destructive",
    barClassName: "bg-destructive",
  },
  warning: {
    icon: AlertTriangle,
    textClassName: "text-tertiary",
    iconWrapClassName: "bg-tertiary/10 text-tertiary",
    barClassName: "bg-tertiary",
  },
  info: {
    icon: Info,
    textClassName: "text-primary",
    iconWrapClassName: "bg-primary/10 text-primary",
    barClassName: "bg-primary",
  },
};

function NotifyToast({
  id,
  variant,
  message,
  duration,
}: {
  id: string | number;
  variant: NotifyVariant;
  message: string;
  duration: number;
}) {
  const { icon: Icon, textClassName, iconWrapClassName, barClassName } = VARIANT_CONFIG[variant];

  return (
    <div
      className={cn(
        "relative flex w-[720px] max-w-[99vw] items-center gap-5 overflow-hidden rounded-3xl border border-border/40 bg-card px-8 py-7 shadow-2xl",
        "animate-in fade-in slide-in-from-top-4 duration-300",
      )}
    >
      <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-full", iconWrapClassName)}>
        <Icon className="size-10" strokeWidth={2.25} />
      </span>
      <p className={cn("flex-1 text-3xl font-medium leading-snug", textClassName)}>{message}</p>
      <button
        onClick={() => sonnerToast.dismiss(id)}
        className="shrink-0 rounded-full p-2 text-muted-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
        aria-label="Fermer"
      >
        <X className="size-5" />
      </button>
      <span
        key={id}
        className={cn("absolute inset-x-0 bottom-0 h-1.5 origin-left", barClassName)}
        style={{
          animation: `notify-progress ${duration}ms linear forwards`,
        }}
      />
    </div>
  );
}

function show(variant: NotifyVariant, message: string, duration = DEFAULT_DURATION) {
  return sonnerToast.custom(
    (id) => <NotifyToast id={id} variant={variant} message={message} duration={duration} />,
    { duration },
  );
}

export const notify = {
  success: (message: string, duration?: number) => show("success", message, duration),
  error: (message: string, duration?: number) => show("error", message, duration),
  warning: (message: string, duration?: number) => show("warning", message, duration),
  info: (message: string, duration?: number) => show("info", message, duration),
};
