import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/empty-state";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: AdminBanners,
});

function AdminBanners() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    is_active: true,
  });
  const { data = [] } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () =>
      (await supabase.from("banners").select("*").order("sort_order")).data ?? [],
  });
  const add = async () => {
    if (!form.title || !form.image_url) return toast.error("Title and image required");
    const { error } = await supabase.from("banners").insert({
      title: form.title,
      subtitle: form.subtitle || null,
      image_url: form.image_url,
      link_url: form.link_url || null,
      is_active: form.is_active,
    });
    if (error) return toast.error(error.message);
    setForm({ title: "", subtitle: "", image_url: "", link_url: "", is_active: true });
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };
  const toggle = async (id: string, is_active: boolean) => {
    await supabase.from("banners").update({ is_active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };
  const del = async (id: string) => {
    await supabase.from("banners").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Add banner</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Image URL</Label>
            <Input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Link URL</Label>
            <Input
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
            <span className="text-sm">Active</span>
          </div>
        </div>
        <Button className="mt-4" onClick={add}>
          Add banner
        </Button>
      </Card>
      {data.length === 0 ? (
        <EmptyState title="No banners yet" />
      ) : (
        <div className="space-y-2">
          {data.map((b) => (
            <Card key={b.id} className="flex items-center gap-3 p-4">
              <img src={b.image_url} alt="" className="h-16 w-24 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{b.title}</p>
                <p className="text-xs text-muted-foreground truncate">{b.link_url ?? "—"}</p>
              </div>
              <Switch checked={b.is_active} onCheckedChange={(v) => toggle(b.id, v)} />
              <Button variant="ghost" size="icon" onClick={() => del(b.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
