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
          <p className="text-muted-foreground mb-8">Last updated on 27-11-2025 23:11:59</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p>
              Nexyatra believes in helping its customers as far as possible, and has therefore a liberal cancellation
              policy. Under this policy:
            </p>

            <ul className="list-disc pl-6 space-y-4">
              <li>
                Cancellations will be considered only if the request is made immediately after placing the order.
                However, the cancellation request may not be entertained if the orders have been communicated to the
                vendors/merchants and they have initiated the process of shipping them.
              </li>

              <li>
                Nexyatra does not accept cancellation requests for perishable items like flowers, eatables etc. However,
                refund/replacement can be made if the customer establishes that the quality of product delivered is not
                good.
              </li>

              <li>
                In case of receipt of damaged or defective items please report the same to our Customer Service team.
                The request will, however, be entertained once the merchant has checked and determined the same at his
                own end. This should be reported within 2 Days of receipt of the products. In case you feel that the
                product received is not as shown on the site or as per your expectations, you must bring it to the notice of
                our customer service within 2 Days of receiving the product. The Customer Service Team after
                looking into your complaint will take an appropriate decision.
              </li>

              <li>
                In case of complaints regarding products that come with a warranty from manufacturers, please refer
                the issue to them. In case of any Refunds approved by the Nexyatra, it will take 1-2 Days for the
                refund to be processed to the end customer.
              </li>
            </ul>

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
