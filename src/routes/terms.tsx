import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms and Conditions — V2 Business" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Terms and Conditions</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: August 2026</p>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:font-semibold">
          <h2>1. Introduction</h2>
          <p>
            Welcome to V2 Business ("Marketplace Hub"). By accessing our website, you agree to be bound by these Terms and Conditions. Please read them carefully before using our platform.
          </p>

          <h2>2. For Customers</h2>
          <p>
            V2 Business acts as a facilitator between independent vendors and buyers. When you purchase an item, you are buying directly from the vendor. 
            While we ensure secure payment processing through our partners, product quality, warranties, and direct delivery are managed by the respective vendors.
            <ul>
              <li>All prices are inclusive of taxes unless stated otherwise.</li>
              <li>Separate invoices will be generated for products ordered from different vendors in a single checkout.</li>
            </ul>
          </p>

          <h2>3. For Vendors</h2>
          <p>
            By registering as a vendor, you agree to fulfill orders promptly and accurately.
            <ul>
              <li><strong>Commission:</strong> A standard platform commission of 10% (unless modified by admin) will be deducted from your total order value.</li>
              <li><strong>Payments:</strong> Settlements are processed to your linked bank account after the delivery is successfully confirmed.</li>
              <li><strong>Delivery:</strong> You may choose to deliver items yourself or use our integrated partners (Delhivery, Shiprocket). You must adhere to the delivery timelines provided to the customer.</li>
            </ul>
          </p>

          <h2>4. Payments and Refunds</h2>
          <p>
            We process payments through secure, RBI-compliant third-party gateways (Razorpay, Cashfree). 
            Refunds will be processed to the original source of payment within 5-7 business days of a return being approved by the vendor or platform admin.
          </p>

          <h2>5. Prohibited Items</h2>
          <p>
            Vendors may not sell illegal, counterfeit, hazardous, or restricted items. Any violation will result in immediate store suspension.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            V2 Business is not liable for indirect, incidental, or consequential damages arising from the use of our platform or products purchased through it.
          </p>

          <h2>7. Contact</h2>
          <p>
            If you have any questions regarding these terms, please visit our <a href="/contact" className="text-primary hover:underline">Contact Us</a> page.
          </p>
        </div>
      </div>
    </div>
  );
}
