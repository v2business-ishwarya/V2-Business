import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
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
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.getAdminUsers(),
  });

  const users: any[] = (data as any)?.data ?? (Array.isArray(data) ? data : []);

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.updateAdminUser(userId, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update user"),
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading users…</div>;
  if (users.length === 0) return <EmptyState title="No users yet" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">User & Customer Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage accounts and platform roles</p>
      </div>

      <div className="space-y-2">
        {users.map((u) => {
          const isAdmin = u.role === "ADMIN";
          const isVendor = u.role === "VENDOR";

          return (
            <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-medium">{u.name || u.email}</p>
                <p className="text-xs text-muted-foreground">
                  {u.email} • Joined {new Date(u.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={isAdmin ? "default" : isVendor ? "secondary" : "outline"}
                  className="capitalize"
                >
                  {u.role}
                </Badge>
                {!isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "ADMIN" })}
                    disabled={updateRoleMutation.isPending}
                  >
                    Make Admin
                  </Button>
                )}
                {isAdmin && u.email !== "admin@example.com" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "CUSTOMER" })}
                    disabled={updateRoleMutation.isPending}
                  >
                    Remove Admin
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
