import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container-custom max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="bg-card rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-muted-foreground mb-8">Last updated on {new Date().toLocaleDateString('en-GB')}</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p>
              Welcome to our website. By accessing, browsing, or using our services, you agree to the following Terms & Conditions. Please read them carefully before proceeding.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. General</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>These Terms & Conditions govern all bookings and services made through our website.</li>
              <li>By using the site, you acknowledge that you have read, understood, and agreed to these terms.</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Booking & Payments</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>All bookings are subject to availability and confirmation.</li>
              <li>Customers must provide accurate personal and contact information during the booking process.</li>
              <li>Prices mentioned on the website may change without prior notice due to operational or external factors.</li>
              <li>Full or partial payment must be made as per the booking requirements.</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Customer Responsibilities</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>Travellers must carry valid ID proof and required travel documents at all times.</li>
              <li>It is the customer's responsibility to review itinerary details, inclusions, exclusions, and guidelines before booking.</li>
              <li>Any incorrect information provided by the customer may lead to booking issues for which the company is not liable.</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Changes, Rescheduling & Cancellations</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>The company reserves the right to modify or cancel bookings in case of operational reasons, safety concerns, or unforeseen events.</li>
              <li>Any changes requested by the customer will be subject to availability and additional charges, if applicable.</li>
              <li>Cancellations and refunds will be processed strictly as per our <Link to="/refund" className="text-primary hover:underline">Refund Policy</Link>.</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Limitations of Liability</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>The company is not responsible for delays, cancellations, or changes caused by weather, natural calamities, government restrictions, or any event beyond our control.</li>
              <li>We shall not be liable for loss of belongings, personal injury, or expenses incurred due to unforeseen circumstances.</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Website Usage</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>Users must not misuse the website by attempting unauthorized access or engaging in activities that may harm our systems.</li>
              <li>All content, images, and information on the website are protected and cannot be copied or reproduced without permission.</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Dispute Resolution</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>All disputes arising out of bookings, payments, or website usage will be handled under the jurisdiction of India.</li>
              <li>Customers agree to cooperate in resolving issues amicably before pursuing legal remedies.</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Acceptance of Terms</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>By using our website or booking services, you automatically accept all the Terms & Conditions stated above.</li>
              <li>The company reserves the right to update or modify these terms at any time without prior notice.</li>
            </ol>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-muted-foreground">
                If you have any questions about these Terms & Conditions, please{" "}
                <Link to="/contact" className="text-primary hover:underline">
                  contact us
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
