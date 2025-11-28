import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated on {new Date().toLocaleDateString('en-GB')}</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p>
              This Privacy Policy explains how we collect, use, store, and protect your personal information when you access our website or use our services. By using our platform, you agree to the practices described below.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>Personal details such as name, phone number, email address, and ID proof submitted during booking.</li>
              <li>Payment-related information (processed securely through trusted payment gateways; we do not store card details).</li>
              <li>Booking preferences, travel details, and communication history.</li>
              <li>Technical information such as IP address, browser type, and device information collected through cookies.</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>To process bookings, confirmations, and travel arrangements.</li>
              <li>To communicate important updates, itineraries, and customer support information.</li>
              <li>To improve website performance, user experience, and service quality.</li>
              <li>To send promotional offers or updates (only with your consent).</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Sharing of Information</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>We may share necessary details with travel partners, hotels, transport providers, and other service vendors to complete your booking.</li>
              <li>We do not sell, rent, or trade your personal information to third parties for marketing purposes.</li>
              <li>Information may be shared if required by law, government authorities, or for safety reasons.</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Protection & Security</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>We use secure servers, encryption, and industry-standard measures to protect your personal information.</li>
              <li>Although we take strong precautions, no online platform can guarantee 100% security.</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Cookies & Tracking</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>Our website uses cookies to enhance browsing experience and understand user behavior.</li>
              <li>You can choose to disable cookies in your browser settings, but some features may not function properly.</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for their privacy practices or content. Users should review their policies separately.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Your Rights</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>You can request access, correction, or deletion of your personal information.</li>
              <li>You may opt out of promotional emails anytime by contacting us.</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Policy Updates</h2>
            <p>
              We may update this Privacy Policy periodically. Continued use of the website signifies acceptance of the updated policy.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Information</h2>
            <p>
              For any questions or concerns about this Privacy Policy, you can reach us at our customer support email or contact number.
            </p>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please{" "}
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

export default PrivacyPolicy;
