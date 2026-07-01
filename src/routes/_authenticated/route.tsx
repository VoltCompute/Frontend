import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMe } from "@/api/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (!localStorage.getItem("auth_token")) {
      throw redirect({ to: "/auth" });
    }
    // Vérifie que le token est encore valide côté serveur (pas juste présent
    // en localStorage) et rafraîchit l'utilisateur en cache au passage.
    try {
      await getMe();
    } catch {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
