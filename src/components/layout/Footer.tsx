
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import AboutUs from "@/pages/AboutUs";
const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 pt-16 pb-8">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              NexYatra
            </h3>
            <p className="text-muted-foreground">
              Redefining travel experiences with immersive storytelling and personalized journeys.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/nexyatra.2025" className="text-gray-500 hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://x.com/NexYatra89312" className="text-gray-500 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://www.instagram.com/nexyatra" className="text-gray-500 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.youtube.com/@nexyatra" className="text-gray-500 hover:text-primary transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/destinations" className="text-muted-foreground hover:text-primary transition-colors hover-underline">
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors hover-underline">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Support</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors hover-underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors hover-underline">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-muted-foreground hover:text-primary transition-colors hover-underline">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors hover-underline">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-primary" />
                <span className="text-muted-foreground">+91 8347015725</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-primary" />
                <span className="text-muted-foreground">info@nexyatra.in</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-primary mt-1" />
                <span className="text-muted-foreground text-sm">
                  320 Exult Shoppers<br />
                  Nr. Siddhi Vinayak Temple, Vesu Main Road,<br />
                  Vesu, Surat, Gujarat 395007
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="py-8 border-t border-b border-border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-xl font-semibold mb-2">Subscribe to Our Newsletter</h4>
              <p className="text-muted-foreground">Stay updated with exclusive travel offers and destination insights.</p>
            </div>
            <div className="flex w-full max-w-md">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 min-w-0 px-4 py-3 bg-background border border-r-0 border-input rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-r-md font-medium hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} NexYatra. All rights reserved.</p>
          <p className="mt-2">
            Designed with{" "}
            <span role="img" aria-label="love">
              ❤️
            </span>{" "}
            for explorers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
