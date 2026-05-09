import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { api as myApi } from "@/lib/api";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTranslation } from "react-i18next";
const UserTable = ({ title, t, data, search, onSearchChange, page, onPageChange, onToggle, loading }) => {
  const pageSize = 5;
  
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    const list = term
      ? data.filter((item) =>
          (item.userInfo?.username || "").toLowerCase().includes(term) ||
          (item.userInfo?.email || "").toLowerCase().includes(term)
        )
      : data;
    const start = (page - 1) * pageSize;
    return { total: list.length, data: list.slice(start, start + pageSize) };
  }, [data, search, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.total / pageSize));

  return (
    // Updated Colors: bg-card, border-border
    <Card className="border border-border bg-card h-full flex flex-col shadow-sm">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-foreground">{title}</CardTitle>
            <CardDescription>{t("admin.total")}: {data.length}</CardDescription>
          </div>
          <div className="w-40">
            <Input
              placeholder={t("admin.search")}
              value={search}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPageChange(1);
              }}
              // Updated Input Colors
              className="h-8 text-xs border-input bg-background"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 flex-1">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="pl-4">{t("admin.thUser")}</TableHead>
              <TableHead>{t("admin.thStatus")}</TableHead>
              <TableHead className="text-right pr-4">{t("admin.thAction")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">{t("admin.loading")}</TableCell></TableRow>
            ) : filtered.data.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">{t("admin.empty")}</TableCell></TableRow>
            ) : (
              filtered.data.map((row) => (
                <TableRow key={row.userInfo._id} className="border-border hover:bg-muted/50 transition-colors">
                  <TableCell className="pl-4 py-3">
                    <div className="font-medium text-foreground">{row.userInfo.username}</div>
                    <div className="text-xs text-muted-foreground">{row.userInfo.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.verifiedStatus 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20"
                    }`}>
                      {row.verifiedStatus ? t("admin.statusVerified") : t("admin.statusPending")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggle(row.userInfo._id, row.verifiedStatus)}
                      className={`h-7 px-3 text-xs ${
                        row.verifiedStatus 
                          ? "text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20" 
                          : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/20"
                      }`}
                    >
                      {row.verifiedStatus ? t("admin.btnRevoke") : t("admin.btnApprove")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
      
      {!loading && filtered.total > pageSize && (
        <div className="flex items-center justify-between border-t border-border p-3 text-xs">
          <span className="text-muted-foreground">{t("admin.pageOf")} {page} / {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-input" onClick={() => onPageChange(p => Math.max(1, p - 1))} disabled={page === 1}>&lt;</Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-input" onClick={() => onPageChange(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>&gt;</Button>
          </div>
        </div>
      )}
    </Card>
  );
};

function AdminVerificationPage() {
  const token = localStorage.getItem("token") || "";
  const { t } = useTranslation();
  const dataQuery = useQuery(api.verifications.getAll, { token });
  const data = dataQuery || [];
  const loading = dataQuery === undefined;
  
  const [message, setMessage] = useState(null);

  const [buyerSearch, setBuyerSearch] = useState("");
  const [buyerPage, setBuyerPage] = useState(1);
  const [farmerSearch, setFarmerSearch] = useState("");
  const [farmerPage, setFarmerPage] = useState(1);

  const toggleStatus = useMutation(api.verifications.toggleStatus);

  const farmers = useMemo(() => data.filter(d => d.userInfo.role === 'farmer'), [data]);
  const buyers = useMemo(() => data.filter(d => d.userInfo.role === 'buyer'), [data]);

  const toggleVerification = async (userId, currentStatus) => {
    setMessage(null);
    try {
      await toggleStatus({ token, userId, status: !currentStatus });
      const actionText = !currentStatus ? t("toast.userVerified") : t("toast.userUnverified");
      setMessage({ type: "success", text: actionText });
    } catch (err) {
      setMessage({ type: "error", text: t("toast.updateStatusFailed") });
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col gap-1 flex-shrink-0">
        <p className="text-xs uppercase tracking-[0.25em] text-primary font-bold">{t("admin.console")}</p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">{t("admin.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("admin.desc")}
        </p>
        {message && (
          <div className={`mt-2 text-sm px-3 py-2 rounded-md border ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          }`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <UserTable 
          title={t("admin.buyersTitle")}
          t={t}
          data={buyers}
          search={buyerSearch}
          onSearchChange={setBuyerSearch}
          page={buyerPage}
          onPageChange={setBuyerPage}
          onToggle={toggleVerification}
          loading={loading}
        />
        <UserTable 
          title={t("admin.farmersTitle")} 
          t={t}
          data={farmers}
          search={farmerSearch}
          onSearchChange={setFarmerSearch}
          page={farmerPage}
          onPageChange={setFarmerPage}
          onToggle={toggleVerification}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default AdminVerificationPage;