import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Store,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Sparkles,
  Star,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { login, storeSession } from "@/hooks/use-session";
import { api } from "@/services/api";
import { V2Logo, V2LogoIcon } from "@/components/v2-logo";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Authentication — V2 Business" },
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

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [accountType, setAccountType] = useState<"customer" | "vendor">("customer");

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

  // Check for Google OAuth redirect callback tokens in URL
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const rawUser = urlParams.get("user");
    const error = urlParams.get("error");

    if (error) {
      if (error === "google_not_configured") {
        toast.error("Google OAuth is waiting for GOOGLE_CLIENT_ID in your Render environment variables.");
      } else {
        toast.error("Google authentication failed. Please sign in with email & password.");
      }
    } else if (token && rawUser) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(rawUser));
        storeSession({ accessToken: token, user: parsedUser });
        toast.success("Signed in with Google successfully!");
        if (parsedUser.role === "ADMIN") {
          navigate({ to: "/admin", replace: true });
        } else if (parsedUser.role === "VENDOR") {
          navigate({ to: "/vendor", replace: true });
        } else {
          navigate({ to: target, replace: true });
        }
      } catch (err) {
        console.error("Failed to parse Google auth payload", err);
      }
    }
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success("Welcome back to V2 Business!");
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
      toast.success("Account created successfully!");
      if (accountType === "vendor") {
        navigate({ to: "/vendor", replace: true });
      } else {
        navigate({ to: target, replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? err.message ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://v2-business.onrender.com";
      window.location.href = `${apiUrl}/auth/google`;
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
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
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Main Split Creative Container */}
      <div className="relative w-full max-w-5xl rounded-3xl border border-border/80 bg-card shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* LEFT SHOWCASE HERO (Desktop) */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-primary via-emerald-700 to-teal-900 p-8 sm:p-10 text-primary-foreground flex flex-col justify-between overflow-hidden">
          {/* Decorative mesh glows */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-black/20 blur-2xl" />

          {/* Top Logo & Pill */}
          <div className="relative z-10 flex flex-wrap items-center gap-4">
            <Link to="/" className="inline-block">
              <V2Logo size="md" textColor="text-white" isLightOnDark={true} />
            </Link>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/25 border border-white/30 px-3.5 py-1 text-xs font-bold text-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span>{mode === "signin" ? "Welcome Back to V2" : "Join Our Marketplace"}</span>
            </div>
          </div>

          {/* Dynamic Middle Headline & Benefits */}
          <div className="relative z-10 my-8 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight transition-all duration-300">
              {mode === "signin"
                ? "Your Gateway to Independent Creators & Fast Commerce."
                : "Start Shopping or Launch Your Online Store Today."}
            </h2>

            <div className="space-y-3.5 text-xs sm:text-sm text-primary-foreground/90">
              <div className="flex items-center gap-3">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/20">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <span>Unified Multi-Vendor Cart & 1-Click Checkout</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/20">
                  <Zap className="h-4 w-4" />
                </div>
                <span>0% Commission · Keep 100% of Your Sales Revenue</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/20">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span>256-Bit Encrypted Payments & Buyer Protection</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Card */}
          <div className="relative z-10 rounded-2xl bg-black/20 p-4 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
            <div>
              <div className="flex items-center gap-1 text-yellow-300 font-bold">
                <Star className="h-3.5 w-3.5 fill-yellow-300" />
                <Star className="h-3.5 w-3.5 fill-yellow-300" />
                <Star className="h-3.5 w-3.5 fill-yellow-300" />
                <Star className="h-3.5 w-3.5 fill-yellow-300" />
                <Star className="h-3.5 w-3.5 fill-yellow-300" />
                <span className="text-white ml-1 font-semibold">4.9/5</span>
              </div>
              <p className="text-white/80 mt-0.5">Trusted by 100+ stores & 10,000+ buyers</p>
            </div>
            <Badge variant="outline" className="border-white/30 text-white text-[10px]">
              Verified
            </Badge>
          </div>
        </div>

        {/* RIGHT INTERACTIVE FORM CONTAINER */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          {/* Creative Segmented Mode Switcher */}
          <div className="flex rounded-full bg-muted p-1 mb-5 shadow-inner max-w-sm mx-auto w-full">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-full py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Branded Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-2xl border-2 font-semibold mb-4 hover:bg-muted/70 transition-all shadow-sm"
            onClick={googleSignIn}
          >
            <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c7 0 9.4-4.9 9.4-7.5 0-.5-.1-.9-.1-1.3H12z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">or with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* FORM CONTENT */}
          {mode === "signin" ? (
            <form onSubmit={signIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-2xl pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password" className="text-xs font-semibold">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={openForgotModal}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type={showSignInPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-2xl pl-10 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowSignInPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 mt-2"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In to Your Account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-1">
                New to V2 Business?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  Create a free account
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={signUp} className="space-y-3.5">
              {/* Account Type Selector */}
              <div>
                <Label className="text-xs font-semibold mb-1 block">I want to:</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType("customer")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2 text-xs font-bold transition-all cursor-pointer ${
                      accountType === "customer"
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Shop Products</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("vendor")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2 text-xs font-bold transition-all cursor-pointer ${
                      accountType === "vendor"
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Store className="h-4 w-4" />
                    <span>Sell / Open Store</span>
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="signup-name" className="text-xs font-semibold">
                  Full Name
                </Label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 rounded-xl pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 rounded-xl pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-password" className="text-xs font-semibold">
                  Create Password (min. 8 chars)
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showSignUpPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 rounded-xl pl-10 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowSignUpPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 mt-1"
                disabled={loading}
              >
                {loading ? "Creating Account…" : accountType === "vendor" ? "Create Store Account" : "Join Marketplace"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-1">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">Reset Your Password</DialogTitle>
            <DialogDescription className="text-center text-sm">
              {forgotSubmitted
                ? "Password reset link has been dispatched to your email."
                : "Enter your registered email address and we'll send you an instant reset link."}
            </DialogDescription>
          </DialogHeader>

          {forgotSubmitted ? (
            <div className="space-y-4 pt-2">
              <div className="rounded-2xl bg-muted p-4 text-center text-sm text-muted-foreground">
                Check your inbox at <span className="font-bold text-foreground">{forgotEmail}</span>.
              </div>
              <Button
                type="button"
                className="w-full rounded-2xl font-bold"
                onClick={() => {
                  setForgotOpen(false);
                  setForgotSubmitted(false);
                }}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
              <div>
                <Label htmlFor="forgot-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="mt-1 h-11 rounded-2xl text-sm"
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-2xl"
                  onClick={() => setForgotOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-2xl font-bold" disabled={forgotLoading}>
                  {forgotLoading ? "Sending Link…" : "Send Reset Link"}
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
