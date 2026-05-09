import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import { api as myApi } from "@/lib/api";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
function HomePage() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const { t } = useTranslation();
  
  const statsData = useQuery(api.stats.get);
  const loading = statsData === undefined;
  const stats = statsData || {
    activeListings: 0,
    verifiedBuyers: 0,
    recentTransactions: 0,
    totalRevenue: 0
  };

  const goFarmer = () => navigate("/farmer");
  const goBuyer = () => navigate("/market");
  const goAdmin = () => navigate("/admin/verification");

  return (
    <div className="space-y-10">
      <section className="grid items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            {t("home.badge")}
          </div>
          {/* Changed text-white to text-foreground */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            {t("home.title")}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            {t("home.subtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-emerald-600 text-white hover:bg-emerald-500" 
              type="button"
              onClick={goFarmer}
            >
              {user?.role === "farmer" ? t("home.farmerBtn") : t("home.farmerEnter")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:bg-accent hover:text-accent-foreground"
              type="button"
              onClick={goBuyer}
            >
              {t("home.browseBtn")}
            </Button>
            {user?.role === "admin" && (
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/5"
                type="button"
                onClick={goAdmin}
              >
                {t("home.adminBtn")}
              </Button>
            )}
          </div>
        </div>

        {/* Updated Card colors: bg-card, border-border */}
        <Card className="border border-border bg-card/50 shadow-xl shadow-primary/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t("home.liveActivity")}</CardTitle>
            <CardDescription>{t("home.liveSub")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            
            {/* Stat Box */}
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("home.activeListings")}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading ? "-" : stats.activeListings}
              </p>
              <p className="text-xs text-primary">{t("home.availNow")}</p>
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("home.verifiedBuyers")}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading ? "-" : stats.verifiedBuyers}
              </p>
              <p className="text-xs text-primary">{t("home.kycApproved")}</p>
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("home.tx7d")}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading ? "-" : stats.recentTransactions}
              </p>
              <p className="text-xs text-primary">{t("home.volWeek")}</p>
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("home.totalRevenue")}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading ? "-" : `${(stats.totalRevenue || 0).toLocaleString()} ${t("market.egp")}`}
              </p>
              <p className="text-xs text-primary">{t("home.lifetimeVol")}</p>
            </div>

          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2"> 
        {[
          {
            title: t("home.forFarmersTitle"),
            body: t("home.forFarmersDesc"),
          },
          {
            title: t("home.forBuyersTitle"),
            body: t("home.forBuyersDesc"),
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