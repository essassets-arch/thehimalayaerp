"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import {
  Truck,
  Play,
  Search,
  Download,
  RotateCw,
  History,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink,
  X,
  Phone,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { backendFetch } from "@/lib/backendFetch";
import {
  DispatchPageShell,
  DispatchNavigationTabs,
  DispatchLoadingState,
  DispatchEmptyState,
  DispatchErrorState,
  DispatchStatusBadge,
} from "../components";
import styles from "./InTransit.module.css";

interface Customer {
  companyName: string;
}

interface SalesOrder {
  id?: string;
  orderNumber: string;
  requestedDeliveryDate: string | null;
  customer: Customer;
}

interface Dispatch {
  id: string;
  dispatchNo: string;
  status: string;
  transporterName: string | null;
  vehicleNumber: string | null;
  driverName: string | null;
  driverPhone: string | null;
  dispatchedAt: string | null;
  deliveredAt?: string | null;
  receivedBy?: string | null;
  receiverPhone?: string | null;
  podUrl?: string | null;
  eta: string | null;
  deliveryAddress: string | null;
  packageCount: number | null;
  packageType: string | null;
  salesOrder: SalesOrder;
}

function normalizeDispatchCategory(cat?: string | null): 'D1' | 'D2' | null {
  if (!cat) return null;
  const s = String(cat).trim().toUpperCase();
  if (['D1', 'DISPATCH 1', 'DISPATCH_1', 'CATEGORY 1', 'CATEGORY_1', 'CAT 1', 'CAT_1', '1'].includes(s)) {
    return 'D1';
  }
  if (['D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CATEGORY_2', 'CAT 2', 'CAT_2', '2'].includes(s)) {
    return 'D2';
  }
  return null;
}

function normalizeKey(str?: string | null): string {
  if (!str) return "";
  return String(str).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

const SEEDED_SALES_USER_MAP: Record<string, string> = {
  // UUIDs from Seed and DB
  "a286d9a7-07ca-4123-9431-9a4e16747d3b": "Sales 1",
  "a7809e00-c2d1-494d-8731-83ef09f92da8": "Sales 2",
  "9eb5887b-1af8-460f-ba9d-4ef757d83223": "Sales 3",
  "36657a96-18f8-41ad-abcd-b45f0f39d896": "Sales 4",
  "f4d7db21-43d3-463c-a117-9f4a116b26af": "Sales Five",
  "226c7089-c88d-4cb7-9782-26e5e231fa6c": "Sales Six",
  "1e7cc3df-f88c-4c20-9251-a88673a70fbc": "Sales Seven",
  "2d9982c3-7c79-4b08-bcbc-5aec1e91a20f": "SuperSales 1",
  "27f469e1-1fba-460d-a948-922d51af8ec7": "SuperSales 2",

  // Real Database UUIDs
  "154d8fbf-9a4e-4668-bf61-179da81d04be": "Sales 1",
  "31534e9b-724f-47bd-8e40-97462f603aeb": "Sales 2",
  "a3dd0133-c260-4c91-bac5-7e229d1d3671": "Sales 3",
  "bc833bfd-ce00-4515-ac81-4e973b7f289c": "Sales 4",
  "2c1961cd-7e40-4736-92ba-a0f982ee9558": "Sales Five",
  "2ba631e3-09fd-49e7-8a9e-386cc227a81e": "Sales Six",
  "b4e35bef-3ee6-4a56-9e33-bb79791b2170": "Sales Seven",
  "7c3a3b46-e26c-4404-96e9-63b83b86c460": "SuperSales 1",
  "cbdb5de9-d79d-48d7-b917-30d7b50f8ad3": "SuperSales 2",
  "6007bc63-eeb6-4e49-a3b1-f5d77be8734c": "Sales Eleven",
  "95d8c289-5341-4a96-98ca-47b690745f98": "Jyoti (Sales 12)",
  "e234eab6-4e7e-4d0e-97d9-56766004f357": "Sales Thirteen",
  "5f20dc83-3a53-4346-9b9a-c508bb0d0147": "Sales Fourteen",
  "6b986c85-e846-4b8b-9df6-c80d3d989160": "Trushna G",
  "5dbef6b2-9b73-4322-b4ac-50af45924cb6": "Moksha N",
  "8866c877-18cc-4ffa-b850-fcd568d12238": "Abbas B",
  "6583105f-5e9a-408d-81ab-8baca70219c6": "Hussain T",
  "3b3c4d40-94ec-4824-933c-260ebb2660e8": "Sana R",
  "a380ddcf-78e5-44b9-9be6-41e4b01a1f49": "Ravikant T",
  "90917af7-b7bd-454a-871b-95ff1e34dc36": "Sales Manager",

  // Emails
  "sales1@himalayaerp.com": "Sales 1",
  "sales2@himalayaerp.com": "Sales 2",
  "sales3@himalayaerp.com": "Sales 3",
  "sales4@himalayaerp.com": "Sales 4",
  "sales5@himalayaerp.com": "Sales Five",
  "sales6@himalayaerp.com": "Sales Six",
  "sales7@himalayaerp.com": "Sales Seven",
  "supersales1@himalayaerp.com": "SuperSales 1",
  "supersales2@himalayaerp.com": "SuperSales 2",
  "sales11@himalayaerp.com": "Sales Eleven",
  "sales12@himalayaerp.com": "Jyoti (Sales 12)",
  "sales13@himalayaerp.com": "Sales Thirteen",
  "sales14@himalayaerp.com": "Sales Fourteen",
  "trushna.g@himalayaerp.com": "Trushna G",
  "moksha.n@himalayaerp.com": "Moksha N",
  "abbas.b@himalayaerp.com": "Abbas B",
  "hussain.t@himalayaerp.com": "Hussain T",
  "sana.r@himalayaerp.com": "Sana R",
  "ravikant.t@himalayaerp.com": "Ravikant T",

  // Aliases
  "sales1": "Sales 1",
  "sales2": "Sales 2",
  "sales3": "Sales 3",
  "sales4": "Sales 4",
  "sales5": "Sales Five",
  "sales6": "Sales Six",
  "sales7": "Sales Seven",
  "supersales1": "SuperSales 1",
  "supersales2": "SuperSales 2",
};

function isValidCustomerName(name?: any): boolean {
  if (!name || typeof name !== "string") return false;
  const t = name.trim();
  if (
    !t ||
    t === "—" ||
    t === "-" ||
    t === "N/A" ||
    t === "null" ||
    t === "undefined" ||
    t === "Consignee Client" ||
    t === "Client Consignee" ||
    t === "Customer Designated Delivery Site" ||
    t === "Customer Delivery Site" ||
    t === "Production Dispatch" ||
    t === "Factory Finished Goods"
  ) {
    return false;
  }
  if (t.startsWith("usr_") || t.startsWith("user_") || t.startsWith("USR-")) return false;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)) return false;
  return true;
}

