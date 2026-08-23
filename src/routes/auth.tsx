import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Store } from "lucide-react";
import { login, storeSession } from "@/hooks/use-session";
import { api } from "@/services/api";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — V2 Business" },
      {
        name: "description",
        content: "Sign in or create your V2 Business account to shop or open your own store.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const target = (redirect && redirect.startsWith("/") ? redirect : "/") as string;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success("Welcome back!");
      if (target && target !== "/" && target !== "/auth") {
        navigate({ to: target, replace: true });
      } else if (res.user?.role === "ADMIN" || (res.user as any)?.role === "admin") {
        navigate({ to: "/admin", replace: true });
      } else if (res.user?.role === "VENDOR" || (res.user as any)?.role === "vendor") {
        navigate({ to: "/vendor", replace: true });
      } else {
        navigate({ to: "/", replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? err.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Registration already returns an authenticated backend session.
      const res = await api.register({ email, password, name });
      storeSession(res);
      toast.success("Account created — you're signed in.");
      navigate({ to: target, replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? err.message ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in - we can keep using lovable for now or implement via API
  const googleSignIn = async () => {
    // For now, fallback to lovable (Supabase) - we need to implement Google OAuth via backend
    // We'll redirect to backend Google OAuth endpoint
    try {
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    } catch (err) {
      toast.error("Google sign-in failed");
    }
  };

  const forgot = async () => {
    if (!email) return toast.error("Enter your email above first.");
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      toast.success("Password reset email sent.");
      setForgotOpen(false);
    } catch (err) {
      toast.error("Failed to send reset email");
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-10">
      <Card className="w-full p-6 shadow-card">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Welcome to V2 Business</h1>
            <p className="text-xs text-muted-foreground">Sign in or create an account</p>
          </div>
        </div>

        <Button type="button" variant="outline" className="mb-4 w-full" onClick={googleSignIn}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c7 0 9.4-4.9 9.4-7.5 0-.5-.1-.9-.1-1.3H12z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4">
            <form onSubmit={signIn} className="space-y-3">
              <div>
                <Label htmlFor="e1">Email</Label>
                <Input
                  id="e1"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="p1">Password</Label>
                  <button
                    type="button"
                    onClick={forgot}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <Input
                  id="p1"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <form onSubmit={signUp} className="space-y-3">
              <div>
                <Label htmlFor="n2">Full name</Label>
                <Input id="n2" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="e2">Email</Label>
                <Input
                  id="e2"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="p2">Password (min. 8 chars)</Label>
                <Input
                  id="p2"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Want to sell?{" "}
                <Link to="/vendor" className="text-primary hover:underline">
                  Open a store
                </Link>{" "}
                after signing up.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
