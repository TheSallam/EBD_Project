import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { useAuthUser } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

function TransactionsPage() {
  const user = useAuthUser();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/transactions");
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleStatusChange = async (transactionId, newStatus) => {
    try {
      await api.patch(`/transactions/${transactionId}/status`, { status: newStatus });
      toast({ title: "Updated", description: `Order status changed to ${newStatus}` });
      setItems(prev => prev.map(t => 
        (t._id === transactionId || t.id === transactionId) ? { ...t, status: newStatus } : t
      ));
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400';
      case 'delivered': return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400';
      case 'cancelled': return 'text-red-600 bg-red-500/10 border-red-500/20 dark:text-red-400';
      default: return 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400'; 
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full py-6">
      
      <div className="flex flex-col gap-3 items-center text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary font-medium">
          {user?.role || "System"} View
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground">
          {user?.role === "farmer" ? "My Sales" : "Transaction History"}
        </h2>
        <p className="text-base text-muted-foreground max-w-md">
          {user?.role === "farmer" 
            ? "Manage your incoming orders and track your revenue." 
            : "A complete record of your marketplace activity."}
        </p>
      </div>

      <Card className="border border-border bg-card shadow-xl">
        <CardHeader className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Orders</CardTitle>
              <CardDescription>All records sorted by newest first.</CardDescription>
            </div>
            <div className="px-3 py-1 rounded-full bg-muted border border-border text-xs text-muted-foreground">
              Total: {items.length}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="px-6 w-[140px]">Date</TableHead>
                <TableHead className="w-[200px]">Product</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Total (EGP)</TableHead>
                {user?.role === 'farmer' && <TableHead className="text-right px-6">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell className="px-6 py-8 text-center text-muted-foreground" colSpan={6}>
                    Loading records...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell className="px-6 py-8 text-center text-muted-foreground" colSpan={6}>
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((t) => (
                  <TableRow key={t._id || t.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="px-6 text-muted-foreground whitespace-nowrap">
                      {new Date(t.transactionDate).toLocaleDateString()}
                      <span className="block text-xs text-muted-foreground/70">
                        {new Date(t.transactionDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </TableCell>
                    {/* Changed text-slate-200 to text-foreground */}
                    <TableCell className="font-medium text-foreground">
                      {t.productNameSnapshot || t.productId?.productName || "Unknown Product"}
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {t.quantityPurchased} kg × {t.priceSnapshot || t.productId?.pricePerUnit || 0} EGP
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {t.buyerId?.username || "Unknown"}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(t.status || 'pending')}`}>
                        {(t.status || 'pending').toUpperCase()}
                      </span>
                    </TableCell>

                    <TableCell className="text-center font-semibold text-primary">
                      {t.totalPrice.toLocaleString()}
                    </TableCell>

                    {user?.role === 'farmer' && (
                      <TableCell className="text-right px-6">
                        <select 
                          className="bg-background border border-input text-foreground text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-accent"
                          value={t.status || 'pending'}
                          onChange={(e) => handleStatusChange(t._id || t.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TransactionsPage;