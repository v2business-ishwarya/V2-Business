import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About Us — V2 Business" }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">About V2 Business</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Empowering independent vendors and connecting them directly with customers across the nation.
          </p>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-primary">
          <h3>Our Mission</h3>
          <p>
            V2 Business (Marketplace Hub) was built with a simple goal: to create a fair, transparent, and powerful platform for independent sellers. We believe that everyone should have the tools to start and grow their own business without paying exorbitant platform fees or losing control of their brand.
          </p>

          <h3>How We Work</h3>
          <p>
            We are a multi-vendor marketplace. When you buy from V2 Business, you are buying directly from independent store owners. 
            We simply provide the secure payment gateways (like Razorpay and Cashfree) and reliable delivery integrations (like Delhivery and Shiprocket) to make sure your transaction is safe and your products arrive on time.
          </p>

          <h3>For Vendors</h3>
          <p>
            We offer a 0% sales commission model with ₹500/month flat fee, ensuring that 100% of your product earnings stay directly in your pocket. 
            With automated invoicing, integrated logistics, and comprehensive analytics, we handle the heavy lifting so you can focus on making great products.
          </p>

          <h3>Our Promise</h3>
          <p>
            Whether you are a customer looking for unique products or a vendor looking for a home for your business, V2 Business is committed to providing a secure, fast, and reliable marketplace experience.
          </p>
        </div>
      </div>
    </div>
  );
}
