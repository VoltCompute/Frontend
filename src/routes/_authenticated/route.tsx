import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    if (!localStorage.getItem("auth_token")) {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
