import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getMenuItems } from "@/lib/api";

function formatPrice(price: number) {
  if (typeof price !== "number" || Number.isNaN(price)) return "LKR 0";
  return `LKR ${Number(price)}`;
}

export function FeaturedDishes() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: menuItems = [] } = useQuery({
    queryKey: ["menuItems", "featured"],
    queryFn: () => getMenuItems(),
  });
  const dishes = menuItems.slice(0, 3);

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-background via-charcoal to-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-4">
            Our Signature
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground">
            Featured Dishes
          </h2>
        </motion.div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {dishes.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground font-body py-8">
              No featured dishes yet. Check back soon.
            </p>
          ) : (
            dishes.map((dish: { id: number; name: string; description?: string; price: number; imageUrl?: string | null }, index: number) => (
              <motion.article
                key={dish.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                className="group"
              >
                <div className="menu-card bg-card rounded-lg overflow-hidden border border-border/30">
                  <div className="relative aspect-square overflow-hidden">
                    {dish.imageUrl ? (
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-5xl font-display text-muted-foreground">
                        {dish.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-md">
                      <span className="font-display text-xl text-primary">
                        {formatPrice(dish.price)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl md:text-2xl text-foreground mb-2">
                      {dish.name}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {dish.description || ""}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Button variant="elegant" size="lg" asChild>
            <Link to="/menu">View Full Menu</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
