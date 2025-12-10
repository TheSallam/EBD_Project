import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "@/lib/auth";
import { api } from "@/lib/api";

function HomePage() {
  const navigate = useNavigate();
  const user = useAuthUser();
  
  const [stats, setStats] = useState({
    activeListings: 0,
    verifiedBuyers: 0,
    recentTransactions: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const goFarmer = () => navigate("/farmer");
  const goBuyer = () => navigate("/market");
  const goAdmin = () => navigate("/admin/verification");

  return (
    <div className="space-y-10">
      <section className="grid items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            Real-time, transparent agri-trade
          </div>
          {/* Changed text-white to text-foreground */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Clean, modern marketplace for farmers, buyers, and admins
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            AgriFlow connects smallholder farmers directly with verified buyers. Clear pricing, secure payments,
            verifications, and transaction history all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-emerald-600 text-white hover:bg-emerald-500" 
              type="button"
              onClick={goFarmer}
            >
              {user?.role === "farmer" ? "Go to Farmer dashboard" : "Enter as Farmer"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:bg-accent hover:text-accent-foreground"
              type="button"
              onClick={goBuyer}
            >
              Browse marketplace
            </Button>
            {user?.role === "admin" && (
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/5"
                type="button"
                onClick={goAdmin}
              >
                Admin verification
              </Button>
            )}
          </div>
        </div>

        {/* Updated Card colors: bg-card, border-border */}
        <Card className="border border-border bg-card/50 shadow-xl shadow-primary/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Live Market Activity</CardTitle>
            <CardDescription>Real-time data from the platform.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            
            {/* Stat Box */}
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Active listings</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading ? "-" : stats.activeListings}
              </p>
              <p className="text-xs text-primary">Available now</p>
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Verified buyers</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading ? "-" : stats.verifiedBuyers}
              </p>
              <p className="text-xs text-primary">KYC Approved</p>
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Transactions (7d)</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading ? "-" : stats.recentTransactions}
              </p>
              <p className="text-xs text-primary">Volume this week</p>
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading ? "-" : `${stats.totalRevenue.toLocaleString()} EGP`}
              </p>
              <p className="text-xs text-primary">Lifetime volume</p>
            </div>

          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2"> 
        {[
          {
            title: "For Farmers",
            body: "List crops quickly, reach verified buyers, and track payouts from one clean dashboard.",
          },
          {
            title: "For Buyers",
            body: "Discover credible suppliers, compare offers, and request deals with full transparency.",
          }
        ].map((item) => (
          <Card key={item.title} className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              {item.body}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

export default HomePage;