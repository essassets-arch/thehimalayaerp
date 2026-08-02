"use client";

import { useCallback, useEffect, useState } from "react";
import { getFinishedGoods } from "@/services/finishedGoodsService";
import FinishedGoodsTable from "@/components/shared/FinishedGoodsTable";

export default function PlantHeadFinishedGoodsPage() {
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("not-dispatched");

  const loadFinishedGoods = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getFinishedGoods({
        page: 1,
        pageSize: 100,
      });

      const rows = Array.isArray(response)
        ? response
        : response?.data ?? response?.items ?? [];

      setFinishedGoods(rows);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load finished goods.",
      );
      setFinishedGoods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinishedGoods();
  }, [loadFinishedGoods]);

  if (loading) {
    return <div className="p-6 text-gray-500 font-medium">Loading finished goods...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          type="button"
          onClick={() => loadFinishedGoods()}
          className="mt-3 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const notDispatchedRecords = finishedGoods.filter(r => r.status !== 'DISPATCHED' && r.status !== 'SENT_TO_DISPATCH');
  const dispatchedRecords = finishedGoods.filter(r => r.status === 'DISPATCHED' || r.status === 'SENT_TO_DISPATCH');

  const displayedRecords = activeTab === 'not-dispatched' ? notDispatchedRecords : dispatchedRecords;

  return (
    <div className="space-y-6 p-4 md:p-6" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Finished Goods Inventory</h1>
          <p className="text-sm text-muted-foreground" style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            View-only access to finished goods completed by the Production department.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)' }}>
        <button 
          onClick={() => setActiveTab('not-dispatched')}
          style={{ 
            padding: '12px 16px', 
            fontWeight: '600', 
            fontSize: '14px',
            color: activeTab === 'not-dispatched' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'not-dispatched' ? '3px solid var(--color-primary)' : '3px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer'
          }}
        >
          Not Dispatched ({notDispatchedRecords.length})
        </button>
        <button 
          onClick={() => setActiveTab('dispatched')}
          style={{ 
            padding: '12px 16px', 
            fontWeight: '600', 
            fontSize: '14px',
            color: activeTab === 'dispatched' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'dispatched' ? '3px solid var(--color-primary)' : '3px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer'
          }}
        >
          Dispatched ({dispatchedRecords.length})
        </button>
      </div>

      <div className="app-card">
        <FinishedGoodsTable
          records={displayedRecords}
          readOnly={true}
          showActions={false}
        />
      </div>
    </div>
  );
}
