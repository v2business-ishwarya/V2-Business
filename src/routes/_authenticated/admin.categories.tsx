import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
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
    description: "",
    imageUrl: "",
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: () => api.createCategory(form),
    onSuccess: () => {
      setForm({ name: "", description: "", imageUrl: "" });
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category created");
    },
    onError: (err: any) => toast.error(err.message || "Failed to create category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete category"),
  });

  const categoryList = Array.isArray(categories) ? categories : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Category Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Organize products into store categories</p>
      </div>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Add New Category</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Category Name</Label>
            <Input
              placeholder="e.g. Electronics, Fashion, Home"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Image URL (optional)</Label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Input
              placeholder="Short description of this category"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
        <Button
          className="mt-4"
          onClick={() => {
            if (!form.name.trim()) return toast.error("Category name is required");
            createMutation.mutate();
          }}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Creating…" : "Create Category"}
        </Button>
      </Card>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading categories…</div>
      ) : categoryList.length === 0 ? (
        <EmptyState title="No categories yet" description="Add your first category above." />
      ) : (
        <div className="space-y-2">
          {categoryList.map((c: any) => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <p className="font-medium">{c.name}</p>
                {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMutation.mutate(c.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
