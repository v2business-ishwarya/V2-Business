import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { Switch } from "@/components/ui/switch";
import { slugify } from "@/lib/utils-app";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    image_url: "",
    description: "",
    is_featured: false,
  });
  const { data = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () =>
      (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });
  const add = async () => {
    if (!form.name) return toast.error("Name required");
    const { error } = await supabase.from("categories").insert({
      name: form.name,
      slug: form.slug || slugify(form.name),
      image_url: form.image_url || null,
      description: form.description || null,
      is_featured: form.is_featured,
    });
    if (error) return toast.error(error.message);
    setForm({ name: "", slug: "", image_url: "", description: "", is_featured: false });
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    toast.success("Category created");
  };
  const toggle = async (id: string, is_featured: boolean) => {
    await supabase.from("categories").update({ is_featured }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  };
  const del = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  };
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Add category</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: form.slug || slugify(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
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
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_featured}
              onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
            />
            <span className="text-sm">Featured</span>
          </div>
        </div>
        <Button className="mt-4" onClick={add}>
          Create category
        </Button>
      </Card>
      {data.length === 0 ? (
        <EmptyState title="No categories yet" />
      ) : (
        <div className="space-y-2">
          {data.map((c) => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">/{c.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Switch checked={c.is_featured} onCheckedChange={(v) => toggle(c.id, v)} />{" "}
                  Featured
                </div>
                <Button variant="ghost" size="icon" onClick={() => del(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
