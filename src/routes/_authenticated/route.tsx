import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const token = localStorage.getItem("accessToken");
    const rawUser = localStorage.getItem("user");
    if (!token || !rawUser) throw redirect({ to: "/auth", search: { redirect: location.href } });
    return { user: JSON.parse(rawUser) };
  },
  component: () => <Outlet />,
});
