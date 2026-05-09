import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api as myApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast.jsx";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTranslation } from "react-i18next";

function BuyerMarketplacePage() {
  // ✅ USE THE NEW HELPERS
  const { toast, error, success } = useToast();
  const { t } = useTranslation();
  
  const [search, setSearch] = useState("");
  // IMPORTANT: PASS SEARCH QUERY TO BACKEND for actual Database Search
  const products = useQuery(api.products.getAll, { search: search || undefined }) || [];
  const loading = products === undefined;
  const [loadingError, setLoadingError] = useState(false);
  
  const [quantities, setQuantities] = useState({}); 
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [purchaseData, setPurchaseData] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createTransaction = useMutation(api.transactions.create);

  // Since we do Server-Side search now, we don't need client-side filtering!
  const filtered = {
    data: products,
    total: products.length
  };

  const totalPages = Math.max(1, Math.ceil(filtered.total / pageSize));

  const handleQtyChange = (pid, val) => {
    setQuantities(prev => ({ ...prev, [pid]: val }));
  };

  const initiatePurchase = (product) => {
    const qty = Number(quantities[product._id] || 0);

    if (qty <= 0) {
      // ✅ USE error() helper -> Force Red
      error(t("toast.invalidQty"), t("toast.invalidQtyDesc"));
      return;
    }
    if (qty > product.quantity) {
      // ✅ USE error() helper -> Force Red
      error(t("toast.stockExceeded"), t("toast.stockExceededDesc", { qty: product.quantity }));
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
      const token = localStorage.getItem("token");
      await createTransaction({ token, productId: product._id, quantityPurchased: qty });
      
      // ✅ USE success() helper -> Force White/Navy
      success(t("toast.purchaseSuccess"), t("toast.purchaseSuccessDesc", { qty, name: product.productName }));
      
      handleQtyChange(product._id, "");
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.message || t("toast.reqFailed");
      // ✅ USE error() helper -> Force Red
      error(t("toast.reqFailed"), msg);
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPurchase}
        title={t("market.confirmPurchaseTitle")}
        description={purchaseData ? t("market.confirmPurchaseDesc", { qty: purchaseData.qty, name: purchaseData.product.productName, farmer: purchaseData.product.farmerId?.username || t("market.farmerFallback"), total: purchaseData.total }) : ""}
        confirmText={t("market.purchaseBtn")}
        variant="default"
      />

      <header className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-lg shadow-primary/5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">{t("market.badge")}</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">{t("market.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("market.desc")}
          </p>
        </div>

        <form className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <Label htmlFor="search">{t("market.search")}</Label>
            <Input
              id="search"
              placeholder={t("market.searchPlaceholder")}
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
        {loading && <p className="text-sm text-muted-foreground">{t("market.loading")}</p>}
        
        {!loading && !loadingError && products.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("market.empty")}</p>
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
                {/* IMAGE HEADER */}
                {p.imageUrl ? (
                  <div className="w-full h-48 bg-muted border-b border-border">
                    <img src={p.imageUrl} alt={p.productName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-muted border-b border-border flex items-center justify-center text-muted-foreground">
                    <span className="text-sm">No image provided</span>
                  </div>
                )}
                <CardHeader className="pb-3 pt-4">
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
                      <span className="text-2xl font-semibold text-primary">{p.pricePerUnit} {t("market.egp")}</span>
                      <span className="text-muted-foreground">/ kg</span>
                    </p>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded dark:text-emerald-400">
                      {p.quantity} {t("market.kgLeft")}
                    </span>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`qty-${p._id}`} className="text-xs text-muted-foreground">
                        {t("market.buyQty")}
                      </Label>
                      {inputQty > 0 && (
                        <span className="text-xs font-semibold text-foreground">{t("market.total")}: {totalPreview} {t("market.egp")}</span>
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
                  {t("market.purchaseBtn")}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </section>

      {!loading && !loadingError && filtered.total > pageSize && (
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