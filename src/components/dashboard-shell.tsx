import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";

export function DashboardShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: { to: string; label: string; icon?: ReactNode }[];
  children?: ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="overflow-x-auto rounded-2xl border border-border bg-surface p-3 lg:overflow-visible">
          <nav className="flex min-w-max gap-1 text-sm lg:min-w-0 lg:flex-col">
            {nav.map((n) => {
              const active = path === n.to || path.startsWith(n.to + "/");
              return (
                <Link
                  key={n.to}
                  to={n.to as any}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${active ? "bg-primary-soft font-medium text-primary" : "hover:bg-surface-muted"}`}
                >
                  {n.icon}
                  <span className="truncate">{n.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">{children ?? <Outlet />}</div>
      </div>
    </div>
  );
}
