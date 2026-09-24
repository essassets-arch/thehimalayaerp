import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface DispatchPhoto {
  id: string;
  file?: File;
  previewUrl: string;
  dataUrl?: string; // compressed base64 to persist safely across reloads
  name: string;
  size?: number;
  type?: string;
  source: "camera" | "gallery";
}

export interface DispatchDraftState {
  // Context identifiers
  salesOrderId: string;
  orderNumber: string;
  salesOrderItemId: string;
  workOrderId: string;

  // Form Fields
  invoiceNumber: string;
  challanNumber: string;
  totalWeight: number | string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  dispatchRemarks: string;
  transporterName: string;
  ewayBillNumber: string;
  expectedDeliveryDate: string;
  actualFreightPaidAmount: number | string;
  userEditedFreight: boolean;

  // Delivery Addresses (mapped by salesOrderId or orderNumber, plus fallback)
  deliveryAddresses: Record<string, string>;
  deliveryAddress: string;

  // Selected work orders & quantities
  selectedIds: string[];
  dispatchQuantities: Record<string, number>;

  // GPS Location fields (completely isolated from form reset)
  latitude: number | null;
  longitude: number | null;

  // Photos State (Camera / Gallery attachments)
  photos: DispatchPhoto[];

  // Metadata
  lastSavedAt: string | null;

  // Actions
  setField: <K extends keyof DispatchDraftState>(field: K, value: DispatchDraftState[K]) => void;
  setFields: (fields: Partial<DispatchDraftState>) => void;
  setDeliveryAddressForOrder: (orderKey: string, address: string) => void;
  setQuantityForWorkOrder: (workOrderId: string, quantity: number) => void;
  setLocation: (location: { latitude: number; longitude: number }) => void;
  addPhoto: (photo: DispatchPhoto) => void;
  addPhotos: (photos: DispatchPhoto[]) => void;
  removePhoto: (id: string) => void;
  clearPhotos: () => void;
  clearDraft: () => void;
  initializeContext: (params: {
    salesOrderId?: string | null;
    orderNumber?: string | null;
    salesOrderItemId?: string | null;
    workOrderId?: string | null;
    deliveryAddress?: string | null;
  }) => void;
}

export function generateSafeId(): string {
  if (typeof window !== "undefined" && window.crypto && typeof window.crypto.randomUUID === "function") {
    try {
      return window.crypto.randomUUID();
    } catch (_) {}
  }
  return "doc_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
}

export function dataURLtoFile(dataurl: string, filename: string): File {
  try {
    const arr = dataurl.split(",");
    const mime = arr[0]?.match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1] || "");
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    try {
      return new File([u8arr], filename, { type: mime });
    } catch (_) {
      // In mobile WebViews where new File(...) throws Illegal constructor
      const blob = new Blob([u8arr], { type: mime }) as any;
      blob.name = filename;
      blob.lastModified = Date.now();
      return blob as File;
    }
  } catch (err) {
    console.warn("dataURLtoFile fallback:", err);
    return new Blob([], { type: "image/jpeg" }) as any as File;
  }
}

