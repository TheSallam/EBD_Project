import { useEffect, useState } from "react";
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

function FarmerDashboardPage() {
  const user = useAuthUser();
  const { toast } = useToast();
  const token = localStorage.getItem("token");
  const productsQuery = useQuery(api.products.getMyProducts, { token });
  const products = productsQuery || [];
  const loading = productsQuery === undefined;
  
  const [formData, setFormData] = useState({ productName: "", pricePerUnit: "", quantity: "" });

  const [modalConfig, setModalConfig] = useState({ 
    isOpen: false, 
    type: null, 
    data: null 
  });

  const createProduct = useMutation(api.products.create);
  const removeProduct = useMutation(api.products.remove);

  const initiateDelete = (id) => {
    setModalConfig({ isOpen: true, type: 'delete', data: id });
  };

  const initiatePublish = (e) => {
    e.preventDefault();
    if (!formData.productName || !formData.pricePerUnit || !formData.quantity) {
      toast({ variant: "destructive", description: "Please fill in all fields." });
      return;
    }
    setModalConfig({ isOpen: true, type: 'publish', data: formData });
  };

  const handleCloseModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const performAction = async () => {
    if (modalConfig.type === 'delete') {
      const id = modalConfig.data;
      try {
        await removeProduct({ token, id });
        toast({ title: "Deleted", description: "Listing removed." });
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete listing." });
      }
    } 
    else if (modalConfig.type === 'publish') {
      try {
        await createProduct({
          token,
          productName: formData.productName,
          pricePerUnit: Number(formData.pricePerUnit),
          quantity: Number(formData.quantity)
        });
        setFormData({ productName: "", pricePerUnit: "", quantity: "" });
        toast({ title: "Success", description: "Listing posted successfully!" });
      } catch (err) {
        const msg = err.message || "Failed to add product";
        toast({ variant: "destructive", title: "Action Denied", description: msg });
      }
    }
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const getModalContent = () => {
    if (modalConfig.type === 'delete') {
      return {
        title: "Delete Listing?",
        description: "This action cannot be undone. This listing will be permanently removed from the marketplace.",
        confirmText: "Delete",
        variant: "destructive"
      };
    }
    if (modalConfig.type === 'publish') {
      return {
        title: "Publish Listing?",
        description: `Are you sure you want to list ${formData.quantity}kg of ${formData.productName} for ${formData.pricePerUnit} EGP/kg?`,
        confirmText: "Publish",
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
          <h2 className="text-3xl font-semibold tracking-tight">My Farm</h2>
          <p className="text-muted-foreground">Manage your active listings.</p>
        </div>

        {/* FIX: Removed hardcoded bg-slate-950 and dark borders. Added standard bg-card and border-border */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Current Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow> : 
                 products.length === 0 ? <TableRow><TableCell colSpan={5}>No listings yet.</TableCell></TableRow> :
                 products.map((p) => (
                  <TableRow key={p._id}>
                    {/* FIX: Changed text-slate-200 to standard text color */}
                    <TableCell className="font-medium">{p.productName}</TableCell>
                    <TableCell>{p.quantity} kg</TableCell>
                    <TableCell>{p.pricePerUnit} EGP</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${p.isAvailable ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                        {p.isAvailable ? "Active" : "Sold Out"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* FIX: Adjusted hover colors to be theme-aware */}
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30" onClick={() => initiateDelete(p._id)}>
                        Delete
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
            <CardTitle>Post New Crop</CardTitle>
            <CardDescription>Add fresh produce to the market.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={initiatePublish} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Crop Name</Label>
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
                  <Label htmlFor="price">Price (EGP)</Label>
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
                  <Label htmlFor="quantity">Qty (kg)</Label>
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
              {/* Note: bg-emerald-600 is fine as it's part of your primary brand color */}
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                Publish Listing
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FarmerDashboardPage;