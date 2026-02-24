import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="section-border-top" role="contentinfo" itemScope itemType="https://schema.org/WPFooter">
      <div className="container-custom">
        {/* Massive brand name */}
        <div className="py-16 section-border">
          <h3 className="text-[12vw] md:text-[10vw] lg:text-[8vw] font-bold leading-none tracking-tighter text-foreground">
            NexYatra
          </h3>
        </div>

        {/* Four columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {/* Destinations */}
          <nav className="p-6 md:p-8 border-b sm:border-r border-border" aria-label="Quick links">
            <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">Destinations</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/destinations" className="text-sm text-foreground hover:text-muted-foreground transition-colors hover-underline">
                  All Destinations
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="text-sm text-foreground hover:text-muted-foreground transition-colors hover-underline">
                  Featured
                </Link>
              </li>
            </ul>
          </nav>

          {/* About */}
          <nav className="p-6 md:p-8 border-b lg:border-r border-border" aria-label="About links">
            <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">About</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-foreground hover:text-muted-foreground transition-colors hover-underline">
                  About Us
                </Link>
              </li>
            </ul>
          </nav>

          {/* Support */}
          <nav className="p-6 md:p-8 border-b sm:border-r border-border" aria-label="Support links">
            <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-foreground hover:text-muted-foreground transition-colors hover-underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-foreground hover:text-muted-foreground transition-colors hover-underline">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-sm text-foreground hover:text-muted-foreground transition-colors hover-underline">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-foreground hover:text-muted-foreground transition-colors hover-underline">
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div className="p-6 md:p-8 border-b border-border">
            <h4 className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">Contact</h4>
            <address className="not-italic space-y-3" itemScope itemType="https://schema.org/LocalBusiness">
              <meta itemProp="name" content="NexYatra Travel Agency" />
              <a href="tel:+918347015725" className="flex items-center gap-2 text-sm text-foreground hover:text-muted-foreground transition-colors" itemProp="telephone">
                <Phone size={14} aria-hidden="true" />
                +91 8347015725
              </a>
              <a href="mailto:info@nexyatra.in" className="flex items-center gap-2 text-sm text-foreground hover:text-muted-foreground transition-colors" itemProp="email">
                <Mail size={14} aria-hidden="true" />
                info@nexyatra.in
              </a>
            </address>
            {/* Social */}
            <div className="flex gap-4 mt-6">
              <a href="https://www.facebook.com/nexyatra.2025" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Follow NexYatra on Facebook" rel="noopener noreferrer" target="_blank">
                <Facebook size={16} aria-hidden="true" />
              </a>
              <a href="https://x.com/NexYatra89312" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Follow NexYatra on X (Twitter)" rel="noopener noreferrer" target="_blank">
                <Twitter size={16} aria-hidden="true" />
              </a>
              <a href="https://www.instagram.com/nexyatra" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Follow NexYatra on Instagram" rel="noopener noreferrer" target="_blank">
                <Instagram size={16} aria-hidden="true" />
              </a>
              <a href="https://www.youtube.com/@nexyatra" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Subscribe to NexYatra on YouTube" rel="noopener noreferrer" target="_blank">
                <Youtube size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar — copyright + address badge */}
        <div className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} NexYatra. All rights reserved.</p>
            <p className="mt-1">
              Designed with{" "}
              <span role="img" aria-label="love">❤️</span>{" "}
              for explorers worldwide.
            </p>
          </div>

          {/* Address badge — "Server Location" style */}
          <div className="border border-border px-4 py-3 text-xs font-mono text-muted-foreground" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
            <div className="flex items-center gap-2">
              <MapPin size={12} aria-hidden="true" />
              <span>
                <span itemProp="streetAddress">320 Exult Shoppers, Nr. Siddhi Vinayak Temple, Vesu Main Road</span>{" · "}
                <span itemProp="addressLocality">Vesu, Surat</span>{", "}
                <span itemProp="addressRegion">Gujarat</span>{" "}
                <span itemProp="postalCode">395007</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
