import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const resetPasswordSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: resetPasswordSchema,
  head: () => ({
    meta: [{ title: "Reset Password — V2 Business" }, { name: "robots", content: "noindex" }],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token } = useSearch({ from: "/reset-password" });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      if (token) {
        await api.resetPassword(token, password);
        toast.success("Password updated successfully. You can now log in.");
        nav({ to: "/auth" });
      } else {
        toast.error("Invalid or expired password reset link.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <Card className="w-full p-6">
        <h1 className="text-xl font-semibold">Set New Password</h1>
        <form className="mt-4 space-y-4" onSubmit={update}>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              required
              minLength={6}
              placeholder="Enter new secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
