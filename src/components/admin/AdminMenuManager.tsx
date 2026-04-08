import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, FolderPlus, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAdminCategories,
  getAdminMenuItems,
  createAdminCategory,
  createAdminMenuItem,
  updateAdminCategory,
  updateAdminMenuItem,
  deleteAdminCategory,
  deleteAdminMenuItem,
  uploadAdminImage,
} from "@/lib/api";

function formatPrice(price: number) {
  if (typeof price !== "number" || Number.isNaN(price)) return "LKR 0";
  return `LKR ${Number(price)}`;
}

function SortableCategoryRow({
  cat,
  itemCount,
  onEdit,
  onDelete,
  isDeleting,
}: {
  cat: Category;
  itemCount: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${isDragging ? "opacity-60 bg-muted/30 z-10" : ""}`}
    >
      <td className="px-2 py-3 w-10">
        <button
          type="button"
          className="p-1.5 rounded cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-muted/50 touch-none"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${cat.name}`}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="px-4 py-3">
        <span className="font-medium text-foreground font-body">{cat.name}</span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground font-body">{itemCount}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-xs font-medium border border-primary/30 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary/50 hover:shadow-sm transition-all duration-200"
            aria-label={`Edit ${cat.name}`}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-xs font-medium border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/15 hover:border-destructive/50 hover:shadow-sm disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
            aria-label={`Delete ${cat.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

type Category = { id: number; name: string; sortOrder?: number };
type MenuItem = {
  id: number;
  name: string;
  categoryId: number;
  description?: string;
  price: number;
  imageUrl?: string | null;
  available: boolean;
};

export function AdminMenuManager() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getAdminCategories,
  });
  const categories: Category[] = Array.isArray(categoriesData) ? categoriesData : [];
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);

  useEffect(() => {
    setOrderedCategories(categories);
  }, [categories]);

  const { data: menuItemsData, isLoading, error } = useQuery({
    queryKey: ["admin", "menuItems"],
    queryFn: () => getAdminMenuItems(),
  });
  const menuItems: MenuItem[] = Array.isArray(menuItemsData) ? menuItemsData : [];

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => deleteAdminMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menuItems"] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => deleteAdminCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "menuItems"] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { name?: string; sortOrder?: number } }) =>
      updateAdminCategory(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedCategories.findIndex((c) => c.id === active.id);
    const newIndex = orderedCategories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(orderedCategories, oldIndex, newIndex);
    setOrderedCategories(newOrder);
    newOrder.forEach((cat, index) => {
      updateCategoryMutation.mutate({ id: cat.id, body: { sortOrder: index } });
    });
  }

  const categoryById: Record<number, string> = Object.fromEntries(
    categories.map((c) => [c.id, c.name])
  );

  const itemCountByCategoryId: Record<number, number> = menuItems.reduce(
    (acc, item) => {
      acc[item.categoryId] = (acc[item.categoryId] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  const filtered = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === "all" || String(item.categoryId) === category;
    return matchesSearch && matchesCat;
  });

  if (error) {
    return (
      <div className="text-destructive font-body py-4">
        Failed to load menu items. You may need to sign in again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category management – clear section */}
      <Card className="border-border">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-2">
          <div>
            <CardTitle className="text-lg font-display tracking-wide">Category management</CardTitle>
            <CardDescription className="mt-1">
              Add and edit categories to organize your menu (e.g. Starters, Mains, Desserts).
            </CardDescription>
          </div>
          <Button
            variant="hero"
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => setAddCategoryOpen(true)}
          >
            <FolderPlus className="w-4 h-4" /> Add category
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {categories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 py-10 text-center">
              <p className="text-sm text-muted-foreground font-body">No categories yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Add a category to group menu items.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={() => setAddCategoryOpen(true)}
              >
                <FolderPlus className="w-4 h-4" /> Add first category
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleCategoryDragEnd}
              >
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-2 py-3 w-10" aria-label="Drag handle" />
                      <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">Items</th>
                      <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-28 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <SortableContext
                      items={orderedCategories.map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {orderedCategories.map((cat) => (
                        <SortableCategoryRow
                          key={cat.id}
                          cat={cat}
                          itemCount={itemCountByCategoryId[cat.id] ?? 0}
                          onEdit={() => {
                            setEditingCategory(cat);
                            setEditCategoryOpen(true);
                          }}
                          onDelete={() => {
                            if (window.confirm(`Delete "${cat.name}"? Menu items in this category may be affected.`)) {
                              deleteCategoryMutation.mutate(cat.id);
                            }
                          }}
                          isDeleting={deleteCategoryMutation.isPending}
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
              </DndContext>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Menu items section */}
      <Card className="border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <CardTitle className="text-lg font-display tracking-wide">Menu items</CardTitle>
            <CardDescription className="mt-1">
              Filter by category, then add or edit items.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-background border-border text-sm"
              />
            </div>
            <Button variant="hero" size="sm" className="gap-2 shrink-0" onClick={() => setAddItemOpen(true)}>
              <Plus className="w-4 h-4" /> Add item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2 flex-wrap items-center mb-4">
            <span className="text-xs text-muted-foreground font-body mr-1">Show:</span>
            <Button
              variant={category === "all" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setCategory("all")}
            >
              All
            </Button>
            {orderedCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={category === String(cat.id) ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setCategory(String(cat.id))}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <p className="col-span-full text-center text-muted-foreground font-body py-8">
                Loading menu items…
              </p>
            ) : filtered.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground font-body py-8">
                No menu items found. Add a category first, then add items.
              </p>
            ) : (
              filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/30 transition-all duration-300"
            >
              <div className="relative h-40 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-4xl font-display text-muted-foreground">
                    {item.name.charAt(0)}
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      item.available
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}
                  >
                    {item.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-display text-sm tracking-wide text-foreground">{item.name}</h4>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">
                      {categoryById[item.categoryId] ?? `Category ${item.categoryId}`}
                    </p>
                  </div>
                  <span className="text-primary font-display text-sm">{formatPrice(item.price)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item);
                      setEditItemOpen(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 hover:shadow-sm active:scale-[0.98] transition-all duration-200"
                  >
                    <Pencil className="w-3.5 h-3.5 shrink-0" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete "${item.name}"?`)) {
                        deleteItemMutation.mutate(item.id);
                      }
                    }}
                    disabled={deleteItemMutation.isPending}
                    aria-label={`Delete ${item.name}`}
                    className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 hover:border-destructive/40 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AddCategoryDialog
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
          setAddCategoryOpen(false);
        }}
      />
      <AddMenuItemDialog
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        categories={categories}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin", "menuItems"] });
          setAddItemOpen(false);
        }}
      />
      {editingCategory && (
        <EditCategoryDialog
          open={editCategoryOpen}
          onOpenChange={setEditCategoryOpen}
          category={editingCategory}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
            setEditCategoryOpen(false);
            setEditingCategory(null);
          }}
          onDeleted={() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "menuItems"] });
            setEditCategoryOpen(false);
            setEditingCategory(null);
          }}
          deleteMutation={deleteCategoryMutation}
        />
      )}
      {editingItem && (
        <EditMenuItemDialog
          open={editItemOpen}
          onOpenChange={setEditItemOpen}
          item={editingItem}
          categories={categories}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "menuItems"] });
            setEditItemOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

function AddCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (body: { name: string; sortOrder?: number }) => createAdminCategory(body),
    onSuccess: () => {
      setName("");
      setSortOrder("");
      setError(null);
      onSuccess();
    },
    onError: (err: Error) => setError(err.message || "Failed to create category"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required");
      return;
    }
    setError(null);
    createMutation.mutate({
      name: trimmed,
      sortOrder: sortOrder === "" ? undefined : parseInt(sortOrder, 10),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>Create a new menu category (e.g. Starters, Desserts).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Starters"
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-sort">Sort order (optional)</Label>
            <Input
              id="cat-sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="0"
              className="bg-background border-border"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddMenuItemDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: Category[];
  onSuccess: () => void;
}) {
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const createMutation = useMutation({
    mutationFn: (body: {
      categoryId: number;
      name: string;
      description?: string;
      price: number;
      imageUrl?: string;
      available: boolean;
    }) => createAdminMenuItem(body),
    onSuccess: () => {
      setCategoryId("");
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setAvailable(true);
      setError(null);
      onSuccess();
    },
    onError: (err: Error) => setError(err.message || "Failed to create menu item"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const numPrice = parseFloat(price);
    if (!categoryId) {
      setError("Please select a category");
      return;
    }
    if (!trimmedName) {
      setError("Item name is required");
      return;
    }
    if (Number.isNaN(numPrice) || numPrice < 0) {
      setError("Enter a valid price");
      return;
    }
    setError(null);
    createMutation.mutate({
      categoryId: parseInt(categoryId, 10),
      name: trimmedName,
      description: description.trim() || undefined,
      price: numPrice,
      imageUrl: imageUrl.trim() || undefined,
      available,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
          <DialogDescription>Add a new item. Each item belongs to one category.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-category">Category *</Label>
            <select
              id="item-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-muted-foreground">Create a category first.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-name">Name *</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grilled Salmon"
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-desc">Description (optional)</Label>
            <Textarea
              id="item-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              className="bg-background border-border min-h-[80px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-price">Price (LKR) *</Label>
            <Input
              id="item-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Image (optional)</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      setError(null);
                      try {
                        const { url } = await uploadAdminImage(file);
                        setImageUrl(url);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Upload failed");
                      } finally {
                        setUploading(false);
                        e.target.value = "";
                      }
                    }}
                    disabled={uploading}
                  />
                  <span className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-body hover:bg-muted/50">
                    {uploading ? "Uploading…" : "Upload image"}
                  </span>
                </label>
                <span className="text-xs text-muted-foreground">or paste URL below</span>
              </div>
              <Input
                id="item-image"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... or /images/dish.jpg"
                className="bg-background border-border"
              />
            </div>
            {imageUrl.trim() && (
              <div className="mt-2 rounded-md border border-border overflow-hidden bg-muted/30 w-24 h-24">
                <img
                  src={imageUrl.trim()}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="item-available"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="item-available" className="font-normal cursor-pointer">
              Available
            </Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              disabled={createMutation.isPending || categories.length === 0}
            >
              {createMutation.isPending ? "Adding…" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditCategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
  onDeleted,
  deleteMutation,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category;
  onSuccess: () => void;
  onDeleted: () => void;
  deleteMutation: { mutate: (id: number) => void; isPending: boolean };
}) {
  const [name, setName] = useState(category.name);
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder ?? 0));
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (body: { name?: string; sortOrder?: number }) =>
      updateAdminCategory(category.id, body),
    onSuccess: () => {
      setError(null);
      onSuccess();
    },
    onError: (err: Error) => setError(err.message || "Failed to update category"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required");
      return;
    }
    setError(null);
    updateMutation.mutate({
      name: trimmed,
      sortOrder: parseInt(sortOrder, 10),
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Delete category "${category.name}"? Menu items in this category may be affected.`)) {
      deleteMutation.mutate(category.id);
      onDeleted();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>Change name or sort order.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-cat-name">Name</Label>
            <Input
              id="edit-cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-cat-sort">Sort order</Label>
            <Input
              id="edit-cat-sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              Delete
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditMenuItemDialog({
  open,
  onOpenChange,
  item,
  categories,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: MenuItem;
  categories: Category[];
  onSuccess: () => void;
}) {
  const [categoryId, setCategoryId] = useState(String(item.categoryId));
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? "");
  const [price, setPrice] = useState(String(item.price));
  const [imageUrl, setImageUrl] = useState(item.imageUrl ?? "");
  const [available, setAvailable] = useState(item.available);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (body: {
      categoryId?: number;
      name?: string;
      description?: string;
      price?: number;
      imageUrl?: string;
      available?: boolean;
    }) => updateAdminMenuItem(item.id, body),
    onSuccess: () => {
      setError(null);
      onSuccess();
    },
    onError: (err: Error) => setError(err.message || "Failed to update menu item"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const numPrice = parseFloat(price);
    if (!categoryId) {
      setError("Please select a category");
      return;
    }
    if (!trimmedName) {
      setError("Item name is required");
      return;
    }
    if (Number.isNaN(numPrice) || numPrice < 0) {
      setError("Enter a valid price");
      return;
    }
    setError(null);
    updateMutation.mutate({
      categoryId: parseInt(categoryId, 10),
      name: trimmedName,
      description: description.trim() || undefined,
      price: numPrice,
      imageUrl: imageUrl.trim() || undefined,
      available,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogDescription>Item is tied to one category.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-item-category">Category *</Label>
            <select
              id="edit-item-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-item-name">Name *</Label>
            <Input
              id="edit-item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-item-desc">Description (optional)</Label>
            <Textarea
              id="edit-item-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-border min-h-[80px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-item-price">Price (LKR) *</Label>
            <Input
              id="edit-item-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Image (optional)</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      setError(null);
                      try {
                        const { url } = await uploadAdminImage(file);
                        setImageUrl(url);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Upload failed");
                      } finally {
                        setUploading(false);
                        e.target.value = "";
                      }
                    }}
                    disabled={uploading}
                  />
                  <span className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-body hover:bg-muted/50">
                    {uploading ? "Uploading…" : "Upload image"}
                  </span>
                </label>
                <span className="text-xs text-muted-foreground">or paste URL below</span>
              </div>
              <Input
                id="edit-item-image"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... or /images/dish.jpg"
                className="bg-background border-border"
              />
            </div>
            {imageUrl.trim() && (
              <div className="mt-2 rounded-md border border-border overflow-hidden bg-muted/30 w-24 h-24">
                <img
                  src={imageUrl.trim()}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-item-available"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="edit-item-available" className="font-normal cursor-pointer">
              Available
            </Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
