import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const timeline = [
  {
    year: "2010",
    title: "The Vision",
    description:
      "Chef Marcus Holloway dreams of a restaurant where dining transcends mere sustenance — a temple of culinary artistry bathed in shadow and light.",
  },
  {
    year: "2015",
    title: "World Journey",
    description:
      "After training in Tokyo, Paris, and Copenhagen, Marcus refines his philosophy — that darkness enhances flavor, and mystery amplifies memory.",
  },
  {
    year: "2019",
    title: "Ember Ignites",
    description:
      "In a hidden corner of the city, Ember opens its doors. Word spreads through whispers, and the initiated discover a new realm of gastronomy.",
  },
  {
    year: "Today",
    title: "The Legacy Continues",
    description:
      "With two Michelin stars and a devoted following, Ember remains committed to pushing boundaries while honoring the flame that started it all.",
  },
];

const values = [
  {
    title: "Ingredient Obsession",
    description:
      "We source the finest ingredients from trusted purveyors worldwide, celebrating seasonality and provenance.",
  },
  {
    title: "Artistic Expression",
    description:
      "Every plate is a canvas. Every flavor combination, a statement. We create to move, to challenge, to inspire.",
  },
  {
    title: "Intimate Experience",
    description:
      "With only 32 seats, we ensure every guest receives the attention and care they deserve.",
  },
];

const About = () => {
  const timelineRef = useRef(null);
  const valuesRef = useRef(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: "-100px" });
  const valuesInView = useInView(valuesRef, { once: true, margin: "-100px" });

  return (
    <MainLayout>
      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-wine/20 via-transparent to-primary/5" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-primary tracking-[0.3em] uppercase text-sm mb-4">
              Our Philosophy
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-foreground mb-6">
              The Story of
              <span className="block text-gradient-gold mt-2">Ember</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We believe that dining is not merely about nourishment — it's
              about creating moments that linger in memory long after the last
              course is served.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6 bg-charcoal">
        <div className="container mx-auto max-w-4xl" ref={timelineRef}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={timelineInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl text-center text-foreground mb-16"
          >
            Our Journey
          </motion.h2>

          <div className="relative">
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent -translate-x-1/2 hidden md:block" />

            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={timelineInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`flex flex-col md:flex-row items-center gap-8 mb-16 last:mb-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div
                  className={`flex-1 text-center ${
                    index % 2 === 0 ? "md:text-right" : "md:text-left"
                  }`}
                >
                  <span className="text-primary font-display text-2xl">
                    {item.year}
                  </span>
                  <h3 className="font-display text-2xl text-foreground mt-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Center point */}
                <div className="w-4 h-4 rounded-full bg-primary hidden md:block flex-shrink-0" />

                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6" ref={valuesRef}>
        <div className="container mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl text-center text-foreground mb-16"
          >
            What We Stand For
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                className="p-8 bg-card border border-border/20 rounded-lg text-center"
              >
                <h3 className="font-display text-xl text-primary mb-4">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-background to-wine/10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="font-display text-4xl text-foreground mb-6">
            Experience the Story
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join us for an evening where every bite writes a new chapter.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/reserve">Reserve Your Table</Link>
          </Button>
        </motion.div>
      </section>
    </MainLayout>
  );
};

export default About;
