import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, MapPin, Phone, MessageSquare, Clock, ShieldCheck, Sparkles, Send } from "lucide-react";
import * as React from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact Us — V2 Business Marketplace" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Thank you! Your message has been sent. Our support team will get back to you within 24 hours.");
      (e.target as HTMLFormElement).reset();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>24/7 Dedicated Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Contact <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">V2 Support</span>
          </h1>
          <p className="text-base sm:text-lg text-foreground/80 font-medium leading-relaxed">
            Have a question regarding your order, vendor registration, delivery status, or platform billing? We're here to assist you anytime.
          </p>
        </div>

        {/* 3 Contact Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-card border border-border/80 p-6 shadow-sm flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Mail className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-foreground">Email Support</h3>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">support@v2business.com</p>
              <p className="text-xs text-foreground/70 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Replies within 24 business hours
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/80 p-6 shadow-sm flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Phone className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-foreground">Phone Helpline</h3>
              <p className="text-sm font-bold text-foreground mt-0.5">+91 1800 123 4567</p>
              <p className="text-xs text-foreground/70 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Mon – Sat, 9:00 AM – 7:00 PM IST
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/80 p-6 shadow-sm flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-foreground">Headquarters</h3>
              <p className="text-xs text-foreground/80 font-medium mt-0.5 leading-relaxed">
                V2 Business Marketplace Hub<br />
                Commerce Towers, Tech Park<br />
                India
              </p>
            </div>
          </div>
        </div>

        {/* Form and FAQ Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Send Message Form (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-card border border-border/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-500" />
                Send Us a Direct Message
              </h2>
              <p className="text-xs sm:text-sm text-foreground/75 mt-1">
                Fill out the details below and our team will get in touch right away.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold text-foreground">Your Full Name *</Label>
                  <Input id="name" placeholder="e.g. Ramesh Kumar" required className="h-10 bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-foreground">Email Address *</Label>
                  <Input id="email" type="email" placeholder="name@example.com" required className="h-10 bg-background" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-foreground">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+91 98765 43210" className="h-10 bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-xs font-bold text-foreground">Inquiry Category *</Label>
                  <Input id="subject" placeholder="e.g. Order Tracking, Vendor Onboarding" required className="h-10 bg-background" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs font-bold text-foreground">Message / Details *</Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your query or order ID..." 
                  className="min-h-[120px] bg-background text-sm leading-relaxed" 
                  required 
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold text-sm h-11 shadow-md gap-2"
              >
                <span>{loading ? "Sending Message..." : "Send Message"}</span>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Quick FAQ / Info Box (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl bg-card border border-border/80 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <p className="font-bold text-foreground">How do I track my order?</p>
                  <p className="text-foreground/75 mt-1">Visit your Account &gt; Orders page to view live courier tracking numbers and vendor status updates.</p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <p className="font-bold text-foreground">How do separate invoices work?</p>
                  <p className="text-foreground/75 mt-1">Because V2 Business connects independent sellers directly, items from different vendors generate individual GST-compliant vendor invoices.</p>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <p className="font-bold text-foreground">How to join as a vendor?</p>
                  <p className="text-foreground/75 mt-1">Click "Vendors" on the header or register as a Vendor to list your products across 29 categories with 0% commission.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

