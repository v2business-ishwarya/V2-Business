import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const rolesByUser: Record<string, string[]> = {};
      (roles ?? []).forEach((r) => {
        rolesByUser[r.user_id] = [...(rolesByUser[r.user_id] ?? []), r.role];
      });
      return (profiles ?? []).map((p) => ({ ...p, roles: rolesByUser[p.id] ?? ["customer"] }));
    },
  });
  const toggleAdmin = async (userId: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      if (error) return toast.error(error.message);
    } else {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };
  if (data.length === 0) return <EmptyState title="No users yet" />;
  return (
    <div className="space-y-2">
      {data.map((u) => {
        const isAdmin = u.roles.includes("admin");
        return (
          <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium">{u.full_name ?? "Unnamed"}</p>
              <p className="text-xs text-muted-foreground">
                Joined {new Date(u.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {u.roles.map((r) => (
                <Badge key={r} variant="outline" className="capitalize">
                  {r}
                </Badge>
              ))}
              <Button
                size="sm"
                variant={isAdmin ? "outline" : "default"}
                onClick={() => toggleAdmin(u.id, !isAdmin)}
              >
                {isAdmin ? "Revoke admin" : "Make admin"}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
