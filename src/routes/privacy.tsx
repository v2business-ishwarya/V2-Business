import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — V2 Business" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: August 2026</p>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:font-semibold">
          <h2>1. Information We Collect</h2>
          <p>
            When you use V2 Business, we collect the following types of information:
            <ul>
              <li><strong>Personal Data:</strong> Name, email address, phone number, and delivery address.</li>
              <li><strong>Vendor Data:</strong> Business registration details, bank account information, PAN/GST (where applicable).</li>
              <li><strong>Usage Data:</strong> How you interact with our website, IP address, and browser information.</li>
            </ul>
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            Your information is primarily used to facilitate the marketplace experience:
            <ul>
              <li>To process orders and generate invoices.</li>
              <li>To allow vendors and delivery partners (e.g., Delhivery, Shiprocket) to fulfill and track your orders.</li>
              <li>To process payments and settlements securely.</li>
              <li>To communicate with you regarding order status, promotions, or support inquiries.</li>
            </ul>
          </p>

          <h2>3. Data Sharing and Disclosure</h2>
          <p>
            As a marketplace, we must share certain information with third parties:
            <ul>
              <li><strong>Vendors:</strong> Receive your name and delivery address to ship your products.</li>
              <li><strong>Delivery Partners:</strong> Receive your address and phone number for shipping and tracking.</li>
              <li><strong>Payment Processors:</strong> We use Razorpay and Cashfree to process payments. We do not store your credit card or UPI details on our servers.</li>
            </ul>
            We never sell your personal data to third-party marketers.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement standard security measures to protect your data, including encryption in transit (HTTPS) and secure database hosting. 
            However, no system is entirely foolproof, and we cannot guarantee absolute security.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information. If you wish to close your account or request data deletion, please <a href="/contact" className="text-primary hover:underline">contact our support team</a>.
          </p>

          <h2>6. Changes to this Policy</h2>
          <p>
            We may update this policy periodically. We will notify you of any significant changes by posting the new policy on this page.
          </p>
        </div>
      </div>
    </div>
  );
}
