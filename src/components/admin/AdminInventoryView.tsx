import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStore } from '../../context/StoreContext';
import { Boxes, Search, Download, AlertTriangle, Check, RefreshCw, Plus, Minus } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  department: string;
  category: string;
  price: number;
  image: string;
  totalStock: number;
  sizes: string[];
  colors: string[];
  stockByVariant: Record<string, number>;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export const AdminInventoryView: React.FC = () => {
  const { getAuthHeaders, hasPermission } = useAdminAuth();
  const { formatINR, showToast } = useStore();

  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/inventory', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setInventoryList(json);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockDelta = async (productId: string, variantKey: string | null, delta: number) => {
    setAdjustingId(productId);
    try {
      const res = await fetch(`/api/admin/inventory/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ variantKey, delta }),
      });

      if (res.ok) {
        showToast('Stock adjusted successfully', 'success');
        await fetchInventory();
      } else {
        showToast('Failed to adjust stock', 'error');
      }
    } finally {
      setAdjustingId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Product ID', 'Name', 'Department', 'Category', 'Price (INR)', 'Total Stock', 'Status'];
    const rows = inventoryList.map((item) => [
      `"${item.id}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.department}"`,
      `"${item.category}"`,
      item.price,
      item.totalStock,
      `"${item.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartbuy_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inventory CSV exported successfully!', 'success');
  };

  const filteredItems = inventoryList.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalUnits = inventoryList.reduce((sum, item) => sum + item.totalStock, 0);
  const totalValuation = inventoryList.reduce((sum, item) => sum + item.totalStock * item.price, 0);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8E1D9] shadow-xs">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#252522]">Inventory & Warehouse Matrix</h2>
          <p className="text-xs text-[#77736D] mt-0.5">
            Real-time variant breakdown, restock thresholds, and automated stock alerts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchInventory}
            className="p-2.5 bg-[#F7F3EE] hover:bg-[#E8E1D9] text-[#252522] rounded-xl text-xs font-semibold flex items-center gap-1.5"
            title="Refresh inventory"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync</span>
          </button>

          {hasPermission('export_data') && (
            <button
              onClick={handleExportCSV}
              className="py-2.5 px-4 bg-[#171715] hover:bg-[#30372B] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="text-[11px] font-mono font-bold text-[#77736D] uppercase">Total Units in Stock</div>
          <div className="text-2xl font-extrabold font-mono text-[#252522] mt-1">{totalUnits.toLocaleString()}</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="text-[11px] font-mono font-bold text-[#77736D] uppercase">Inventory Valuation (MSRP)</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-800 mt-1">{formatINR(totalValuation)}</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E8E1D9] shadow-xs">
          <div className="text-[11px] font-mono font-bold text-[#77736D] uppercase">Low / Out-of-Stock SKUs</div>
          <div className="text-2xl font-extrabold font-mono text-amber-700 mt-1">
            {inventoryList.filter((i) => i.status !== 'in_stock').length} styles
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#FFFFFF] p-4 rounded-2xl border border-[#E8E1D9] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#77736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by apparel name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F3EE]/60 border border-[#D8C7B5] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#30372B]"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-[#77736D] font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="py-2 px-3 bg-[#F7F3EE]/60 border border-[#D8C7B5] rounded-xl text-xs font-medium"
          >
            <option value="all">All Styles</option>
            <option value="low_stock">Low Stock (≤ 25)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8E1D9] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#77736D] animate-pulse">Loading warehouse inventory...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736D]">No items match the filter.</div>
        ) : (
          <div className="divide-y divide-[#E8E1D9]">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-5 hover:bg-[#F7F3EE]/40 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Item info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-16 object-cover rounded-xl bg-neutral-100 border border-[#E8E1D9] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#252522]">{item.name}</span>
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                            item.status === 'out_of_stock'
                              ? 'bg-red-100 text-red-800'
                              : item.status === 'low_stock'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-[#77736D] mt-0.5">
                        {item.department.toUpperCase()} · {item.category} · {formatINR(item.price)}
                      </div>
                      <div className="text-xs font-mono font-bold text-[#252522] mt-1">
                        Total Stock: {item.totalStock} units
                      </div>
                    </div>
                  </div>

                  {/* Restock Actions */}
                  {hasPermission('manage_inventory') && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-[#77736D] mr-1">Quick Restock:</span>
                      <button
                        onClick={() => handleStockDelta(item.id, null, 5)}
                        disabled={adjustingId === item.id}
                        className="py-1 px-2.5 bg-[#F7F3EE] hover:bg-[#E8E1D9] border border-[#D8C7B5] rounded-lg text-xs font-mono font-bold"
                      >
                        +5
                      </button>
                      <button
                        onClick={() => handleStockDelta(item.id, null, 10)}
                        disabled={adjustingId === item.id}
                        className="py-1 px-2.5 bg-[#F7F3EE] hover:bg-[#E8E1D9] border border-[#D8C7B5] rounded-lg text-xs font-mono font-bold"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handleStockDelta(item.id, null, 25)}
                        disabled={adjustingId === item.id}
                        className="py-1 px-2.5 bg-[#171715] hover:bg-[#30372B] text-white rounded-lg text-xs font-mono font-bold shadow-xs"
                      >
                        +25
                      </button>
                    </div>
                  )}
                </div>

                {/* Variant Breakdown Matrix */}
                {Object.keys(item.stockByVariant).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#E8E1D9]/60">
                    <div className="text-[10px] font-mono font-bold uppercase text-[#77736D] mb-2">
                      Variant Breakdown (Size × Color)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {Object.entries(item.stockByVariant).map(([vk, count]) => (
                        <div
                          key={vk}
                          className="p-2 bg-[#FFFFFF] rounded-lg border border-[#E8E1D9] text-center text-xs"
                        >
                          <div className="text-[10px] text-[#77736D] font-mono truncate" title={vk}>
                            {vk.replace('_', ' · ')}
                          </div>
                          <div className={`font-mono font-bold mt-0.5 ${count <= 5 ? 'text-red-600' : 'text-[#252522]'}`}>
                            {count} pcs
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
