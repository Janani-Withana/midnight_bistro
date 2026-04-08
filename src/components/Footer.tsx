import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
];

export function Footer() {
  return (
    <footer className="bg-charcoal-dark border-t border-border/30">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h2 className="font-display text-3xl text-gradient-gold mb-4">
              EMBER
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Where darkness meets flavor. An intimate culinary journey through
              the senses.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg text-foreground mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span>123 Shadow Lane, New York, NY</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>+1 (555) 234-5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span>hello@ember.restaurant</span>
              </li>
            </ul>
          </div>

          {/* Hours & Social */}
          <div>
            <h3 className="font-display text-lg text-foreground mb-4">Hours</h3>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li>Tuesday - Thursday: 6pm - 11pm</li>
              <li>Friday - Saturday: 5pm - 12am</li>
              <li>Sunday - Monday: Closed</li>
            </ul>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2024 Ember Restaurant. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link
              to="/reserve"
              className="hover:text-primary transition-colors"
            >
              Reservations
            </Link>
            <Link to="/menu" className="hover:text-primary transition-colors">
              Menu
            </Link>
            <Link to="/about" className="hover:text-primary transition-colors">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
