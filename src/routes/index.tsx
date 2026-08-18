import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Store, Sparkles, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "@/hooks/use-session";
import { api } from "@/services/api";
import * as React from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Extract the original homepage content into a reusable component
function HomeContent() {
  const products = useQuery({
    queryKey: ["products-latest"],
    queryFn: async () => api.getProducts({ limit: 10, isActive: true }),
  });
  const productCards = (products.data?.data ?? []).map((product: any) => ({
    ...product,
    slug: product.id,
    featured_image: product.images?.[0] ?? null,
    discount_price: product.compareAtPrice ? product.price : null,
    price: product.compareAtPrice ?? product.price,
    avg_rating: 0,
    vendors: product.vendor ? { name: product.vendor.name, slug: product.vendor.id } : null,
  }));
  const banners = { data: [] as any[] };
  const categories = { data: [] as any[] };
  const featuredVendors = { data: [] as any[] };
  const latest = { data: productCards, isLoading: products.isLoading };
  const discounts = { data: productCards.filter((product: any) => product.discount_price != null) };
  const popular = { data: [] as any[], isLoading: false };

  const emptyMarketplace = (latest.data?.length ?? 0) === 0 && (popular.data?.length ?? 0) === 0;

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-br from-primary-soft via-surface to-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> A marketplace for independent stores
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Shop from real people, not warehouses.
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground">
              Discover thousands of vendors and products across categories. Every store is run by an
              independent seller.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/search">
                <Button size="lg" className="rounded-full">
                  Start shopping <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/vendor">
                <Button size="lg" variant="outline" className="rounded-full">
                  Open your store
                </Button>
              </Link>
            </div>
          </motion.div>
          <div className="relative hidden lg:block">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-3">
                {[Store, Package, Tag].map((Icon, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl border border-border bg-surface p-6 shadow-soft"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                    <p className="mt-3 text-sm font-medium">
                      {i === 0
                        ? "Independent stores"
                        : i === 1
                          ? "Curated products"
                          : "Fair prices"}
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
                <p className="text-sm text-muted-foreground">Categories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(categories.data ?? []).slice(0, 6).map((c) => (
                    <Link
                      key={c.id}
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs hover:border-primary hover:text-primary"
                    >
                      {c.name}
                    </Link>
                  ))}
                  {(categories.data ?? []).length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      Categories will appear here once created.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {emptyMarketplace && !latest.isLoading && !popular.isLoading && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <EmptyState
            icon={<Store className="h-6 w-6" />}
            title="The marketplace is just getting started"
            description="No approved vendors or products yet. Be the first — open a store and list your products to appear here."
            action={
              <Link to="/vendor">
                <Button>Open your store</Button>
              </Link>
            }
          />
        </section>
      )}

      {(banners.data?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {banners.data!.map((b) => (
              <a
                key={b.id}
                href={b.link_url ?? "#"}
                className="group relative overflow-hidden rounded-2xl border border-border shadow-soft"
              >
                <img
                  src={b.image_url}
                  alt={b.title}
                  className="h-40 w-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h3 className="text-lg font-semibold">{b.title}</h3>
                  {b.subtitle && <p className="text-sm opacity-90">{b.subtitle}</p>}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {(categories.data?.length ?? 0) > 0 && (
        <Section
          title="Shop by category"
          action={
            <Link to="/categories" className="text-sm text-primary hover:underline">
              All categories
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.data!.map((c) => (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center shadow-soft transition hover:border-primary hover:shadow-card"
              >
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
                    <Tag className="h-5 w-5" />
                  </div>
                )}
                <span className="text-sm font-medium">{c.name}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {(featuredVendors.data?.length ?? 0) > 0 && (
        <Section title="Featured vendors">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {featuredVendors.data!.map((v) => (
              <Link
                key={v.id}
                to="/store/$slug"
                params={{ slug: v.slug }}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center shadow-soft hover:border-primary"
              >
                {v.logo_url ? (
                  <img
                    src={v.logo_url}
                    alt={v.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary">
                    <Store className="h-6 w-6" />
                  </div>
                )}
                <span className="line-clamp-1 text-sm font-medium">{v.name}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {(latest.data?.length ?? 0) > 0 && (
        <Section
          title="Latest products"
          action={
            <Link to="/search" className="text-sm text-primary hover:underline">
              See all
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {latest.data!.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}

      {(discounts.data?.length ?? 0) > 0 && (
        <Section title="Top discounts">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {discounts.data!.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}

      {(popular.data?.length ?? 0) > 0 && (
        <Section title="Popular stores">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {popular.data!.map((v) => (
              <Link
                key={v.id}
                to="/store/$slug"
                params={{ slug: v.slug }}
                className="flex flex-col items-center gap-2 rounded-xl p-3 hover:bg-surface-muted"
              >
                {v.logo_url ? (
                  <img
                    src={v.logo_url}
                    alt={v.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
                    <Store className="h-5 w-5" />
                  </div>
                )}
                <span className="line-clamp-1 text-xs font-medium">{v.name}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Home() {
  // Shopping is always available. Selling is an optional capability from the account menu.
  return <HomeContent />;
}

// Helper component for redirect - properly implemented with useNavigate
function RedirectTo({ path }: { path: string }) {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate({ to: path as any, replace: true });
  }, [navigate, path]);
  return null; // Render nothing during redirect
}

// Role selection component
function RoleSelection({ onChoiceSelected }: { onChoiceSelected: (choice: 'customer' | 'vendor') => void }) {
  return (
    <div className="w-full max-w-xl p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Welcome to Marketplace Hub</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          How would you like to use our marketplace?
        </p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={() => onChoiceSelected('customer')}
          className="w-full py-3 text-left flex items-center gap-4"
        >
          <Store className="h-5 w-5" />
          <div>
            <h2 className="font-semibold text-foreground">Shop as a Customer</h2>
            <p className="text-sm text-muted-foreground">
              Browse products, buy from independent stores, and enjoy personalized recommendations
            </p>
          </div>
        </Button>

        <Button
          onClick={() => onChoiceSelected('vendor')}
          className="w-full py-3 text-left flex items-center gap-4"
          variant="outline"
        >
          <Package className="h-5 w-5" />
          <div>
            <h2 className="font-semibold text-foreground">Sell as a Vendor</h2>
            <p className="text-sm text-muted-foreground">
              Create your own store, list products, and manage your business
            </p>
          </div>
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        You can change your preference anytime in your profile settings
      </div>
    </div>
  );
}

// Customer questions component
function CustomerQuestions({ onQuestionsSaved }: { onQuestionsSaved: () => void }) {
  const [form, setForm] = React.useState({
    categories: [] as string[],
    priority: '',
    shoppingFor: ''
  });

  const categories = [
    'Clothing',
    'Electronics',
    'Home & Garden',
    'Handmade',
    'Beauty',
    'Books',
    'Sports',
    'Toys'
  ];

  const priorities = [
    'Low prices',
    'High quality',
    'Unique/handmade items',
    'Fast delivery',
    'Supporting small businesses'
  ];

  const shoppingForOptions = [
    { label: 'For myself', value: 'myself' },
    { label: 'As gifts', value: 'gifts' },
    { label: 'Both', value: 'both' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    if (form.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    if (!form.priority) {
      alert('Please select what\'s most important to you');
      return;
    }
    if (!form.shoppingFor) {
      alert('Please tell us who you\'re shopping for');
      return;
    }

    // Save preferences to localStorage (namespaced)
    localStorage.setItem('customerPreferences', JSON.stringify(form));
    onQuestionsSaved();
  };

  return (
    <div className="w-full max-w-xl p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Help us personalize your experience</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Answer a few questions so we can show you relevant products and stores
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground mb-3">What categories interest you most?</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-2 p-3 border rounded hover:border-primary">
                <input
                  type="checkbox"
                  checked={form.categories.includes(category)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm(prev => ({
                      ...prev,
                      categories: checked
                        ? [...prev.categories, category]
                        : prev.categories.filter(c => c !== category)
                    }));
                  }}
                  className="h-4 w-4 text-primary"
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-foreground mb-3">What's most important when shopping?</h2>
          <div className="space-y-3">
            {priorities.map((priority) => (
              <label key={priority} className="flex items-center gap-3 p-3 border rounded hover:border-primary">
                <input
                  type="radio"
                  name="priority"
                  checked={form.priority === priority}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, priority: e.target.value }));
                  }}
                  className="h-4 w-4 text-primary"
                />
                <span>{priority}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-foreground mb-3">Are you shopping for yourself or as gifts?</h2>
          <div className="space-y-3">
            {shoppingForOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-3 p-3 border rounded hover:border-primary">
                <input
                  type="radio"
                  name="shoppingFor"
                  checked={form.shoppingFor === option.value}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, shoppingFor: e.target.value }));
                  }}
                  className="h-4 w-4 text-primary"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="py-2 px-6">
            Save preferences and start shopping
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Your preferences help us show you better recommendations. You can update them anytime.
        </p>
      </div>
    </div>
  );
}
