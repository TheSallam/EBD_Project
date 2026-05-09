import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthUser } from "@/lib/auth";
import { api as myApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast"; 
import ConfirmationModal from "@/components/ConfirmationModal";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTranslation } from "react-i18next";

function FarmerDashboardPage() {
  const user = useAuthUser();
  const { toast } = useToast();
  const { t } = useTranslation();
  const token = localStorage.getItem("token") || "";
  const productsQuery = useQuery(api.products.getMyProducts, { token });
  const products = productsQuery || [];
  const loading = productsQuery === undefined;
  
  const [formData, setFormData] = useState({ productName: "", pricePerUnit: "", quantity: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const imageInputRef = useRef(null);

  const [modalConfig, setModalConfig] = useState({ 
    isOpen: false, 
    type: null, 
    data: null 
  });

  const createProduct = useMutation(api.products.create);
  const removeProduct = useMutation(api.products.remove);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const initiateDelete = (id) => {
    setModalConfig({ isOpen: true, type: 'delete', data: id });
  };

  const initiatePublish = (e) => {
    e.preventDefault();
    if (!formData.productName || !formData.pricePerUnit || !formData.quantity) {
      toast({ variant: "destructive", description: "Please fill in all fields." });
      return;
    }
    setModalConfig({ isOpen: true, type: 'publish', data: { ...formData, image: selectedImage } });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleCloseModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const performAction = async () => {
    if (modalConfig.type === 'delete') {
      const id = modalConfig.data;
      try {
        await removeProduct({ token, id });
        toast({ title: t("toast.deleted"), description: t("toast.listingRemoved") });
      } catch (err) {
        toast({ variant: "destructive", title: t("toast.error"), description: t("toast.delFailed") });
      }
    } 
    else if (modalConfig.type === 'publish') {
      try {
        let imageId = undefined;
        if (selectedImage) {
          const postUrl = await generateUploadUrl();
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": selectedImage.type },
            body: selectedImage,
          });
          const { storageId } = await result.json();
          imageId = storageId;
        }

        await createProduct({
          token,
          productName: formData.productName,
          pricePerUnit: Number(formData.pricePerUnit),
          quantity: Number(formData.quantity),
          imageId
        });
        setFormData({ productName: "", pricePerUnit: "", quantity: "" });
        setSelectedImage(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
        toast({ title: t("toast.success"), description: t("toast.postSuccess") });
      } catch (err) {
        const msg = err.message || t("toast.reqFailed");
        toast({ variant: "destructive", title: t("toast.actionDenied"), description: msg });
      }
    }
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const getModalContent = () => {
    if (modalConfig.type === 'delete') {
      return {
        title: t("farmer.deleteListing"),
        description: t("farmer.deleteListingDesc"),
        confirmText: t("farmer.delete"),
        variant: "destructive"
      };
    }
    if (modalConfig.type === 'publish') {
      return {
        title: t("farmer.publishListing"),
        description: t("farmer.publishListingDesc", { qty: formData.quantity, name: formData.productName, price: formData.pricePerUnit }),
        confirmText: t("farmer.publish"),
        variant: "default"
      };
    }
    return {};
  };

  const modalContent = getModalContent();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,350px]">
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        onConfirm={performAction}
        {...modalContent}
      />

      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">{t("farmer.title")}</h2>
          <p className="text-muted-foreground">{t("farmer.desc")}</p>
        </div>

        {/* FIX: Removed hardcoded bg-slate-950 and dark borders. Added standard bg-card and border-border */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>{t("farmer.currentListings")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("farmer.thProduct")}</TableHead>
                  <TableHead>{t("farmer.thQty")}</TableHead>
                  <TableHead>{t("farmer.thPrice")}</TableHead>
                  <TableHead>{t("farmer.thStatus")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow> : 
                 products.length === 0 ? <TableRow><TableCell colSpan={5}>No listings yet.</TableCell></TableRow> :
                 products.map((p) => (
                  <TableRow key={p._id}>
                    {/* FIX: Removed flex from TableCell to preserve table layout */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.productName} className="w-8 h-8 rounded-md object-cover border border-border" />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground border border-border">No img</div>
                        )}
                        {p.productName}
                      </div>
                    </TableCell>
                    <TableCell>{p.quantity} kg</TableCell>
                    <TableCell>{p.pricePerUnit} {t("market.egp")}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${p.isAvailable ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                        {p.isAvailable ? t("farmer.statusActive") : t("farmer.statusSold")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* FIX: Adjusted hover colors to be theme-aware */}
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30" onClick={() => initiateDelete(p._id)}>
                        {t("farmer.deleteBtn")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        {/* FIX: Replaced slate backgrounds and emerald shadows with theme variables */}
        <Card className="bg-card border-border shadow-lg sticky top-6">
          <CardHeader>
            <CardTitle>{t("farmer.postNew")}</CardTitle>
            <CardDescription>{t("farmer.postDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={initiatePublish} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">{t("farmer.cropName")}</Label>
                {/* FIX: Removed hardcoded slate background and border */}
                <Input 
                  id="productName" 
                  placeholder="e.g. Potatoes" 
                  className="bg-background border-input"
                  value={formData.productName}
                  onChange={e => setFormData({...formData, productName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{t("farmer.priceEgp")}</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00" 
                    className="bg-background border-input"
                    value={formData.pricePerUnit}
                    onChange={e => setFormData({...formData, pricePerUnit: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">{t("farmer.qtyKg")}</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    placeholder="0" 
                    className="bg-background border-input"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Crop Image (Optional)</Label>
                <Input 
                  id="image" 
                  type="file" 
                  accept="image/*"
                  className="bg-background border-input cursor-pointer"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                />
              </div>
              {/* Note: bg-emerald-600 is fine as it's part of your primary brand color */}
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                {t("farmer.publishBtn")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FarmerDashboardPage;