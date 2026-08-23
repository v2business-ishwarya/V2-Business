import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Trash2, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/addresses")({
  component: Addresses,
});

interface Address {
  id: string;
  full_name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

function Addresses() {
  const { user } = useSession();
  const storageKey = `user_addresses_${user?.id}`;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState({
    full_name: user?.name || "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    phone: "",
  });

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setAddresses(JSON.parse(saved));
        } catch {}
      }
    }
  }, [user?.id, storageKey]);

  const saveToStorage = (newList: Address[]) => {
    setAddresses(newList);
    if (user?.id) {
      localStorage.setItem(storageKey, JSON.stringify(newList));
    }
  };

  const add = () => {
    if (!form.full_name || !form.street || !form.city || !form.postal_code) {
      return toast.error("Please fill in all required address fields");
    }

    const newAddress: Address = {
      id: String(Date.now()),
      ...form,
    };

    saveToStorage([...addresses, newAddress]);
    setForm({
      full_name: user?.name || "",
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      phone: "",
    });
    toast.success("Delivery address added");
  };

  const del = (id: string) => {
    saveToStorage(addresses.filter((a) => a.id !== id));
    toast.success("Address removed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Saved Addresses</h1>
        <p className="text-sm text-muted-foreground">Manage delivery locations for faster checkout</p>
      </div>

      <Card className="p-6 max-w-2xl">
        <h2 className="text-base font-semibold mb-4">Add New Address</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Recipient Full Name *</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
            />
          </div>
          <div className="col-span-2">
            <Label>Street Address *</Label>
            <Input
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              placeholder="House number, apartment, street, area"
            />
          </div>
          <div>
            <Label>City *</Label>
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="City"
            />
          </div>
          <div>
            <Label>State</Label>
            <Input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="State"
            />
          </div>
          <div>
            <Label>PIN / Postal Code *</Label>
            <Input
              value={form.postal_code}
              onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
              placeholder="e.g. 500001"
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
            <Label>Phone Number</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
        <Button className="mt-4" onClick={add}>
          Save Address
        </Button>
      </Card>

      {addresses.length === 0 ? (
        <EmptyState title="No saved addresses yet" description="Add your delivery address above." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          {addresses.map((a) => (
            <Card key={a.id} className="p-4 flex items-start justify-between">
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-1 font-semibold">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{a.full_name}</span>
                </div>
                <p className="text-muted-foreground">
                  {a.street}, {a.city}
                  {a.state ? `, ${a.state}` : ""} - {a.postal_code}
                </p>
                {a.phone && <p className="text-xs text-muted-foreground">Phone: {a.phone}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => del(a.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
