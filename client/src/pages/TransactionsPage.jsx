import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
      console.error("Fetch error:", err);
      // Don't crash, just show error
      setError("Could not load data."); 
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
        <h2 className="text-4xl font-bold tracking-tight text-foreground">
          {user?.role === "farmer" ? "My Sales" : "Transaction History"}
        </h2>
      </div>

      <Card className="border border-border bg-card shadow-xl">
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-xl">Orders</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Total (EGP)</TableHead>
                {user?.role === 'admin' && <TableHead className="text-right px-6">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No transactions found.</TableCell></TableRow>
              ) : (
                items.map((t) => (
                  <TableRow key={t._id || t.id}>
                    <TableCell>
                      {/* SAFELY Format Date */}
                      {t.transactionDate ? new Date(t.transactionDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      {t.productNameSnapshot || t.productId?.productName || "Unknown"}
                    </TableCell>
                    <TableCell>{t.buyerId?.username || "Unknown"}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(t.status || 'pending')}`}>
                        {(t.status || 'pending').toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-semibold text-primary">
                      {/* CRITICAL FIX: The reason for the black screen is here. We added || 0 */}
                      {(t.totalPrice || 0).toLocaleString()}
                    </TableCell>
                    
                    {user?.role === 'admin' && (
                      <TableCell className="text-right px-6">
                         <select 
                          className="bg-background border rounded px-2 py-1"
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