export async function compressImageForDraft(file: File): Promise<{ file: File; dataUrl: string }> {
  const isPdf = file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    return { file, dataUrl: "" };
  }

  return new Promise((resolve) => {
    // 4-second safety guard so compression never hangs or stalls mobile WebView
    const timer = setTimeout(() => {
      resolve({ file, dataUrl: "" });
    }, 4000);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        let rawDataUrl = (e.target?.result as string) || "";
        if (!rawDataUrl) {
          clearTimeout(timer);
          resolve({ file, dataUrl: "" });
          return;
        }

        // On Android WebViews, Gallery files often report application/octet-stream. Normalize to image/jpeg if needed.
        if (rawDataUrl.startsWith("data:application/octet-stream") || rawDataUrl.startsWith("data:;")) {
          const parts = rawDataUrl.split(",");
          if (parts[1]) {
            const base64Prefix = parts[1].substring(0, 16);
            if (base64Prefix.startsWith("iVBORw0KGgo")) {
              rawDataUrl = "data:image/png;base64," + parts[1];
            } else if (base64Prefix.startsWith("R0lGOD")) {
              rawDataUrl = "data:image/gif;base64," + parts[1];
            } else if (base64Prefix.startsWith("UklGR")) {
              rawDataUrl = "data:image/webp;base64," + parts[1];
            } else {
              rawDataUrl = "data:image/jpeg;base64," + parts[1];
            }
          }
        }

        // Downscale image via canvas to keep draft storage lean (~40-60 KB)
        try {
          const img = new window.Image();
          img.onload = () => {
            clearTimeout(timer);
            try {
              const MAX_DIM = 900;
              let width = img.width || 800;
              let height = img.height || 600;

              if (width > height) {
                if (width > MAX_DIM) {
                  height = Math.round((height * MAX_DIM) / width);
                  width = MAX_DIM;
                }
              } else {
                if (height > MAX_DIM) {
                  width = Math.round((width * MAX_DIM) / height);
                  height = MAX_DIM;
                }
              }

              const canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.65);
                const cleanName = (file.name || `photo_${Date.now()}.jpg`).replace(/\.[^/.]+$/, "") + ".jpg";
                const compressedFile = dataURLtoFile(compressedDataUrl, cleanName);
                resolve({ file: compressedFile, dataUrl: compressedDataUrl });
                return;
              }
              resolve({ file, dataUrl: rawDataUrl });
            } catch (canvasErr) {
              console.warn("Canvas compression error, using raw:", canvasErr);
              resolve({ file, dataUrl: rawDataUrl });
            }
          };
          img.onerror = () => {
            clearTimeout(timer);
            resolve({ file, dataUrl: rawDataUrl });
          };
          img.src = rawDataUrl;
        } catch (_) {
          clearTimeout(timer);
          resolve({ file, dataUrl: rawDataUrl });
        }
      };
      reader.onerror = () => {
        clearTimeout(timer);
        resolve({ file, dataUrl: "" });
      };
      reader.readAsDataURL(file);
    } catch (_) {
      clearTimeout(timer);
      resolve({ file, dataUrl: "" });
    }
  });
}

// Resilient localStorage wrapper that handles quota exceeded errors gracefully
const safeLocalStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(name);
    } catch (_) {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(name, value);
    } catch (e: any) {
      console.warn("[dispatchDraftStore] localStorage.setItem error (handling quota exceeded):", e);
      try {
        // Fallback: strip heavy base64 dataUrl from photos so textual draft is never lost
        const parsed = JSON.parse(value);
        if (parsed?.state?.photos?.length) {
          parsed.state.photos = parsed.state.photos.map((p: any) => ({
            ...p,
            dataUrl: undefined,
          }));
          localStorage.setItem(name, JSON.stringify(parsed));
        }
      } catch (_) {}
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(name);
    } catch (_) {}
  },
};

