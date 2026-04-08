import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function AboutTeaser() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-0 w-1/2 h-96 bg-gradient-to-r from-wine/20 to-transparent -translate-y-1/2 blur-3xl" />
      <div className="absolute top-1/2 right-0 w-1/3 h-64 bg-gradient-to-l from-primary/10 to-transparent -translate-y-1/2 blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary tracking-[0.3em] uppercase text-sm mb-4">
              Our Story
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              A Symphony of
              <span className="block text-gradient-gold mt-2">
                Shadows & Taste
              </span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Born from the depths of culinary passion, Ember emerged as a
                sanctuary for those who seek more than a meal — an experience
                that transcends the ordinary.
              </p>
              <p>
                Chef Marcus Holloway brings two decades of mastery from the
                world's most celebrated kitchens, crafting each plate as a
                canvas of emotion and flavor.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8"
            >
              <Button variant="elegant" size="lg" asChild>
                <Link to="/about">Discover Our Story</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] bg-gradient-to-br from-charcoal-light to-charcoal rounded-lg overflow-hidden border border-border/20">
              {/* Decorative elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-8">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="font-display text-8xl md:text-9xl text-primary/20 mb-4"
                  >
                    "
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="font-display text-xl md:text-2xl text-foreground italic"
                  >
                    Every dish is a love letter
                    <br />
                    written in flame and shadow
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-primary mt-6 tracking-widest uppercase text-sm"
                  >
                    — Chef Marcus Holloway
                  </motion.p>
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-primary/30" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-primary/30" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
