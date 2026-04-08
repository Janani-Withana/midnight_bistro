import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/layouts/MainLayout";
import { getCategories, getMenuItems } from "@/lib/api";

function formatPrice(price: number) {
  if (typeof price !== "number" || Number.isNaN(price)) return "LKR 0";
  return `LKR ${Number(price)}`;
}

type Category = { id: number; name: string };
type MenuItem = { id: number; name: string; description?: string; price: number; categoryId: number; imageUrl?: string | null };

const Menu = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const categories: Category[] = Array.isArray(categoriesData) ? categoriesData : [];

  const { data: menuItemsData, isLoading: menuLoading, error: menuError } = useQuery({
    queryKey: ["menuItems"],
    queryFn: () => getMenuItems(),
  });
  const allMenuItems: MenuItem[] = Array.isArray(menuItemsData) ? menuItemsData : [];

  const activeId = activeCategoryId ?? categories[0]?.id ?? null;
  const menuItems = activeId
    ? allMenuItems.filter((item) => item.categoryId === activeId)
    : allMenuItems;
  const isLoading = categoriesLoading || menuLoading;
  const error = categoriesError || menuError;

  return (
    <MainLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-wine/10 via-transparent to-transparent" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-primary tracking-[0.3em] uppercase text-sm mb-4">
              Culinary Artistry
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-foreground mb-6">
              Our Menu
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each dish is crafted with passion, precision, and the finest ingredients
              from around the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Menu Content */}
      <section className="pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          {error && (
            <div className="text-center py-12 text-destructive font-body">
              Failed to load menu. Please try again later.
            </div>
          )}

          {!error && (
            <>
              {/* Category Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap justify-center gap-2 md:gap-4 mb-16"
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm tracking-widest uppercase transition-all duration-300 ${
                      activeId === cat.id
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </motion.div>

              {isLoading ? (
                <div className="text-center py-16 text-muted-foreground font-body">
                  Loading menu…
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                  >
                    {menuItems.map((item, index) => (
                      <motion.article
                        key={item.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group relative rounded-xl overflow-hidden bg-card border border-border/20 hover:border-primary/40 transition-all duration-500 hover:shadow-glow"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-4xl font-display text-muted-foreground">
                              {item.name.charAt(0)}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                          <div className="absolute top-3 right-3 bg-background/70 backdrop-blur-md px-3 py-1 rounded-full">
                            <span className="font-display text-sm text-primary">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-display text-base md:text-lg text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                              {item.description || ""}
                            </p>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center text-muted-foreground text-sm mt-16"
              >
                * Prices are subject to seasonal availability. Gratuity of 20% is
                added to parties of 6 or more.
              </motion.p>
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Menu;