export const useDispatchDraftStore = create<DispatchDraftState>()(
  persist(
    (set, get) => ({
      salesOrderId: "",
      orderNumber: "",
      salesOrderItemId: "",
      workOrderId: "",

      invoiceNumber: "",
      challanNumber: "",
      totalWeight: 0,
      vehicleNumber: "",
      driverName: "",
      driverPhone: "",
      dispatchRemarks: "",
      transporterName: "",
      ewayBillNumber: "",
      expectedDeliveryDate: "",
      actualFreightPaidAmount: 0,
      userEditedFreight: false,

      deliveryAddresses: {},
      deliveryAddress: "",

      selectedIds: [],
      dispatchQuantities: {},

      latitude: null,
      longitude: null,

      photos: [],
      lastSavedAt: null,

      setField: (field, value) =>
        set((state) => ({
          ...state,
          [field]: value,
          lastSavedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })),

      setFields: (fields) =>
        set((state) => ({
          ...state,
          ...fields,
          lastSavedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })),

      setDeliveryAddressForOrder: (orderKey, address) =>
        set((state) => ({
          ...state,
          deliveryAddresses: {
            ...state.deliveryAddresses,
            [orderKey]: address,
          },
          lastSavedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })),

      setQuantityForWorkOrder: (workOrderId, quantity) =>
        set((state) => ({
          ...state,
          dispatchQuantities: {
            ...state.dispatchQuantities,
            [workOrderId]: quantity,
          },
          lastSavedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })),

      setLocation: (location) =>
        set((state) => ({
          ...state,
          latitude: location.latitude,
          longitude: location.longitude,
        })),

      addPhoto: (photo) =>
        set((state) => ({
          ...state,
          photos: [...state.photos, photo],
          lastSavedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })),

      addPhotos: (newPhotos) =>
        set((state) => ({
          ...state,
          photos: [...state.photos, ...newPhotos],
          lastSavedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })),

      removePhoto: (id) =>
        set((state) => ({
          ...state,
          photos: state.photos.filter((p) => p.id !== id),
          lastSavedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })),

      clearPhotos: () =>
        set((state) => ({
          ...state,
          photos: [],
        })),

      clearDraft: () =>
        set({
          invoiceNumber: "",
          challanNumber: "",
          totalWeight: 0,
          vehicleNumber: "",
          driverName: "",
          driverPhone: "",
          dispatchRemarks: "",
          transporterName: "",
          ewayBillNumber: "",
          expectedDeliveryDate: "",
          actualFreightPaidAmount: 0,
          userEditedFreight: false,
          deliveryAddresses: {},
          deliveryAddress: "",
          selectedIds: [],
          dispatchQuantities: {},
          latitude: null,
          longitude: null,
          photos: [],
          lastSavedAt: null,
        }),

      initializeContext: (params) => {
        const state = get();
        const updates: Partial<DispatchDraftState> = {};
        if (params.salesOrderId && params.salesOrderId !== state.salesOrderId) {
          updates.salesOrderId = params.salesOrderId;
        }
        if (params.orderNumber && params.orderNumber !== state.orderNumber) {
          updates.orderNumber = params.orderNumber;
        }
        if (params.salesOrderItemId && params.salesOrderItemId !== state.salesOrderItemId) {
          updates.salesOrderItemId = params.salesOrderItemId;
        }
        if (params.workOrderId && params.workOrderId !== state.workOrderId) {
          updates.workOrderId = params.workOrderId;
        }
        if (params.deliveryAddress && !state.deliveryAddress) {
          updates.deliveryAddress = params.deliveryAddress;
        }
        if (Object.keys(updates).length > 0) {
          set((s) => ({ ...s, ...updates }));
        }
      },
    }),
    {
      name: "himalaya_dispatch_create_draft_v2",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        salesOrderId: state.salesOrderId,
        orderNumber: state.orderNumber,
        salesOrderItemId: state.salesOrderItemId,
        workOrderId: state.workOrderId,
        invoiceNumber: state.invoiceNumber,
        challanNumber: state.challanNumber,
        totalWeight: state.totalWeight,
        vehicleNumber: state.vehicleNumber,
        driverName: state.driverName,
        driverPhone: state.driverPhone,
        dispatchRemarks: state.dispatchRemarks,
        transporterName: state.transporterName,
        ewayBillNumber: state.ewayBillNumber,
        expectedDeliveryDate: state.expectedDeliveryDate,
        actualFreightPaidAmount: state.actualFreightPaidAmount,
        userEditedFreight: state.userEditedFreight,
        deliveryAddresses: state.deliveryAddresses,
        deliveryAddress: state.deliveryAddress,
        selectedIds: state.selectedIds,
        dispatchQuantities: state.dispatchQuantities,
        latitude: state.latitude,
        longitude: state.longitude,
        lastSavedAt: state.lastSavedAt,
        photos: state.photos.map((p) => ({
          id: p.id,
          dataUrl: p.dataUrl || (p.previewUrl?.startsWith("data:") ? p.previewUrl : undefined),
          name: p.name,
          size: p.size,
          type: p.type,
          source: p.source,
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (Array.isArray(state.photos)) {
          state.photos.forEach((photo) => {
            if (photo.dataUrl) {
              photo.previewUrl = photo.dataUrl;
              if (!photo.file) {
                try {
                  photo.file = dataURLtoFile(photo.dataUrl, photo.name || "recovered_dispatch_photo.jpg");
                } catch (e) {
                  console.warn("[dispatchDraftStore] Could not reconstruct File from dataUrl:", e);
                }
              }
            }
          });
        }
      },
    }
  )
);
