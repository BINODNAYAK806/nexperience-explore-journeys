import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const RefundPolicy = () => {
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
          <h1 className="text-4xl font-bold mb-2">Cancellation & Refund Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated on {new Date().toLocaleDateString('en-GB')}</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p>
              At NexYatra, we understand that travel plans may change. Please review our cancellation and refund policy below:
            </p>

            <ol className="list-decimal pl-6 space-y-4">
              <li>
                Customers can cancel their booking up to 24 hours before the scheduled travel date.
              </li>

              <li>
                Cancellations made after this period will not be eligible for a refund.
              </li>

              <li>
                All eligible refunds will be credited back to the original mode of payment.
              </li>

              <li>
                Refunds are typically credited within 8–10 working days.
              </li>

              <li>
                Processing time may vary depending on the customer's bank or payment provider.
              </li>

              <li>
                Partial refunds, if applicable, will be based on the services utilized before cancellation.
              </li>

              <li>
                No refunds will be provided for no-show or last-minute cancellations.
              </li>

              <li>
                In case of trip rescheduling, standard cancellation rules will apply.
              </li>

              <li>
                The company reserves the right to modify or update the policy at any time.
              </li>

              <li>
                For any refund-related queries, customers can contact our support team.
              </li>
            </ol>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-muted-foreground">
                For any questions regarding cancellations or refunds, please{" "}
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

export default RefundPolicy;
