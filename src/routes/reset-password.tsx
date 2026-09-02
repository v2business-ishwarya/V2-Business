import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft } from "lucide-react";

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
  const { token: urlToken } = useSearch({ from: "/reset-password" });
  const [tokenInput, setTokenInput] = useState(urlToken || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const nav = useNavigate();

  const effectiveToken = urlToken || tokenInput.trim();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveToken) {
      return toast.error("Reset token is missing. Please check your reset email link.");
    }
    if (!password || password.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match. Please retype.");
    }

    setLoading(true);
    try {
      await api.resetPassword(effectiveToken, password);
      setSuccess(true);
      toast.success("Password reset successfully! You can now log in.");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-10">
      <Card className="w-full p-6 shadow-card">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            {success ? <CheckCircle2 className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
          </div>
          <h1 className="text-xl font-semibold">
            {success ? "Password Updated" : "Reset Your Password"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {success
              ? "Your password has been changed. You can now sign in with your new credentials."
              : "Enter your new password below to regain access to your account."}
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={() => nav({ to: "/auth" })}
            >
              Go to Sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {!urlToken && (
              <div>
                <Label htmlFor="token">Reset Token / Code</Label>
                <Input
                  id="token"
                  required
                  placeholder="Paste reset token from email"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="new-pass">New Password (min. 6 chars)</Label>
              <div className="relative mt-1">
                <Input
                  id="new-pass"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm-pass">Confirm New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirm-pass"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting Password…" : "Update Password"}
            </Button>

            <div className="pt-2 text-center">
              <Link
                to="/auth"
                className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
