import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Store, Eye, EyeOff, Mail, ArrowRight } from "lucide-react";
import { login, storeSession } from "@/hooks/use-session";
import { api } from "@/services/api";

import { V2LogoIcon } from "@/components/v2-logo";

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
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

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

  const googleSignIn = async () => {
    try {
      window.location.href = `${import.meta.env.VITE_API_URL || "https://v2-business.onrender.com"}/auth/google`;
    } catch (err) {
      toast.error("Google sign-in failed");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim() || email.trim();
    if (!targetEmail) {
      return toast.error("Please enter your email address.");
    }
    setForgotLoading(true);
    try {
      await api.requestPasswordReset(targetEmail);
      setForgotSubmitted(true);
      toast.success("Password reset instructions sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(email || "");
    setForgotSubmitted(false);
    setForgotOpen(true);
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-10">
      <Card className="w-full p-6 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <V2LogoIcon size={44} />
          <div>
            <h1 className="text-xl font-bold">Welcome to V2 Business</h1>
            <p className="text-xs text-muted-foreground">Sign in or create your account</p>
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

          {/* SIGN IN TAB */}
          <TabsContent value="signin" className="mt-4">
            <form onSubmit={signIn} className="space-y-3">
              <div>
                <Label htmlFor="e1">Email</Label>
                <Input
                  id="e1"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="p1">Password</Label>
                  <button
                    type="button"
                    onClick={openForgotModal}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-1">
                  <Input
                    id="p1"
                    type={showSignInPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowSignInPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    aria-label={showSignInPassword ? "Hide password" : "Show password"}
                  >
                    {showSignInPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          {/* SIGN UP TAB */}
          <TabsContent value="signup" className="mt-4">
            <form onSubmit={signUp} className="space-y-3">
              <div>
                <Label htmlFor="n2">Full name</Label>
                <Input
                  id="n2"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="e2">Email</Label>
                <Input
                  id="e2"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="p2">Password (min. 8 chars)</Label>
                <div className="relative mt-1">
                  <Input
                    id="p2"
                    type={showSignUpPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowSignUpPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                  >
                    {showSignUpPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
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

      {/* FORGOT PASSWORD DIALOG */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl">Forgot Password?</DialogTitle>
            <DialogDescription className="text-center text-sm">
              {forgotSubmitted
                ? "If an account exists with this email, you will receive password reset instructions shortly."
                : "Enter your registered email address and we'll send you a link to reset your password."}
            </DialogDescription>
          </DialogHeader>

          {forgotSubmitted ? (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                Check your inbox at <span className="font-semibold text-foreground">{forgotEmail}</span>.
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  setForgotOpen(false);
                  setForgotSubmitted(false);
                }}
              >
                Back to Sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
              <div>
                <Label htmlFor="forgot-email">Email address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setForgotOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
