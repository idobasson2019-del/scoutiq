"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Table2,
  LayoutGrid,
  ArrowUpDown,
  Save,
  X,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monogram, EmptyState } from "@/components/common/misc";
import { PlayerCard } from "./player-card";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import {
  label,
  positionLabels,
  footLabels,
} from "@/lib/i18n/labels";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Player } from "@/types";

const POSITIONS = ["GK", "RB", "LB", "CB", "DM", "CM", "AM", "RW", "LW", "ST"];

interface Filters {
  q: string;
  position: string;
  foot: string;
  league: string;
  minAge: string;
  maxAge: string;
  minValue: string;
  maxValue: string;
  minSalary: string;
  maxSalary: string;
  contractBy: string;
  free: boolean;
  loan: boolean;
  transfer: boolean;
}

const emptyFilters: Filters = {
  q: "",
  position: "all",
  foot: "all",
  league: "all",
  minAge: "",
  maxAge: "",
  minValue: "",
  maxValue: "",
  minSalary: "",
  maxSalary: "",
  contractBy: "",
  free: false,
  loan: false,
  transfer: false,
};

type SortKey = "name" | "age" | "marketValue" | "salary" | "contractEnd" | "proposedDate";

const PAGE_SIZE = 8;

export function PlayersView({
  players,
  initialQuery = "",
  compact = false,
}: {
  players: Player[];
  initialQuery?: string;
  compact?: boolean;
}) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const router = useRouter();

  const [filters, setFilters] = useState<Filters>({ ...emptyFilters, q: initialQuery });
  const [view, setView] = useState<"table" | "cards">("table");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "marketValue", dir: "desc" });
  const [page, setPage] = useState(1);

  const leagues = useMemo(
    () => Array.from(new Set(players.map((p) => p.league))).sort(),
    [players],
  );

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => {
    setFilters((f) => ({ ...f, [k]: v }));
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = players.filter((p) => {
      if (filters.q && !p.name.toLowerCase().includes(filters.q.toLowerCase()) && !p.currentTeam.toLowerCase().includes(filters.q.toLowerCase())) return false;
      if (filters.position !== "all" && p.position !== filters.position) return false;
      if (filters.foot !== "all" && p.foot !== filters.foot) return false;
      if (filters.league !== "all" && p.league !== filters.league) return false;
      if (filters.minAge && p.age < Number(filters.minAge)) return false;
      if (filters.maxAge && p.age > Number(filters.maxAge)) return false;
      if (filters.minValue && p.marketValue < Number(filters.minValue) * 1_000_000) return false;
      if (filters.maxValue && p.marketValue > Number(filters.maxValue) * 1_000_000) return false;
      if (filters.minSalary && p.salary < Number(filters.minSalary) * 1000) return false;
      if (filters.maxSalary && p.salary > Number(filters.maxSalary) * 1000) return false;
      if (filters.contractBy && p.contractEnd > filters.contractBy) return false;
      if (filters.free && p.availability !== "free") return false;
      if (filters.loan && p.availability !== "loan") return false;
      if (filters.transfer && p.availability !== "transfer") return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      return ((av as number) - (bv as number)) * dir;
    });
    return list;
  }, [players, filters, sort]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.position !== "all") n++;
    if (filters.foot !== "all") n++;
    if (filters.league !== "all") n++;
    if (filters.minAge || filters.maxAge) n++;
    if (filters.minValue || filters.maxValue) n++;
    if (filters.minSalary || filters.maxSalary) n++;
    if (filters.contractBy) n++;
    if (filters.free) n++;
    if (filters.loan) n++;
    if (filters.transfer) n++;
    return n;
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  };

  const SortHead = ({ k, children, className }: { k: SortKey; children: React.ReactNode; className?: string }) => (
    <TableHead className={className}>
      <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-foreground">
        {children}
        <ArrowUpDown className={cn("h-3 w-3", sort.key === k ? "text-primary" : "opacity-40")} />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder={t("filter.name")}
            className="ps-9"
          />
        </div>

        <Select value={filters.position} onValueChange={(v) => set("position", v)}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder={t("filter.position")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filter.position")}: {t("common.all")}</SelectItem>
            {POSITIONS.map((p) => (
              <SelectItem key={p} value={p}>{label(positionLabels, p, lang)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {t("filter.moreFilters")}
              {activeCount > 0 && <Badge className="ms-1 h-5 px-1.5">{activeCount}</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 space-y-3" align="end">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("filter.foot")}</Label>
                <Select value={filters.foot} onValueChange={(v) => set("foot", v)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all")}</SelectItem>
                    <SelectItem value="left">{label(footLabels, "left", lang)}</SelectItem>
                    <SelectItem value="right">{label(footLabels, "right", lang)}</SelectItem>
                    <SelectItem value="both">{label(footLabels, "both", lang)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("filter.league")}</Label>
                <Select value={filters.league} onValueChange={(v) => set("league", v)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all")}</SelectItem>
                    {leagues.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{t("filter.age")}</Label>
              <div className="flex gap-2">
                <Input className="h-8" type="number" placeholder={t("common.min")} value={filters.minAge} onChange={(e) => set("minAge", e.target.value)} />
                <Input className="h-8" type="number" placeholder={t("common.max")} value={filters.maxAge} onChange={(e) => set("maxAge", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("filter.marketValue")} (M€)</Label>
                <div className="flex gap-2">
                  <Input className="h-8" type="number" placeholder={t("common.min")} value={filters.minValue} onChange={(e) => set("minValue", e.target.value)} />
                  <Input className="h-8" type="number" placeholder={t("common.max")} value={filters.maxValue} onChange={(e) => set("maxValue", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("filter.salary")} (K€)</Label>
                <div className="flex gap-2">
                  <Input className="h-8" type="number" placeholder={t("common.min")} value={filters.minSalary} onChange={(e) => set("minSalary", e.target.value)} />
                  <Input className="h-8" type="number" placeholder={t("common.max")} value={filters.maxSalary} onChange={(e) => set("maxSalary", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{t("filter.contractEnd")}</Label>
              <Input className="h-8" type="date" value={filters.contractBy} onChange={(e) => set("contractBy", e.target.value)} />
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={filters.free} onCheckedChange={(v) => set("free", Boolean(v))} /> {t("filter.freeAgent")}</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={filters.loan} onCheckedChange={(v) => set("loan", Boolean(v))} /> {t("filter.onLoan")}</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={filters.transfer} onCheckedChange={(v) => set("transfer", Boolean(v))} /> {t("filter.availableTransfer")}</label>
            </div>

            <div className="flex gap-2 border-t border-border pt-3">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setFilters({ ...emptyFilters, q: filters.q })}>
                <X className="h-3.5 w-3.5" /> {t("common.reset")}
              </Button>
              <Button size="sm" className="flex-1" onClick={() => toast(t("common.filtersSaved"))}>
                <Save className="h-3.5 w-3.5" /> {t("common.saveFilters")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="ms-auto flex items-center gap-1 rounded-md border border-border p-0.5">
          <Button variant={view === "table" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setView("table")} aria-label={t("common.tableView")}>
            <Table2 className="h-4 w-4" />
          </Button>
          <Button variant={view === "cards" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setView("cards")} aria-label={t("common.cardView")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {(activeCount > 0 || filters.q) && (
        <Button variant="ghost" size="sm" className="h-7 text-muted-foreground" onClick={() => setFilters(emptyFilters)}>
          <X className="h-3.5 w-3.5" /> {t("common.clearFilters")}
        </Button>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title={t("common.noResults")} body={t("common.noResultsBody")} />
      ) : view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((p) => <PlayerCard key={p.id} player={p} />)}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10"></TableHead>
                <SortHead k="name">{t("col.name")}</SortHead>
                <SortHead k="age">{t("col.age")}</SortHead>
                <TableHead>{t("col.nationality")}</TableHead>
                <TableHead>{t("col.currentTeam")}</TableHead>
                <TableHead>{t("col.position")}</TableHead>
                <TableHead>{t("col.foot")}</TableHead>
                <SortHead k="marketValue">{t("col.marketValue")}</SortHead>
                <SortHead k="contractEnd">{t("col.contractEnd")}</SortHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/players/view?id=${p.id}`)}
                >
                  <TableCell><Monogram name={p.name} color={p.photoColor} imageUrl={p.photoUrl} size={32} /></TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="tabular-nums">{p.age}</TableCell>
                  <TableCell className="text-muted-foreground">{p.nationality}</TableCell>
                  <TableCell className="text-muted-foreground">{p.currentTeam}</TableCell>
                  <TableCell><Badge variant="outline">{label(positionLabels, p.position, lang)}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{label(footLabels, p.foot, lang)}</TableCell>
                  <TableCell className="tabular-nums">{formatCurrency(p.marketValue, "EUR", lang)}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{formatDate(p.contractEnd, lang)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t("common.showing")} {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} {t("common.of")} {filtered.length} {t("players.count")}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>{t("common.previous")}</Button>
            <span>{t("common.page")} {page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>{t("common.next")}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
