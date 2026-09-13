import React, { type ReactNode } from "react";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode | { label: string; onClick?: () => void };
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-border bg-surface-muted/60 p-10 text-center ${className}`}
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface text-muted-foreground shadow-soft">
        {icon ?? <PackageOpen className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <div className="mt-5 flex justify-center">
          {React.isValidElement(action) ? (
            action
          ) : typeof action === "object" && action !== null && "label" in action ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(action as any).onClick}
              className="rounded-xl font-semibold text-xs"
            >
              {(action as any).label}
            </Button>
          ) : (
            (action as ReactNode)
          )}
        </div>
      )}
    </div>
  );
}
