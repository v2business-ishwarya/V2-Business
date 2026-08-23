import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useSession } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/")({
  component: Profile,
});

function Profile() {
  const { user } = useSession();
  const qc = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ["profile-me", user?.id],
    enabled: !!user,
    queryFn: () => api.getMe(),
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (me || user) {
      setFullName((me as any)?.name ?? user?.name ?? "");
      setPhone((me as any)?.phone ?? "");
    }
  }, [me, user]);

  const updateMutation = useMutation({
    mutationFn: () => api.updateUser(user!.id, { name: fullName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile-me"] });
      // update local storage user name
      if (user) {
        const updated = { ...user, name: fullName };
        localStorage.setItem("user", JSON.stringify(updated));
      }
      toast.success("Profile updated successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update profile"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Account Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information and contact details</p>
      </div>

      <Card className="p-6 max-w-xl">
        <div className="space-y-4">
          <div>
            <Label>Email Address</Label>
            <Input value={user?.email ?? ""} disabled className="bg-muted" />
          </div>
          <div>
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
