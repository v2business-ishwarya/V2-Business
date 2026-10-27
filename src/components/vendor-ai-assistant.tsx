import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  X,
  Send,
  MapPin,
  Store,
  CreditCard,
  Package,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  RotateCcw,
  BookOpen,
  MessageSquare,
  BadgePercent,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface VendorAiAssistantProps {
  onOpenRegister?: () => void;
}

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  action?: {
    label: string;
    actionType: "open_register" | "open_tutorial" | "scroll_to";
    target?: string;
  };
  suggestions?: string[];
  timestamp: string;
}

interface TutorialStep {
  title: string;
  description: string;
  bulletPoints: string[];
  proTip?: string;
}

interface Tutorial {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  steps: TutorialStep[];
}

const TUTORIALS: Tutorial[] = [
  {
    id: "registration",
    title: "1. Store Registration & Map Pinning",
    shortDesc: "Register your storefront, add contact details, and pin your physical or home store on the map.",
    icon: Store,
    badge: "Essential",
    steps: [
      {
        title: "Step 1: Open 'Sell on V2B'",
        description: "Click the prominent 'Sell on V2B' button in the navigation header or mobile menu.",
        bulletPoints: [
          "Accessible from both desktop header and the top of the mobile navigation drawer.",
          "Takes less than 2 minutes to complete.",
        ],
        proTip: "You do not need a paid subscription to register — account creation is 100% free.",
      },
      {
        title: "Step 2: Basic Store Details & Phone",
        description: "Enter your official Store Name, select your primary Business Category, and enter a 10-digit mobile number.",
        bulletPoints: [
          "Choose your category (Clothing, Electronics, Grocery, Beauty, etc.) so customers find you quickly.",
          "Mobile number is required for buyer inquiry calls and delivery notifications.",
        ],
        proTip: "Use the WhatsApp-enabled phone number that customers can reach you on.",
      },
      {
        title: "Step 3: Select Location on Map (Crucial)",
        description: "Click the 'Select on Map' button next to the City / Town Location field.",
        bulletPoints: [
          "Click 'Use Current GPS' to detect your exact storefront coordinates automatically.",
          "Or search your street name / locality (e.g. Danavaipeta, Rajahmundry) and drag the red marker pin.",
          "Pinning allows nearby customers within your delivery radius to discover your store on local search.",
        ],
        proTip: "Accurate map pinning increases customer store visits and local delivery speed by up to 3x.",
      },
      {
        title: "Step 4: Choose Business Store Type & Submit",
        description: "Choose between 'Retail Store' (commercial shop) or 'Home / Cloud Studio' (online home seller).",
        bulletPoints: [
          "Click 'Complete Registration & Sell on V2B'.",
          "Your store profile is created instantly and you gain access to your full Vendor Dashboard.",
        ],
      },
    ],
  },
  {
    id: "upi-payments",
    title: "2. Direct UPI Payouts (0% Commission)",
    shortDesc: "Understand how customer payments go directly to your personal or business UPI ID with zero platform cut.",
    icon: CreditCard,
    badge: "0% Fee",
    steps: [
      {
        title: "Step 1: The Direct UPI Model",
        description: "V2B operates on a transparent direct vendor payout model. We do not hold your money for weeks.",
        bulletPoints: [
          "Customers pay directly into your UPI ID or scan your dynamic QR code on checkout.",
          "Funds arrive in your bank account immediately, without waiting for batch settlements.",
          "Zero (0%) commission charged on standard sales.",
        ],
        proTip: "Check your UPI app (Google Pay, PhonePe, Paytm, BHIM) for instant payment confirmation alerts.",
      },
      {
        title: "Step 2: Enter Your Payout UPI ID in Settings",
        description: "Go to Vendor Dashboard > Settings > Payment Configuration.",
        bulletPoints: [
          "Provide your valid Virtual Payment Address (e.g. yourstore@okaxis, 9876543210@ybl).",
          "Ensure your bank account linked to this UPI ID is active and can receive commercial payments.",
        ],
      },
      {
        title: "Step 3: Order Payment Verification",
        description: "When an order is placed with UPI Transfer mode:",
        bulletPoints: [
          "The buyer provides the 12-digit UPI UTR / Reference ID.",
          "You can verify the payment in your UPI app and click 'Confirm Payment' in your Vendor Orders dashboard.",
          "Then proceed to packaging and dispatch.",
        ],
      },
    ],
  },
  {
    id: "product-listing",
    title: "3. Adding Products & Inventory",
    shortDesc: "Learn how to list products with clear photos, price tags, category tags, and variant options.",
    icon: Package,
    badge: "Catalog",
    steps: [
      {
        title: "Step 1: Navigate to Vendor > Products",
        description: "Open your Vendor Dashboard and click 'Products' > 'Add New Product'.",
        bulletPoints: [
          "Add high-resolution product photos showing multiple angles.",
          "Square (1:1) aspect ratio images look best on mobile feeds.",
        ],
      },
      {
        title: "Step 2: Title, Description & Search Tags",
        description: "Write a crisp, clear title and include details such as material, size, brand, and warranty.",
        bulletPoints: [
          "Include keywords buyers search for (e.g. 'Pure Silk Handloom Saree Rajahmundry').",
          "Assign the right category and subcategory so visual search and filters index it.",
        ],
        proTip: "Products with detailed descriptions receive 40% fewer return requests.",
      },
      {
        title: "Step 3: Pricing, Discount & Stock",
        description: "Set your Original MRP, Selling Price, and Available Quantity.",
        bulletPoints: [
          "If selling price is lower than MRP, an automatic discount badge (e.g. '25% OFF') is displayed.",
          "Keep inventory count updated so products don't sell out unexpectedly.",
        ],
      },
      {
        title: "Step 4: Publish & Live Storefront Link",
        description: "Click 'Publish Product'.",
        bulletPoints: [
          "Your product goes live immediately on the V2B marketplace.",
          "Share your store's direct link on WhatsApp, Instagram, and Facebook to drive direct orders.",
        ],
      },
    ],
  },
  {
    id: "order-dispatch",
    title: "4. Managing Orders & Tax Invoices",
    shortDesc: "How to process incoming orders, dispatch packages, and print customer invoices.",
    icon: FileText,
    badge: "Operations",
    steps: [
      {
        title: "Step 1: Check Inbound Orders",
        description: "Open Vendor Dashboard > Orders to see pending, confirmed, and shipped orders.",
        bulletPoints: [
          "Review customer delivery address, contact phone number, and special instructions.",
          "Confirm payment receipt before handing over items for delivery.",
        ],
      },
      {
        title: "Step 2: Update Order Status",
        description: "Keep customers informed about the delivery progress.",
        bulletPoints: [
          "Change status from 'Pending' to 'Confirmed' -> 'Out for Delivery' -> 'Delivered'.",
          "Customers receive real-time updates on their order tracking page.",
        ],
      },
      {
        title: "Step 3: 1-Click Invoice Generation",
        description: "Every fulfilled order has an automated tax invoice generated for both buyer and seller.",
        bulletPoints: [
          "Click 'View / Download Invoice' to print a GST-compliant slip.",
          "Include the slip inside the package for customer records.",
        ],
      },
    ],
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "👋 Welcome to **V2B Seller Support & AI Guide**!\n\nI am specifically trained to help you with **Store Registration**, **Selecting Location on Map**, **Direct UPI Payouts (0% fee)**, and **Vendor Operations**.\n\nHow can I help you kickstart your storefront today?",
    action: {
      label: "Open 'Sell on V2B' Registration",
      actionType: "open_register",
    },
    suggestions: [
      "How do I register as a seller?",
      "Why do I need to select location on map?",
      "How do Direct UPI payments work?",
      "What are the fees or commission?",
      "Can home businesses register?",
      "How to list products?",
    ],
    timestamp: "Just now",
  },
];