function resolveCustomerName(entity?: any, ...fallbackEntities: any[]): string {
  const allEntities = [entity, ...fallbackEntities].filter(Boolean);
  for (const obj of allEntities) {
    if (!obj || typeof obj !== "object") continue;

    const directCandidates = [
      obj.customer?.companyName,
      obj.customer?.name,
      obj.salesOrder?.customer?.companyName,
      obj.salesOrder?.customer?.name,
      obj.salesOrder?.customerName,
      obj.customerName,
      obj.companyName,
      obj.clientName,
      obj.consigneeName,
      obj.sourceQuotation?.customer?.companyName,
      obj.sourceQuotation?.customerName,
      obj.sourceQuotation?.lead?.companyName,
      obj.quotation?.customer?.companyName,
      obj.quotation?.customerName,
      obj.quotation?.lead?.companyName,
      obj.lead?.companyName,
      obj.lead?.projectName,
      obj.salesOrder?.quotation?.customer?.companyName,
      obj.salesOrder?.quotation?.customerName,
      obj.salesOrder?.quotation?.lead?.companyName,
      obj.salesOrder?.sourceQuotation?.customer?.companyName,
      obj.salesOrder?.sourceQuotation?.customerName,
      obj.salesOrder?.sourceQuotation?.lead?.companyName,
      obj.salesOrder?.lead?.companyName,
      obj.salesOrder?.lead?.projectName,
      obj.workOrder?.productionPlan?.salesOrder?.customer?.companyName,
      obj.workOrder?.productionPlan?.salesOrder?.customerName,
      obj.workOrder?.customer?.companyName,
    ];

    for (const cand of directCandidates) {
      if (isValidCustomerName(cand)) {
        return String(cand).trim();
      }
    }
  }

  return "Consignee Client";
}

function isValidSalesPersonName(name?: any): boolean {
  if (!name || typeof name !== "string") return false;
  const t = name.trim();
  if (!t || t === "—" || t === "N/A" || t === "null" || t === "undefined" || t === "Sales Executive") return false;
  if (t.startsWith("usr_") || t.startsWith("user_") || t.startsWith("USR-")) return false;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)) return false;
  return true;
}

