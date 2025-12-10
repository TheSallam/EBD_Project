import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast.jsx";
import ConfirmationModal from "@/components/ConfirmationModal";

function BuyerMarketplacePage() {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantities, setQuantities] = useState({}); 

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Modal State
  const [purchaseData, setPurchaseData] = useState(null); // { product, qty, total }
  const [isModalOpen, setIsModalOpen] = useState(false);

  // UPDATED: Added 'isBackground' argument to prevent the spinner twitch
  const fetchProducts = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    const list = term
      ? products.filter(
          (p) =>
            p.productName?.toLowerCase().includes(term) ||
            p.farmerId?.username?.toLowerCase().includes(term)
        )
      : products;
    const start = (page - 1) * pageSize;
    return { total: list.length, data: list.slice(start, start + pageSize) };
  }, [products, search, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.total / pageSize));

  const handleQtyChange = (pid, val) => {
    setQuantities(prev => ({ ...prev, [pid]: val }));
  };

  const initiatePurchase = (product) => {
    const qty = Number(quantities[product._id] || 0);

    if (qty <= 0) {
      toast({ variant: "destructive", title: "Invalid quantity", description: "Please enter a valid amount greater than 0." });
      return;
    }
    if (qty > product.quantity) {
      toast({ variant: "destructive", title: "Stock exceeded", description: `Only ${product.quantity} kgs available.` });
      return;
    }

    const total = (qty * product.pricePerUnit).toFixed(2);
    setPurchaseData({ product, qty, total });
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!purchaseData) return;
    const { product, qty } = purchaseData;

    try {
      await api.post("/transactions", { productId: product._id, quantityPurchased: qty });
      
      toast({ title: "Purchase successful!", description: `Bought ${qty}kg of ${product.productName}` });
      
      // Clear input
      handleQtyChange(product._id, "");

      // OPTIMISTIC UPDATE: Update UI immediately so it feels instant
      setProducts(prev => prev.map(p => {
        if (p._id === product._id) {
          return { ...p, quantity: p.quantity - qty };
        }
        return p;
      }).filter(p => p.quantity > 0)); // Remove if quantity hits 0

      // BACKGROUND REFRESH: Sync with server without showing spinner
      fetchProducts(true);

    } catch (err) {
      const msg = err.response?.data?.message || "Request failed.";
      toast({ variant: "destructive", title: "Request failed", description: msg });
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPurchase}
        title="Confirm Purchase"
        description={purchaseData ? `You are about to buy ${purchaseData.qty}kg of ${purchaseData.product.productName} from ${purchaseData.product.farmerId?.username || "Farmer"} for a total of ${purchaseData.total} EGP.` : ""}
        confirmText="Confirm Purchase"
        variant="default"
      />

      <header className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-lg shadow-primary/5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Buyer view</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Marketplace</h2>
          <p className="text-sm text-muted-foreground">
            Browse listings. Listings disappear when stock runs out.
          </p>
        </div>

        <form className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Tomatoes, potatoes..."
              className="w-72 bg-background border-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </form>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-sm text-muted-foreground">Loading listings…</p>}
        
        {!loading && !error && products.length === 0 && (
          <p className="text-sm text-muted-foreground">No products available right now.</p>
        )}

        {filtered.data.map((p) => {
          const inputQty = quantities[p._id] || 0;
          const totalPreview = (inputQty * p.pricePerUnit).toFixed(1);

          return (
            <Card
              key={p._id || p.id}
              className="flex flex-col justify-between border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg text-foreground">
                    <span>{p.productName}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {p.farmerId?.username || "Farmer"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between items-baseline">
                    <p className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-primary">{p.pricePerUnit} EGP</span>
                      <span className="text-muted-foreground">/ kg</span>
                    </p>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded dark:text-emerald-400">
                      {p.quantity} kg left
                    </span>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`qty-${p._id}`} className="text-xs text-muted-foreground">
                        Buy Quantity (kg)
                      </Label>
                      {inputQty > 0 && (
                        <span className="text-xs font-semibold text-foreground">Total: {totalPreview} EGP</span>
                      )}
                    </div>
                    <Input 
                      id={`qty-${p._id}`}
                      type="number" 
                      placeholder="Amount..." 
                      className="bg-background border-input"
                      min="1"
                      max={p.quantity}
                      value={quantities[p._id] || ""}
                      onChange={(e) => handleQtyChange(p._id, e.target.value)}
                    />
                  </div>
                </CardContent>
              </div>
              <CardFooter>
                <Button
                  variant="secondary"
                  className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border"
                  type="button"
                  onClick={() => initiatePurchase(p)}
                >
                  Purchase
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </section>

      {!loading && !error && filtered.total > pageSize && (
        <div className="flex items-center justify-end gap-3 text-sm text-muted-foreground">
          <span>Page {page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
}

export default BuyerMarketplacePage;