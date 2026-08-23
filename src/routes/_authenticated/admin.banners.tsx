import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/empty-state";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: AdminBanners,
});

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
}

const STORAGE_KEY = "marketplace_banners";

function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    is_active: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setBanners(JSON.parse(saved));
      } else {
        const initial: Banner[] = [
          {
            id: "1",
            title: "Summer Sale is Live",
            subtitle: "Up to 50% off on top brands",
            image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80",
            link_url: "/search",
            is_active: true,
          },
        ];
        setBanners(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch {
      // fallback
    }
  }, []);

  const saveBanners = (updated: Banner[]) => {
    setBanners(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const add = () => {
    if (!form.title || !form.image_url) return toast.error("Title and image URL are required");
    const newBanner: Banner = {
      id: String(Date.now()),
      title: form.title,
      subtitle: form.subtitle || undefined,
      image_url: form.image_url,
      link_url: form.link_url || undefined,
      is_active: form.is_active,
    };
    saveBanners([...banners, newBanner]);
    setForm({ title: "", subtitle: "", image_url: "", link_url: "", is_active: true });
    toast.success("Banner added");
  };

  const toggle = (id: string, is_active: boolean) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, is_active } : b));
    saveBanners(updated);
  };

  const del = (id: string) => {
    const updated = banners.filter((b) => b.id !== id);
    saveBanners(updated);
    toast.success("Banner removed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Banner Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure promotional homepage banners</p>
      </div>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Add Promo Banner</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input
              placeholder="e.g. Festive Offers"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Subtitle (optional)</Label>
            <Input
              placeholder="e.g. Free shipping on orders over ₹499"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Image URL</Label>
            <Input
              placeholder="https://images.unsplash.com/..."
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Target Link URL (optional)</Label>
            <Input
              placeholder="/search or /category/electronics"
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
            <span className="text-sm font-medium">Active banner</span>
          </div>
        </div>
        <Button className="mt-4" onClick={add}>
          Add Banner
        </Button>
      </Card>

      {banners.length === 0 ? (
        <EmptyState title="No banners configured" />
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <Card key={b.id} className="flex flex-wrap items-center gap-4 p-4">
              <img src={b.image_url} alt="" className="h-16 w-28 rounded-lg object-cover bg-muted" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{b.title}</p>
                {b.subtitle && <p className="text-xs text-muted-foreground">{b.subtitle}</p>}
                <p className="text-xs text-muted-foreground truncate">{b.link_url ?? "—"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={b.is_active} onCheckedChange={(v) => toggle(b.id, v)} />
                <Button variant="ghost" size="icon" onClick={() => del(b.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