export function VendorAiAssistant({ onOpenRegister }: VendorAiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "tutorials">("chat");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Active tutorial state
  const [selectedTutorialId, setSelectedTutorialId] = useState<string>("registration");
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for global custom events to open the assistant from anywhere
  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: "chat" | "tutorials"; tutorialId?: string; query?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.tab) {
        setActiveTab(customEvent.detail.tab);
      }
      if (customEvent.detail?.tutorialId) {
        setSelectedTutorialId(customEvent.detail.tutorialId);
        setActiveStepIndex(0);
      }
      if (customEvent.detail?.query) {
        handleUserQuery(customEvent.detail.query);
      }
    };

    window.addEventListener("open-vendor-ai-assistant", handleOpenEvent);
    return () => window.removeEventListener("open-vendor-ai-assistant", handleOpenEvent);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === "chat" && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeTab, isOpen]);

  const activeTutorial = TUTORIALS.find((t) => t.id === selectedTutorialId) || TUTORIALS[0];

  const handleOpenRegistration = () => {
    setIsOpen(false);
    if (onOpenRegister) {
      onOpenRegister();
    } else {
      window.dispatchEvent(new CustomEvent("open-vendor-register-modal"));
    }
  };

  const handleUserQuery = (userText: string) => {
    const q = userText.trim();
    if (!q) return;

    const userMsg: Message = {
      id: "u-" + Date.now(),
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateVendorResponse(q);
      const botMsg: Message = {
        id: "b-" + Date.now(),
        sender: "bot",
        text: response.text,
        action: response.action,
        suggestions: response.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 550);
  };

  const generateVendorResponse = (
    query: string
  ): {
    text: string;
    action?: Message["action"];
    suggestions?: string[];
  } => {
    const lower = query.toLowerCase();

    // 1. Map / Location related queries
    if (
      lower.includes("map") ||
      lower.includes("location") ||
      lower.includes("pin") ||
      lower.includes("gps") ||
      lower.includes("address") ||
      lower.includes("coordinates")
    ) {
      return {
        text: `📍 **Why 'Select on Map' is essential for V2B Vendors:**\n\n1. **Local Buyer Discovery**: When customers search for shops near Rajahmundry, Kakinada, or their town, our algorithm ranks verified map-pinned shops first.\n2. **Accurate Delivery Routes**: Couriers and delivery partners receive your exact GPS coordinates, avoiding misplaced orders.\n3. **How to use it**: In the **Sell on V2B** form, click **'Select on Map'**. You can tap **'Use Current GPS'** or drag the red marker pin right to your doorstep.\n4. **Quick Pick Cities**: You can also quickly select Rajahmundry, Danavaipeta, Kakinada, Vijayawada, Visakhapatnam, or Hyderabad.`,
        action: {
          label: "Try Map Picker in Registration",
          actionType: "open_register",
        },
        suggestions: [
          "How do Direct UPI payments work?",
          "What documents do I need to register?",
          "Are there any registration fees?",
        ],
      };
    }

    // 2. Registration & Becoming a Seller
    if (
      lower.includes("register") ||
      lower.includes("become a seller") ||
      lower.includes("sell on v2b") ||
      lower.includes("sign up") ||
      lower.includes("join") ||
      lower.includes("onboard") ||
      lower.includes("start selling")
    ) {
      return {
        text: `🚀 **How to Register as a V2B Seller in 4 Quick Steps:**\n\n1. **Click 'Sell on V2B'** in the top navigation or mobile menu.\n2. **Store Name & Category**: Enter your store name and select your business niche (Fashion, Electronics, Grocery, Home, etc.).\n3. **10-Digit Mobile Number**: Enter your direct phone number for orders and WhatsApp contact.\n4. **City & Map Pin**: Use the **'Select on Map'** tool to pin your exact location with GPS.\n5. **Store Type**: Select **Retail Store** (physical commercial shop) or **Home / Cloud Studio** (online home business).\n\n✨ Registration is **100% free with instant activation**!`,
        action: {
          label: "Open Registration Form Now",
          actionType: "open_register",
        },
        suggestions: [
          "Why do I need to select location on map?",
          "How do Direct UPI payments work?",
          "What are the fees or commission?",
        ],
      };
    }

    // 3. Payments, UPI, Fees & Commissions
    if (
      lower.includes("upi") ||
      lower.includes("payment") ||
      lower.includes("fee") ||
      lower.includes("commission") ||
      lower.includes("payout") ||
      lower.includes("money") ||
      lower.includes("charge") ||
      lower.includes("cost")
    ) {
      return {
        text: `💰 **Zero Commission & Direct UPI Payouts:**\n\n• **0% Platform Commission**: You keep 100% of your earnings on standard seller plans.\n• **Direct to Your Bank**: When buyers pay via UPI, money goes directly into your registered UPI ID (e.g. GPay, PhonePe, Paytm, BHIM) — V2B doesn't hold your funds.\n• **UTR Verification**: In the checkout flow, buyers provide the 12-digit UPI transaction reference so you can verify payment in your banking app before dispatching.\n• **Transparent & Free**: There are no hidden onboarding charges or listing fees.`,
        action: {
          label: "View UPI Payout Tutorial",
          actionType: "open_tutorial",
          target: "upi-payments",
        },
        suggestions: [
          "How do I add my UPI ID?",
          "How do I register as a seller?",
          "How to process orders?",
        ],
      };
    }

    // 4. Products, Catalog, Inventory
    if (
      lower.includes("product") ||
      lower.includes("item") ||
      lower.includes("catalog") ||
      lower.includes("listing") ||
      lower.includes("stock") ||
      lower.includes("inventory") ||
      lower.includes("upload") ||
      lower.includes("price")
    ) {
      return {
        text: `📦 **Listing Products & Managing Inventory:**\n\n1. Log in and head to **Vendor Dashboard > Products**.\n2. Click **Add New Product**.\n3. Upload clear photos (1:1 square ratio works best for mobile users).\n4. Set your **MRP**, **Selling Price** (discounts are calculated automatically), and **Stock Count**.\n5. Select the right category and add size/color variants if applicable.\n6. Hit **Publish** — it goes live on the marketplace search immediately!`,
        action: {
          label: "View Product Listing Tutorial",
          actionType: "open_tutorial",
          target: "product-listing",
        },
        suggestions: [
          "How do I manage orders?",
          "How do Direct UPI payments work?",
          "How to register as a seller?",
        ],
      };
    }

    // 5. Orders, Invoices, Delivery
    if (
      lower.includes("order") ||
      lower.includes("invoice") ||
      lower.includes("delivery") ||
      lower.includes("ship") ||
      lower.includes("dispatch") ||
      lower.includes("tracking")
    ) {
      return {
        text: `🚚 **Order Processing & Tax Invoices:**\n\n• **Instant Alerts**: New orders appear right in your Vendor Dashboard under the **Orders** tab.\n• **Payment Check**: Verify the buyer's UPI transfer receipt or COD status.\n• **Status Updates**: Update the order status from *Pending* to *Confirmed* to *Shipped*. The buyer can track progress live.\n• **Auto Invoice**: Click **Download Invoice** to print a ready-to-use commercial tax invoice to place in the package.`,
        action: {
          label: "View Order & Invoice Tutorial",
          actionType: "open_tutorial",
          target: "order-dispatch",
        },
        suggestions: [
          "How do Direct UPI payments work?",
          "Why do I need to select location on map?",
          "How do I register as a seller?",
        ],
      };
    }

    // 6. Home sellers, GST, Documents
    if (
      lower.includes("gst") ||
      lower.includes("document") ||
      lower.includes("home") ||
      lower.includes("small") ||
      lower.includes("women") ||
      lower.includes("craft") ||
      lower.includes("license")
    ) {
      return {
        text: `🏡 **Home-Based Businesses & Documentation:**\n\n• **Home Sellers Welcome**: You can select **'Home / Cloud Studio'** during registration. Perfect for home bakers, boutique fashion designers, artisans, and cloud kitchens.\n• **GST Not Mandatory for Starters**: Micro & intra-state local sellers with turnover under the statutory threshold can start selling immediately without GST.\n• **What You Need**: Just your store name, 10-digit mobile phone number, map-pinned address, and an active UPI ID for payouts!`,
        action: {
          label: "Register Your Home Store",
          actionType: "open_register",
        },
        suggestions: [
          "How do Direct UPI payments work?",
          "Why do I need to select location on map?",
          "How to list products?",
        ],
      };
    }

    // Fallback response with vendor scope clarification
    return {
      text: `🤖 I'm your dedicated **V2B Vendor & Seller Assistant**! I can specifically help you with:\n\n• **Seller Registration** & requirements\n• **Selecting your shop location on Google Maps**\n• **Direct UPI Payouts (0% fee)**\n• **Listing products & variants**\n• **Processing orders & printing invoices**\n\nWould you like to open the registration form or explore step-by-step tutorials?`,
      action: {
        label: "Open 'Sell on V2B' Registration",
        actionType: "open_register",
      },
      suggestions: [
        "How do I register as a seller?",
        "Why do I need to select location on map?",
        "How do Direct UPI payments work?",
        "What are the fees or commission?",
      ],
    };
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 print:hidden">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600 p-3 sm:px-4 sm:py-2.5 text-white shadow-xl shadow-amber-600/30 transition-all hover:scale-105 active:scale-95 hover:shadow-amber-600/40 cursor-pointer"
            aria-label="Open Seller AI Assistant and Tutorials"
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>
            <Bot className="h-5 w-5 shrink-0 transition-transform group-hover:rotate-12" />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold leading-tight flex items-center gap-1">
                Seller AI & Tutorials
                <Sparkles className="h-3 w-3 text-amber-200 fill-amber-200" />
              </span>
              <span className="text-[10px] text-amber-100/90 leading-tight">
                Ask registering & map guide
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Main Assistant Modal / Flyout */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 print:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="w-full sm:max-w-[440px] max-h-[90vh] sm:max-h-[640px] h-full sm:h-[620px] bg-background border border-border sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600 p-4 text-white shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm tracking-tight text-white">V2B Seller AI Assistant</h3>
                      <Badge className="bg-emerald-400/25 text-emerald-100 border-emerald-300/30 text-[9px] px-1.5 py-0 h-4 font-semibold">
                        Online
                      </Badge>
                    </div>
                    <p className="text-[11px] text-amber-100">
                      Registration, Map Pinning & Vendor Guidance
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="Close Assistant"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="mt-3 flex rounded-xl bg-black/20 p-1 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    activeTab === "chat"
                      ? "bg-white text-foreground shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Ask AI Assistant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tutorials")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    activeTab === "tutorials"
                      ? "bg-white text-foreground shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Step Tutorials</span>
                  <Badge className="bg-amber-400 text-amber-950 text-[9px] px-1 py-0 h-3.5 font-bold ml-1">
                    4
                  </Badge>
                </button>
              </div>
            </div>

            {/* Content Body: Chat Tab */}
            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col min-h-0 bg-muted/20">
                {/* Scrollable Message List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                          m.sender === "user"
                            ? "bg-amber-600 text-white rounded-br-xs font-medium"
                            : "bg-card border border-border text-foreground rounded-bl-xs"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{m.text}</div>

                        {/* Optional Interactive Action Button */}
                        {m.action && (
                          <div className="mt-2.5 pt-2 border-t border-border/50">
                            {m.action.actionType === "open_register" && (
                              <Button
                                size="sm"
                                onClick={handleOpenRegistration}
                                className="w-full h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs gap-1.5"
                              >
                                <Store className="h-3.5 w-3.5" />
                                <span>{m.action.label}</span>
                                <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                              </Button>
                            )}
                            {m.action.actionType === "open_tutorial" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (m.action?.target) setSelectedTutorialId(m.action.target);
                                  setActiveStepIndex(0);
                                  setActiveTab("tutorials");
                                }}
                                className="w-full h-8 text-xs font-semibold rounded-xl gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>{m.action.label}</span>
                                <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Suggestions Chips below the bot message */}
                      {m.suggestions && m.suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                          {m.suggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleUserQuery(s)}
                              className="text-[10px] rounded-full bg-card border border-border/80 px-2.5 py-1 text-muted-foreground hover:text-amber-600 hover:border-amber-400 hover:bg-amber-500/5 transition-all text-left"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                      <span className="text-[9px] text-muted-foreground px-1 mt-1">
                        {m.timestamp}
                      </span>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-1.5 bg-card border border-border rounded-2xl px-3 py-2 w-fit text-xs text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                      <span>Seller AI is typing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Action Footer in Chat */}
                <div className="px-3 py-1.5 bg-muted/40 border-t border-border/50 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={handleOpenRegistration}
                    className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Store className="h-3 w-3" />
                    <span>Sell on V2B Register</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTutorialId("registration");
                      setActiveTab("tutorials");
                    }}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <MapPin className="h-3 w-3 text-rose-500" />
                    <span>Map Pin Tutorial</span>
                  </button>
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUserQuery(input);
                  }}
                  className="p-3 bg-card border-t border-border flex items-center gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about registration, map pin, UPI fee..."
                    className="h-10 text-xs rounded-xl bg-muted/50 focus-visible:ring-amber-500"
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="h-10 w-10 p-0 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}

            {/* Content Body: Tutorials Tab */}
            {activeTab === "tutorials" && (
              <div className="flex-1 flex flex-col min-h-0 bg-muted/10 overflow-hidden">
                {/* Tutorial Selector Chips */}
                <div className="flex gap-1.5 p-2.5 overflow-x-auto bg-card border-b border-border shrink-0 no-scrollbar">
                  {TUTORIALS.map((t) => {
                    const Icon = t.icon;
                    const isSelected = t.id === selectedTutorialId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTutorialId(t.id);
                          setActiveStepIndex(0);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all border shrink-0 ${
                          isSelected
                            ? "bg-amber-600 text-white border-amber-600 font-bold shadow-xs"
                            : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{t.title.split(". ")[1]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Tutorial Stepper View */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Tutorial Title Card */}
                  <div className="rounded-2xl bg-card border border-border p-3.5 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                          {React.createElement(activeTutorial.icon, { className: "h-4 w-4" })}
                        </div>
                        <h4 className="font-bold text-xs text-foreground">{activeTutorial.title}</h4>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600">
                        {activeTutorial.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                      {activeTutorial.shortDesc}
                    </p>
                  </div>

                  {/* Progress Tracker */}
                  <div className="flex items-center justify-between gap-1.5 px-1">
                    {activeTutorial.steps.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= activeStepIndex ? "bg-amber-500" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Active Step Card */}
                  {activeTutorial.steps[activeStepIndex] && (
                    <div className="rounded-2xl bg-card border border-border p-4 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase">
                          Step {activeStepIndex + 1} of {activeTutorial.steps.length}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {Math.round(((activeStepIndex + 1) / activeTutorial.steps.length) * 100)}% Complete
                        </span>
                      </div>

                      <h5 className="font-bold text-sm text-foreground">
                        {activeTutorial.steps[activeStepIndex].title}
                      </h5>

                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {activeTutorial.steps[activeStepIndex].description}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        {activeTutorial.steps[activeStepIndex].bulletPoints.map((bp, bidx) => (
                          <div key={bidx} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{bp}</span>
                          </div>
                        ))}
                      </div>

                      {activeTutorial.steps[activeStepIndex].proTip && (
                        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Pro-Tip: </span>
                            <span>{activeTutorial.steps[activeStepIndex].proTip}</span>
                          </div>
                        </div>
                      )}

                      {/* Direct CTA when in registration tutorial */}
                      {selectedTutorialId === "registration" && (
                        <div className="pt-2">
                          <Button
                            size="sm"
                            onClick={handleOpenRegistration}
                            className="w-full text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl gap-2 shadow-xs"
                          >
                            <Store className="h-3.5 w-3.5" />
                            <span>Open Registration & Select on Map</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stepper Footer Controls */}
                <div className="p-3 bg-card border-t border-border flex items-center justify-between gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeStepIndex === 0}
                    onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                    className="h-8 text-xs rounded-xl gap-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Previous</span>
                  </Button>

                  {activeStepIndex < activeTutorial.steps.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setActiveStepIndex((prev) => prev + 1)}
                      className="h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl gap-1"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        const curIdx = TUTORIALS.findIndex((t) => t.id === selectedTutorialId);
                        if (curIdx < TUTORIALS.length - 1) {
                          setSelectedTutorialId(TUTORIALS[curIdx + 1].id);
                          setActiveStepIndex(0);
                        } else {
                          setActiveTab("chat");
                        }
                      }}
                      className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{selectedTutorialId === TUTORIALS[TUTORIALS.length - 1].id ? "Finish & Ask Questions" : "Next Tutorial"}</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
