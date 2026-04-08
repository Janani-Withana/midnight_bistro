import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getAdminGallery,
  createAdminGalleryImage,
  deleteAdminGalleryImage,
  uploadAdminImage,
} from "@/lib/api";

type GalleryImage = {
  id: number;
  imageUrl: string;
  title?: string;
  caption?: string;
  sortOrder?: number;
};

export function AdminGalleryManager() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: galleryData, isLoading, error } = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: getAdminGallery,
  });
  const galleryImages: GalleryImage[] = Array.isArray(galleryData) ? galleryData : [];

  const createMutation = useMutation({
    mutationFn: (body: { imageUrl: string; title?: string; caption?: string }) =>
      createAdminGalleryImage(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
      setUploadOpen(false);
      setUploadForm({ imageUrl: "", title: "", caption: "" });
      setUploading(false);
    },
    onError: () => setUploading(false),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminGalleryImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
    },
  });

  const [uploadForm, setUploadForm] = useState({ imageUrl: "", title: "", caption: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const { url } = await uploadAdminImage(file);
      setUploadForm((f) => ({ ...f, imageUrl: url }));
      setPreviewUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const url = uploadForm.imageUrl.trim();
    if (!url) {
      setUploadError("Image is required. Upload a file or paste a URL.");
      return;
    }
    setUploadError(null);
    createMutation.mutate({
      imageUrl: url,
      title: uploadForm.title.trim() || undefined,
      caption: uploadForm.caption.trim() || undefined,
    });
  };

  if (error) {
    return (
      <div className="text-destructive font-body py-4">
        Failed to load gallery. You may need to sign in again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground font-body">
          {galleryImages.length} photo{galleryImages.length !== 1 ? "s" : ""}
        </p>
        <Button variant="hero" size="sm" className="gap-2" onClick={() => setUploadOpen(true)}>
          <Plus className="w-4 h-4" /> Upload Photo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground font-body py-12">Loading gallery…</p>
      ) : galleryImages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 py-16 text-center">
          <p className="text-sm text-muted-foreground font-body">No photos yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Upload a photo to show on the Gallery page.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
            onClick={() => setUploadOpen(true)}
          >
            <Plus className="w-4 h-4" /> Upload Photo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative group rounded-xl overflow-hidden aspect-square bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <img
                src={img.imageUrl}
                alt={img.title || "Gallery"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body text-foreground truncate">{img.title || "Untitled"}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground"
                    asChild
                  >
                    <a href={img.imageUrl} target="_blank" rel="noopener noreferrer" aria-label="View full size">
                      <Eye className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (window.confirm("Delete this photo from the gallery?")) {
                        deleteMutation.mutate(img.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    aria-label={`Delete ${img.title || "photo"}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload gallery photo</DialogTitle>
            <DialogDescription>
              Upload an image or paste a URL. It will appear on the public Gallery page.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitUpload} className="space-y-4">
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="sr-only"
                    onChange={handleUploadFile}
                    disabled={uploading}
                  />
                  <span className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-body hover:bg-muted/50">
                    {uploading ? "Uploading…" : "Choose file"}
                  </span>
                </label>
                <Input
                  type="text"
                  placeholder="Or paste image URL"
                  value={uploadForm.imageUrl}
                  onChange={(e) => {
                    setUploadForm((f) => ({ ...f, imageUrl: e.target.value }));
                    setPreviewUrl(e.target.value.trim() || null);
                  }}
                  className="bg-background border-border"
                />
              </div>
              {previewUrl && (
                <div className="mt-2 rounded-md border border-border overflow-hidden w-24 h-24">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setPreviewUrl(null)} />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-title">Title (optional)</Label>
              <Input
                id="gallery-title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Restaurant Interior"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-caption">Caption (optional)</Label>
              <Input
                id="gallery-caption"
                value={uploadForm.caption}
                onChange={(e) => setUploadForm((f) => ({ ...f, caption: e.target.value }))}
                placeholder="e.g. Ambiance"
                className="bg-background border-border"
              />
            </div>
            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={createMutation.isPending || !uploadForm.imageUrl.trim()}>
                {createMutation.isPending ? "Adding…" : "Add to gallery"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
