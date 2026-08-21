import { backendFetch } from "../lib/backendFetch";

export async function getFinishedGoods(params?: any) {
  const query = new URLSearchParams();

  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return backendFetch(`/api/backend/production/finished-goods${suffix}`, {
    method: "GET",
    cacheTtlMs: 0,
  });
}
