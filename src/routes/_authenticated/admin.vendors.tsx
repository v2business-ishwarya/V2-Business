import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/vendors")({
  component: AdminVendors,
});

function AdminVendors() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: () => api.getAdminUsers({ role: "VENDOR" }),
  });

  const vendors: any[] = (data as any)?.data ?? (Array.isArray(data) ? data : []);

  const updateMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.updateAdminUser(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vendors"] });
      toast.success("Vendor status updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update vendor"),
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading vendors…</div>;
  if (vendors.length === 0)
    return <EmptyState title="No vendors" description="Vendor accounts will appear here." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Vendor Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and approve marketplace sellers</p>
      </div>

      <div className="space-y-2">
        {vendors.map((v) => (
          <Card key={v.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium">{v.name || v.email}</p>
              <div className="text-xs text-muted-foreground">
                {v.email ?? "—"} · Joined {new Date(v.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={v.isActive ? "default" : "secondary"}>
                {v.isActive ? "Active" : "Suspended"}
              </Badge>
              {!v.isActive && (
                <Button
                  size="sm"
                  onClick={() => updateMutation.mutate({ id: v.id, isActive: true })}
                  disabled={updateMutation.isPending}
                >
                  Approve / Activate
                </Button>
              )}
              {v.isActive && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateMutation.mutate({ id: v.id, isActive: false })}
                  disabled={updateMutation.isPending}
                >
                  Suspend
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
