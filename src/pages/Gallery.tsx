import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/layouts/MainLayout";
import { X } from "lucide-react";
import { getGallery } from "@/lib/api";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

  const { data: galleryImages = [], isLoading, error } = useQuery({
    queryKey: ["gallery"],
    queryFn: getGallery,
  });

  const images = Array.isArray(galleryImages) ? galleryImages : [];

  return (
    <MainLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-primary tracking-[0.3em] uppercase text-sm mb-4">
              Visual Journey
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-foreground mb-6">
              Gallery
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A glimpse into the world of Ember — where artistry meets ambiance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          {error && (
            <p className="text-center text-muted-foreground font-body py-12">
              Unable to load gallery. Please try again later.
            </p>
          )}
          {!error && isLoading && (
            <p className="text-center text-muted-foreground font-body py-12">Loading gallery…</p>
          )}
          {!error && !isLoading && images.length === 0 && (
            <p className="text-center text-muted-foreground font-body py-12">No photos in the gallery yet.</p>
          )}
          {!error && !isLoading && images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image: { id: number; imageUrl: string; title?: string; caption?: string }, index: number) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`group relative cursor-pointer overflow-hidden rounded-lg ${
                    index === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                  onClick={() =>
                    setSelectedImage({
                      src: image.imageUrl,
                      alt: image.title || image.caption || "Gallery image",
                    })
                  }
                >
                  <div
                    className={`${
                      index === 0 ? "aspect-square md:aspect-[4/3]" : "aspect-square"
                    } relative`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.title || image.caption || "Gallery"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-center">
                        {image.caption && (
                          <span className="text-primary text-xs tracking-widest uppercase">
                            {image.caption}
                          </span>
                        )}
                        <p className="font-display text-lg text-foreground mt-2">
                          {image.title || image.caption || "Gallery"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg flex items-center justify-center p-6"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-colors"
              onClick={() => setSelectedImage(null)}
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default Gallery;
