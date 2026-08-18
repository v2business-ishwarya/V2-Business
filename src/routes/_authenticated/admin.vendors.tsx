import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  const { data = [] } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async () =>
      (await supabase.from("vendors").select("*").order("created_at", { ascending: false })).data ??
      [],
  });
  const update = async (id: string, status: "approved" | "pending" | "suspended") => {
    const { error } = await supabase.from("vendors").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-vendors"] });
    toast.success("Vendor updated");
  };
  if (data.length === 0)
    return <EmptyState title="No vendors" description="Vendor applications will appear here." />;
  return (
    <div className="space-y-2">
      {data.map((v) => (
        <Card key={v.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <Link
              to="/store/$slug"
              params={{ slug: v.slug }}
              className="font-medium hover:text-primary"
            >
              {v.name}
            </Link>
            <div className="text-xs text-muted-foreground">
              {v.email ?? "—"} · {new Date(v.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {v.status}
            </Badge>
            {v.status !== "approved" && (
              <Button size="sm" onClick={() => update(v.id, "approved")}>
                Approve
              </Button>
            )}
            {v.status !== "suspended" && (
              <Button size="sm" variant="outline" onClick={() => update(v.id, "suspended")}>
                Suspend
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
