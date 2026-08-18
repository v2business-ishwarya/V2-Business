import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/addresses")({
  component: Addresses,
});

function Addresses() {
  const { user } = useSession();
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["addresses", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const [form, setForm] = useState({
    full_name: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    phone: "",
    is_default: false,
  });

  const add = async () => {
    if (!user) return;
    if (!form.full_name || !form.street || !form.city || !form.postal_code || !form.country)
      return toast.error("Fill required fields");
    const { error } = await supabase.from("addresses").insert({ user_id: user.id, ...form });
    if (error) return toast.error(error.message);
    setForm({
      full_name: "",
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      phone: "",
      is_default: false,
    });
    qc.invalidateQueries({ queryKey: ["addresses"] });
    toast.success("Address added");
  };
  const del = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["addresses"] });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Add address</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Full name</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <Label>Street</Label>
            <Input
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label>State</Label>
            <Input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>
          <div>
            <Label>Postal code</Label>
            <Input
              value={form.postal_code}
              onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
            />
          </div>
          <div>
            <Label>Country</Label>
            <Input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>
        <Button className="mt-4" onClick={add}>
          Add address
        </Button>
      </Card>
      {data.length === 0 ? (
        <EmptyState title="No addresses saved yet." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex justify-between">
                <div className="text-sm">
                  <p className="font-medium">{a.full_name}</p>
                  <p className="text-muted-foreground">
                    {a.street}, {a.city}
                    {a.state ? `, ${a.state}` : ""} {a.postal_code}, {a.country}
                  </p>
                  {a.phone && <p className="text-muted-foreground">{a.phone}</p>}
                </div>
                <button
                  onClick={() => del(a.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