function resolveSalesPersonName(entity?: any, ...fallbackEntities: any[]): string {
  const allEntities = [entity, ...fallbackEntities].filter(Boolean);
  let userMap: Map<string, string> | undefined = undefined;

  for (const obj of allEntities) {
    if (obj instanceof Map) {
      userMap = obj;
      continue;
    }
    if (!obj || typeof obj !== "object") continue;

    const execObj =
      obj.salesExecutive ||
      obj.salesOrder?.salesExecutive ||
      obj.quotation?.salesExecutive ||
      obj.quotation?.lead?.salesExecutive ||
      obj.sourceQuotation?.salesExecutive ||
      obj.sourceQuotation?.lead?.salesExecutive ||
      obj.productionPlan?.salesOrder?.salesExecutive ||
      obj.productionPlan?.salesOrder?.quotation?.lead?.salesExecutive ||
      obj.productionPlan?.salesOrder?.sourceQuotation?.lead?.salesExecutive ||
      obj.createdBy ||
      obj.salesOrder?.createdBy ||
      obj.customer?.salesExecutive;

    if (execObj && typeof execObj === "object") {
      const name = execObj.name ? String(execObj.name).trim() : "";
      if (isValidSalesPersonName(name)) return name;

      const email = execObj.email ? String(execObj.email).trim().toLowerCase() : "";
      if (email && SEEDED_SALES_USER_MAP[email]) return SEEDED_SALES_USER_MAP[email];
      if (email && userMap?.has(email)) return userMap.get(email)!;

      const id = execObj.id ? String(execObj.id).trim().toLowerCase() : "";
      if (id && SEEDED_SALES_USER_MAP[id]) return SEEDED_SALES_USER_MAP[id];
      if (id && userMap?.has(id)) return userMap.get(id)!;
    }

    const candidates = [
      obj.salesperson,
      obj.salespersonName,
      obj.salesPersonName,
      obj.salesPerson,
      typeof obj.salesExecutive === "string" ? obj.salesExecutive : null,
      obj.salesExecutiveName,
      obj.salesRep,
      obj.createdByName,
      obj.salesOrder?.salesperson,
      obj.salesOrder?.salespersonName,
      obj.salesOrder?.salesPersonName,
      obj.salesOrder?.salesExecutiveName,
      obj.quotation?.salesperson,
      obj.quotation?.salesPersonName,
      obj.quotation?.salesExecutiveName,
      obj.quotation?.lead?.salesExecutive?.name,
      obj.sourceQuotation?.salesperson,
      obj.sourceQuotation?.salesPersonName,
      obj.sourceQuotation?.salespersonName,
      obj.sourceQuotation?.createdByName,
      obj.productionPlan?.salesOrder?.salesperson,
      obj.productionPlan?.salesOrder?.salesExecutiveName,
      obj.productionPlan?.salesOrder?.quotation?.lead?.salesExecutive?.name,
      obj.salesExecutiveId,
      obj.salesOrder?.salesExecutiveId,
      obj.createdById,
    ];

    for (const cand of candidates) {
      if (!cand) continue;
      const val = String(cand).trim();
      if (!val) continue;
      const lower = val.toLowerCase();
      if (SEEDED_SALES_USER_MAP[val]) return SEEDED_SALES_USER_MAP[val];
      if (SEEDED_SALES_USER_MAP[lower]) return SEEDED_SALES_USER_MAP[lower];
      if (userMap?.has(lower)) return userMap.get(lower)!;
      if (userMap?.has(val)) return userMap.get(val)!;
      if (isValidSalesPersonName(val)) return val;
    }
  }

  return "Sales Executive";
}

