import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";

export function ReservationCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-wine/20 to-background" />
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-4">
            Experience Ember
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            Reserve Your
            <span className="block text-gradient-gold mt-2">Evening</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-xl mx-auto">
            Join us for an unforgettable evening of culinary artistry.
            Reservations recommended.
          </p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            {[
              { icon: Calendar, label: "Open Tue-Sat" },
              { icon: Clock, label: "5pm - Midnight" },
              { icon: Users, label: "Intimate Setting" },
            ].map((item, index) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-muted-foreground text-sm">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/reserve">Make a Reservation</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