export default function InTransitPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");
  const basePath = isDispatch2 ? "/dispatch-2" : "/dispatch";

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"transit" | "history">("transit");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPodImage, setSelectedPodImage] = useState<string | null>(null);

  const getExpectedDelivery = (dispatchItem: Dispatch) =>
    dispatchItem.eta || dispatchItem.salesOrder?.requestedDeliveryDate || null;

  // Query 1: Active In-Transit Dispatches
  const {
    data: dispatches = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery<Dispatch[]>({
    queryKey: ["in-transit-dispatches"],
    queryFn: async () => {
      const payload = await backendFetch<any>(
        "/api/backend/logistics/dispatches?status=IN_TRANSIT,OUT_FOR_DELIVERY",
      );
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.data?.data)) return payload.data.data;
      return [];
    },
    refetchInterval: 30000,
  });

  // Query 2: Delivered History Dispatches
  const {
    data: historyDispatches = [],
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useQuery<Dispatch[]>({
    queryKey: ["in-transit-delivered-history"],
    queryFn: async () => {
      const payload = await backendFetch<any>(
        "/api/backend/logistics/dispatches?status=DELIVERED",
      );
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.data?.data)) return payload.data.data;
      return [];
    },
    refetchInterval: 30000,
  });

  // Query: Users Map for sales executive lookup
  const { data: usersMap = new Map<string, string>() } = useQuery<Map<string, string>>({
    queryKey: ["users-master-sales-map"],
    queryFn: async () => {
      try {
        const res = await backendFetch<any>("/api/backend/users?limit=1000");
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.users) ? res.users : [];
        const map = new Map<string, string>();
        list.forEach((u: any) => {
          if (u.id && u.name) map.set(String(u.id).toLowerCase(), String(u.name).trim());
          if (u.email && u.name) map.set(String(u.email).toLowerCase(), String(u.name).trim());
          if (u.username && u.name) map.set(String(u.username).toLowerCase(), String(u.name).trim());
        });
        return map;
      } catch {
        return new Map();
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Query: Sales Orders Map for accurate customer and sales person lookup
  const { data: salesOrdersMap = new Map<string, any>() } = useQuery<Map<string, any>>({
    queryKey: ["sales-orders-master-map"],
    queryFn: async () => {
      try {
        const res = await backendFetch<any>("/api/backend/sales/orders?limit=1000");
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const map = new Map<string, any>();
        list.forEach((so: any) => {
          if (!so) return;
          if (so.id) map.set(String(so.id).toLowerCase(), so);
          if (so.orderNumber) {
            map.set(String(so.orderNumber).toLowerCase(), so);
            map.set(normalizeKey(so.orderNumber), so);
          }
        });
        return map;
      } catch {
        return new Map();
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const getResolvedMetadata = React.useCallback(
    (item: Dispatch) => {
      const soId = String(item.salesOrder?.id || (item as any).salesOrderId || "").toLowerCase();
      const soNumber = String(item.salesOrder?.orderNumber || (item as any).orderNumber || "");
      const matchedSo =
        salesOrdersMap.get(soId) ||
        salesOrdersMap.get(normalizeKey(soNumber)) ||
        salesOrdersMap.get(soNumber.toLowerCase());

      let localMeta: any = null;
      if (typeof window !== "undefined") {
        try {
          const rawMeta = localStorage.getItem("himalaya_dispatches_full_metadata");
          if (rawMeta) {
            const parsed = JSON.parse(rawMeta);
            localMeta =
              parsed[soId] ||
              parsed[normalizeKey(soNumber)] ||
              parsed[soNumber.toLowerCase()] ||
              parsed[String(item.dispatchNo || "").toLowerCase()] ||
              parsed[normalizeKey(item.dispatchNo)];
          }
        } catch {}
      }

      const customerName = resolveCustomerName(
        item.salesOrder,
        matchedSo,
        localMeta,
        item
      );

      const salesPersonName = resolveSalesPersonName(
        item.salesOrder,
        matchedSo,
        localMeta,
        usersMap,
        item
      );

      return { customerName, salesPersonName, matchedSo };
    },
    [salesOrdersMap, usersMap]
  );

  // Group & deduplicate by Sales Order: keep only the latest active dispatch per Sales Order
  const dedupedDispatches = React.useMemo(() => {
    const orderMap = new Map<string, Dispatch>();
    const sorted = [...dispatches].sort((a, b) => {
      const tA = new Date(a.dispatchedAt || (a as any).createdAt || 0).getTime();
      const tB = new Date(b.dispatchedAt || (b as any).createdAt || 0).getTime();
      if (tB !== tA) return tB - tA;
      return String(b.dispatchNo || "").localeCompare(String(a.dispatchNo || ""));
    });

    for (const d of sorted) {
      const soKey = d.salesOrder?.id || d.salesOrder?.orderNumber || d.id;
      if (!orderMap.has(soKey)) {
        orderMap.set(soKey, d);
      }
    }
    return Array.from(orderMap.values());
  }, [dispatches]);

  const filteredDispatches = React.useMemo(() => {
    const targetCat = isDispatch2 ? "D2" : "D1";
    const categoryFiltered = dedupedDispatches.filter((d) => {
      const rawCat = (d as any).dispatchCategory || (d as any).dispatch_category;
      if (!rawCat) return true;
      const norm = normalizeDispatchCategory(rawCat);
      if (!norm) return true;
      return norm === targetCat;
    });

    if (!search.trim()) return categoryFiltered;
    const lower = search.toLowerCase();
    return categoryFiltered.filter((d) => {
      const meta = getResolvedMetadata(d);
      return (
        d.dispatchNo?.toLowerCase().includes(lower) ||
        d.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
        meta.customerName.toLowerCase().includes(lower) ||
        meta.salesPersonName.toLowerCase().includes(lower) ||
        d.driverName?.toLowerCase().includes(lower) ||
        d.vehicleNumber?.toLowerCase().includes(lower)
      );
    });
  }, [dedupedDispatches, search, isDispatch2, getResolvedMetadata]);

  const filteredHistoryDispatches = React.useMemo(() => {
    const targetCat = isDispatch2 ? "D2" : "D1";
    const categoryFiltered = historyDispatches.filter((d) => {
      if (String(d.status || "").toUpperCase() !== "DELIVERED") return false;
      const rawCat = (d as any).dispatchCategory || (d as any).dispatch_category;
      if (!rawCat) return true;
      const norm = normalizeDispatchCategory(rawCat);
      if (!norm) return true;
      return norm === targetCat;
    });

    const sorted = [...categoryFiltered].sort((a, b) => {
      const tA = new Date(a.deliveredAt || (a as any).createdAt || 0).getTime();
      const tB = new Date(b.deliveredAt || (b as any).createdAt || 0).getTime();
      return tB - tA;
    });

    if (!search.trim()) return sorted;
    const lower = search.toLowerCase();
    return sorted.filter((d) => {
      const meta = getResolvedMetadata(d);
      return (
        d.dispatchNo?.toLowerCase().includes(lower) ||
        d.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
        meta.customerName.toLowerCase().includes(lower) ||
        meta.salesPersonName.toLowerCase().includes(lower) ||
        d.receivedBy?.toLowerCase().includes(lower) ||
        d.receiverPhone?.toLowerCase().includes(lower) ||
        d.driverName?.toLowerCase().includes(lower)
      );
    });
  }, [historyDispatches, search, isDispatch2, getResolvedMetadata]);

  const handleStartDelivery = async (dispatchId: string) => {
    setLoadingId(dispatchId);
    try {
      await backendFetch(
        `/api/backend/logistics/dispatches/${dispatchId}/start-delivery`,
        {
          method: "POST",
        },
      ).catch(() => {});
      toast.success("Redirecting to delivery handover board");
      queryClient.invalidateQueries({ queryKey: ["in-transit-dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-run-dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-history-dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["pending-dispatch-unified-items"] });
      router.push(`${basePath}/delivery`);
    } catch {
      router.push(`${basePath}/delivery`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleExportCsv = () => {
    if (activeTab === "transit") {
      if (!filteredDispatches.length) return;
      const exportRows = filteredDispatches.map((d) => {
        const meta = getResolvedMetadata(d);
        return {
          "Dispatch No": (d.dispatchNo || "").replace(/\s+/g, ""),
          "Sales Order": d.salesOrder?.orderNumber || "—",
          Customer: meta.customerName,
          "Sales Person": meta.salesPersonName,
          "Driver Name": d.driverName || "—",
          "Vehicle Number": d.vehicleNumber || "—",
          "Dispatched At": d.dispatchedAt ? new Date(d.dispatchedAt).toLocaleString() : "—",
          ETA: d.eta ? new Date(d.eta).toLocaleDateString() : "—",
          Status: d.status,
        };
      });
      const headers = Object.keys(exportRows[0]);
      const csvContent = [
        headers.join(","),
        ...exportRows.map((row) =>
          headers.map((h) => `"${String((row as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `in_transit_dispatches_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    } else {
      if (!filteredHistoryDispatches.length) return;
      const exportRows = filteredHistoryDispatches.map((d) => {
        const meta = getResolvedMetadata(d);
        return {
          "Dispatch No": (d.dispatchNo || "").replace(/\s+/g, ""),
          "Sales Order": d.salesOrder?.orderNumber || "—",
          Customer: meta.customerName,
          "Sales Person": meta.salesPersonName,
          "Received By": d.receivedBy || "—",
          "Receiver Mobile": d.receiverPhone || "—",
          Driver: d.driverName || "—",
          "Delivered Timestamp": d.deliveredAt ? new Date(d.deliveredAt).toLocaleString("en-IN") : "—",
          Status: d.status,
        };
      });
      const headers = Object.keys(exportRows[0]);
      const csvContent = [
        headers.join(","),
        ...exportRows.map((row) =>
          headers.map((h) => `"${String((row as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dispatch_history_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    }
  };

  const formatCleanNo = (num?: string | null) => {
    if (!num) return "—";
    return num.replace(/\s*-\s*/g, "-").replace(/\s+/g, "");
  };

  return (
    <DispatchPageShell>
      <div className={styles.inTransitPage}>
        {/* ---------- HERO ---------- */}
        <section className={styles.inTransitHero}>
          <div className={styles.inTransitHeroContent}>
            <div className={styles.inTransitHeroLabel}>
              {isDispatch2 ? "Dispatch 2 (Sahad Dispatch) · Logistics Operations" : "Dispatch 1 (Factory Dispatch) · Logistics Operations"}
            </div>
            <h1 className={styles.inTransitHeroTitle}>
              {isDispatch2
                ? (activeTab === "transit" ? "Dispatch 2 — Active Transit Shipments" : "Dispatch 2 — History & POD")
                : (activeTab === "transit" ? "Dispatch 1 — Active Transit Shipments" : "Dispatch 1 — History & POD")}
            </h1>
            <p className={styles.inTransitHeroDescription}>
              {activeTab === "transit"
                ? (isDispatch2
                    ? "Monitor active Trading Product shipments currently on the road. Click Start Delivery when vehicle arrives at destination area."
                    : "Monitor active Manufacturing shipments currently on the road. Click Start Delivery when vehicle arrives at destination area.")
                : "Review all completed and delivered shipments with verified receiver details and POD image proofs."}
            </p>
          </div>

          <div className={styles.inTransitHeroActions}>
            <div className={styles.inTransitKpi}>
              <div className={styles.inTransitKpiIcon}>
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className={styles.inTransitKpiValue}>
                  {activeTab === "transit" ? filteredDispatches.length : filteredHistoryDispatches.length}
                </div>
                <div className={styles.inTransitKpiLabel}>
                  {activeTab === "transit" ? "Active In-Transit" : "Total Delivered"}
                </div>
              </div>
            </div>

            <button
              type="button"
              className={styles.inTransitRefresh}
              onClick={() => {
                refetch();
                refetchHistory();
              }}
              disabled={isRefetching || isHistoryLoading}
            >
              <RotateCw className={`w-4 h-4 ${isRefetching || isHistoryLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </section>

        {/* ---------- SUB-TAB SWITCHER ---------- */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
          <button
            type="button"
            onClick={() => setActiveTab("transit")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: activeTab === "transit" ? "#2563eb" : "#ffffff",
              color: activeTab === "transit" ? "#ffffff" : "#64748b",
              border: activeTab === "transit" ? "1px solid #2563eb" : "1px solid #d8e1ef",
              boxShadow: activeTab === "transit" ? "0 1px 2px rgba(37,99,235,0.2)" : "none",
            }}
          >
            <Truck size={15} />
            <span>In-Transit Queue</span>
            <span
              style={{
                padding: "1px 7px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                background: activeTab === "transit" ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                color: activeTab === "transit" ? "#ffffff" : "#475569",
              }}
            >
              {filteredDispatches.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: activeTab === "history" ? "#2563eb" : "#ffffff",
              color: activeTab === "history" ? "#ffffff" : "#64748b",
              border: activeTab === "history" ? "1px solid #2563eb" : "1px solid #d8e1ef",
              boxShadow: activeTab === "history" ? "0 1px 2px rgba(37,99,235,0.2)" : "none",
            }}
          >
            <History size={15} />
            <span>Dispatch History</span>
            <span
              style={{
                padding: "1px 7px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                background: activeTab === "history" ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                color: activeTab === "history" ? "#ffffff" : "#475569",
              }}
            >
              {filteredHistoryDispatches.length}
            </span>
          </button>
        </div>

        {/* ---------- QUEUE HEADER & TOOLBAR ---------- */}
        <section className={styles.transitQueueCard}>
          <div className={styles.transitQueueHeader}>
            <h2 className={styles.transitQueueTitle}>
              {activeTab === "transit" ? "Transit Queue" : "Completed Deliveries"}
            </h2>
            <p className={styles.transitQueueMeta}>
              {activeTab === "transit"
                ? `Auto-refreshes every 30s · Showing ${filteredDispatches.length} active shipment${filteredDispatches.length !== 1 ? "s" : ""}`
                : `Showing ${filteredHistoryDispatches.length} completed delivery record${filteredHistoryDispatches.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className={styles.transitQueueToolbar}>
            <div className={styles.transitSearch}>
              <Search className={styles.transitSearchIcon} />
              <input
                type="text"
                placeholder={
                  activeTab === "transit"
                    ? "Search dispatch no, sales order, customer, driver or vehicle..."
                    : "Search dispatch no, order, customer, driver or receiver..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              type="button"
              className={styles.transitExport}
              onClick={handleExportCsv}
              disabled={(activeTab === "transit" ? filteredDispatches.length : filteredHistoryDispatches.length) === 0}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </section>

        {/* ---------- TAB 1: IN TRANSIT ---------- */}
        {activeTab === "transit" && (
          <>
            {isLoading && <DispatchLoadingState count={5} />}

            {error && !isLoading && <DispatchErrorState onRetry={() => refetch()} />}

            {!isLoading && !error && filteredDispatches.length === 0 && (
              <DispatchEmptyState
                title={search ? "No Matching Transit Shipments" : "No Active Transit Shipments"}
                description={
                  search
                    ? `No active transit shipments match "${search}". Try clearing your search.`
                    : "No shipments are currently in transit. Create a dispatch gate pass from the Pending Queue to start transit runs."
                }
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !error && filteredDispatches.length > 0 && (
              <section className={styles.transitTableCard}>
                <div className={styles.transitTableScroll}>
                  <table className={styles.transitTable}>
                    <thead>
                      <tr>
                        <th>Dispatch No.</th>
                        <th>Sales Order</th>
                        <th>Customer</th>
                        <th>Driver / Vehicle</th>
                        <th>Dispatched At</th>
                        <th>Expected Delivery</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDispatches.map((dispatchItem) => {
                        const expectedDate = getExpectedDelivery(dispatchItem);
                        const isOverdue = expectedDate && new Date(expectedDate) < new Date();
                        const cleanDispNo = formatCleanNo(dispatchItem.dispatchNo);
                        const cleanSoNo = formatCleanNo(dispatchItem.salesOrder?.orderNumber);
                        const meta = getResolvedMetadata(dispatchItem);

                        return (
                          <tr key={dispatchItem.id}>
                            {/* Dispatch No */}
                            <td data-label="Dispatch No.">
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  padding: "4px 8px",
                                  borderRadius: 8,
                                  background: "#eff6ff",
                                  border: "1px solid #bfdbfe",
                                  color: "#1d4ed8",
                                  fontWeight: 700,
                                  fontFamily: "monospace",
                                  fontSize: 12,
                                }}
                              >
                                <Truck style={{ width: 14, height: 14, color: "#3b82f6" }} />
                                #{cleanDispNo}
                              </span>
                            </td>

                            {/* Sales Order */}
                            <td data-label="Sales Order">
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "3px 8px",
                                  borderRadius: 6,
                                  background: "#f1f5f9",
                                  border: "1px solid #e2e8f0",
                                  color: "#0f172a",
                                  fontWeight: 700,
                                  fontFamily: "monospace",
                                  fontSize: 12,
                                }}
                              >
                                #{cleanSoNo}
                              </span>
                            </td>

                            {/* Customer & Sales Person */}
                            <td data-label="Customer">
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                  style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: "50%",
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    color: "#475569",
                                    fontWeight: 800,
                                    fontSize: 11,
                                    display: "grid",
                                    placeItems: "center",
                                    textTransform: "uppercase",
                                    flexShrink: 0,
                                  }}
                                >
                                  {(meta.customerName || "C")[0]}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                                  <span
                                    style={{
                                      fontWeight: 700,
                                      color: "#0f172a",
                                      fontSize: 13,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      display: "block",
                                      maxWidth: 160,
                                    }}
                                    title={meta.customerName}
                                  >
                                    {meta.customerName}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 600,
                                      color: "#0284c7",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                      marginTop: 1,
                                    }}
                                    title={`Sales Person: ${meta.salesPersonName}`}
                                  >
                                    <User size={10} color="#0284c7" />
                                    {meta.salesPersonName}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Driver / Vehicle */}
                            <td data-label="Driver / Vehicle">
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
                                  {dispatchItem.driverName || "—"}
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  {dispatchItem.vehicleNumber && (
                                    <span
                                      style={{
                                        padding: "2px 6px",
                                        borderRadius: 4,
                                        background: "#eff6ff",
                                        border: "1px solid #bfdbfe",
                                        color: "#2563eb",
                                        fontFamily: "monospace",
                                        fontSize: 11,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {dispatchItem.vehicleNumber}
                                    </span>
                                  )}
                                  {dispatchItem.driverPhone && (
                                    <a
                                      href={`tel:${dispatchItem.driverPhone}`}
                                      style={{ color: "#64748b", fontSize: 11, fontFamily: "monospace", textDecoration: "none" }}
                                    >
                                      · {dispatchItem.driverPhone}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Dispatched At */}
                            <td data-label="Dispatched At">
                              <span style={{ color: "#475569", fontSize: 12, fontWeight: 600 }}>
                                {dispatchItem.dispatchedAt
                                  ? new Date(dispatchItem.dispatchedAt).toLocaleString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "—"}
                              </span>
                            </td>

                            {/* Expected Delivery */}
                            <td data-label="Expected Delivery">
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "3px 8px",
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: isOverdue ? "#fef2f2" : "#f0fdf4",
                                  color: isOverdue ? "#b91c1c" : "#166534",
                                  border: isOverdue ? "1px solid #fecaca" : "1px solid #bbf7d0",
                                }}
                              >
                                {expectedDate
                                  ? new Date(expectedDate).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </span>
                            </td>

                            {/* Status */}
                            <td data-label="Status">
                              <span className={styles.transitStatus}>
                                <span className={styles.transitStatusDot} style={{ background: dispatchItem.status === 'OUT_FOR_DELIVERY' ? '#f59e0b' : '#3b82f6' }} />
                                {dispatchItem.status === 'OUT_FOR_DELIVERY' ? 'OUT FOR DELIVERY' : 'IN TRANSIT'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td data-label="Actions">
                              <button
                                type="button"
                                onClick={() => handleStartDelivery(dispatchItem.id)}
                                disabled={loadingId === dispatchItem.id}
                                className={styles.transitStartDelivery}
                                style={{
                                  background: dispatchItem.status === 'OUT_FOR_DELIVERY' ? '#16a34a' : '#2563eb'
                                }}
                              >
                                <Play style={{ width: 13, height: 13, fill: "currentColor" }} className={loadingId === dispatchItem.id ? "animate-spin" : ""} />
                                <span>{dispatchItem.status === 'OUT_FOR_DELIVERY' ? 'Deliver & POD' : 'Start Delivery'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}

        {/* ---------- TAB 2: DISPATCH HISTORY ---------- */}
        {activeTab === "history" && (
          <>
            {isHistoryLoading && <DispatchLoadingState count={5} />}

            {!isHistoryLoading && filteredHistoryDispatches.length === 0 && (
              <DispatchEmptyState
                title={search ? "No Matching History Found" : "No Completed Deliveries"}
                description={
                  search
                    ? `No delivered shipments match "${search}". Try clearing your search.`
                    : "No completed delivery runs recorded yet. Confirmed deliveries will appear here."
                }
                onRetry={() => refetchHistory()}
              />
            )}

            {!isHistoryLoading && filteredHistoryDispatches.length > 0 && (
              <section className={styles.transitTableCard}>
                <div className={styles.transitTableScroll}>
                  <table className={styles.transitTable}>
                    <thead>
                      <tr>
                        <th>Dispatch No.</th>
                        <th>Sales Order</th>
                        <th>Customer</th>
                        <th>Receiver Details</th>
                        <th>Driver / Vehicle</th>
                        <th>Delivered At</th>
                        <th style={{ textAlign: "center" }}>POD Proof</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistoryDispatches.map((dispatchItem) => {
                        const cleanDispNo = formatCleanNo(dispatchItem.dispatchNo);
                        const cleanSoNo = formatCleanNo(dispatchItem.salesOrder?.orderNumber);
                        const meta = getResolvedMetadata(dispatchItem);

                        return (
                          <tr key={dispatchItem.id}>
                            {/* Dispatch Number */}
                            <td data-label="Dispatch No.">
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  padding: "4px 8px",
                                  borderRadius: 8,
                                  background: "#eff6ff",
                                  border: "1px solid #bfdbfe",
                                  color: "#1d4ed8",
                                  fontWeight: 700,
                                  fontFamily: "monospace",
                                  fontSize: 12,
                                }}
                              >
                                <Truck style={{ width: 14, height: 14, color: "#3b82f6" }} />
                                #{cleanDispNo}
                              </span>
                            </td>

                            {/* Sales Order */}
                            <td data-label="Sales Order">
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "3px 8px",
                                  borderRadius: 6,
                                  background: "#f1f5f9",
                                  border: "1px solid #e2e8f0",
                                  color: "#0f172a",
                                  fontWeight: 700,
                                  fontFamily: "monospace",
                                  fontSize: 12,
                                }}
                              >
                                #{cleanSoNo}
                              </span>
                            </td>

                            {/* Customer & Sales Person */}
                            <td data-label="Customer">
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                  style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: "50%",
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    color: "#475569",
                                    fontWeight: 800,
                                    fontSize: 11,
                                    display: "grid",
                                    placeItems: "center",
                                    textTransform: "uppercase",
                                    flexShrink: 0,
                                  }}
                                >
                                  {(meta.customerName || "C")[0]}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                                  <span
                                    style={{
                                      fontWeight: 700,
                                      color: "#0f172a",
                                      fontSize: 13,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      display: "block",
                                      maxWidth: 150,
                                    }}
                                    title={meta.customerName}
                                  >
                                    {meta.customerName}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 600,
                                      color: "#0284c7",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                      marginTop: 1,
                                    }}
                                    title={`Sales Person: ${meta.salesPersonName}`}
                                  >
                                    <User size={10} color="#0284c7" />
                                    {meta.salesPersonName}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Receiver Details */}
                            <td data-label="Receiver">
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                  <User style={{ width: 13, height: 13, color: "#64748b" }} />
                                  <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
                                    {dispatchItem.receivedBy || "—"}
                                  </span>
                                </div>
                                {dispatchItem.receiverPhone && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <Phone style={{ width: 12, height: 12, color: "#16a34a" }} />
                                    <a
                                      href={`tel:${dispatchItem.receiverPhone}`}
                                      style={{
                                        color: "#16a34a",
                                        fontSize: 11,
                                        fontFamily: "monospace",
                                        fontWeight: 700,
                                        textDecoration: "none",
                                      }}
                                    >
                                      +91 {dispatchItem.receiverPhone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Driver / Vehicle */}
                            <td data-label="Driver / Vehicle">
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontWeight: 600, color: "#334155", fontSize: 13 }}>
                                  {dispatchItem.driverName || "—"}
                                </span>
                                {dispatchItem.vehicleNumber && (
                                  <span
                                    style={{
                                      display: "inline-block",
                                      width: "max-content",
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                      background: "#f1f5f9",
                                      border: "1px solid #cbd5e1",
                                      color: "#475569",
                                      fontFamily: "monospace",
                                      fontSize: 11,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {dispatchItem.vehicleNumber}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Delivered At */}
                            <td data-label="Delivered At">
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <Calendar style={{ width: 13, height: 13, color: "#64748b" }} />
                                <span style={{ color: "#334155", fontSize: 12, fontWeight: 600 }}>
                                  {dispatchItem.deliveredAt
                                    ? new Date(dispatchItem.deliveredAt).toLocaleString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "—"}
                                </span>
                              </div>
                            </td>

                            {/* POD Image */}
                            <td data-label="POD Proof" style={{ textAlign: "center" }}>
                              {dispatchItem.podUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPodImage(dispatchItem.podUrl || null)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    background: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    color: "#166534",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                  }}
                                >
                                  <ImageIcon style={{ width: 12, height: 12 }} />
                                  <span>View POD</span>
                                </button>
                              ) : (
                                <span style={{ color: "#94a3b8", fontSize: 11, fontStyle: "italic" }}>
                                  No image
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td data-label="Status" style={{ textAlign: "center" }}>
                              <DispatchStatusBadge status={dispatchItem.status || "DELIVERED"} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* POD Image Lightbox Modal */}
      {selectedPodImage && (
        <div
          role="presentation"
          onClick={() => setSelectedPodImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
              maxWidth: "600px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                Proof of Delivery (POD)
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <a
                  href={selectedPodImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#2563eb",
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink style={{ width: 14, height: 14 }} />
                  Open Full Size
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPodImage(null)}
                  style={{
                    border: "none",
                    background: "#f1f5f9",
                    borderRadius: "8px",
                    padding: "6px",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <X style={{ width: 16, height: 16, color: "#64748b" }} />
                </button>
              </div>
            </div>

            <div
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                background: "#000",
                maxHeight: "70vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPodImage}
                alt="Proof of Delivery"
                style={{ width: "100%", maxHeight: "68vh", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      )}
    </DispatchPageShell>
  );
}
