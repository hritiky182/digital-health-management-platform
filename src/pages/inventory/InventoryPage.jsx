import React, { useState, useMemo } from 'react';
import {
  PackageCheck,
  AlertTriangle,
  RotateCcw,
  Truck,
  Plus,
  ArrowRightLeft,
  Calendar,
  Building2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFacility } from '../../context/FacilityContext';
import { DataTable } from '../../components/common/DataTable';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export function InventoryPage() {
  const { inventory, adjustStock } = useData();
  const { currentFacility, facilities, isAllFacilities } = useFacility();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState(null);
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('RECEIVE'); // 'RECEIVE', 'WRITE_OFF', 'DISPATCH'
  const [adjustmentReason, setAdjustmentReason] = useState('Routine shipment receipt from Central Logistics Depot');

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      if (!isAllFacilities && item.facilityId !== currentFacility.id) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    });
  }, [inventory, currentFacility, isAllFacilities, categoryFilter, statusFilter]);

  const lowStockCount = filteredInventory.filter(i => i.status === 'Low Stock').length;
  const totalStockUnits = filteredInventory.reduce((s, i) => s + (i.currentStock || 0), 0);

  const handleOpenAdjust = (item) => {
    setSelectedItemForAdjust(item);
    setAdjustmentQty('100');
    setAdjustmentType('RECEIVE');
  };

  const handleConfirmAdjust = () => {
    if (!selectedItemForAdjust || !adjustmentQty) return;
    const delta = adjustmentType === 'WRITE_OFF' ? -Math.abs(Number(adjustmentQty)) : Math.abs(Number(adjustmentQty));
    adjustStock(selectedItemForAdjust.id, delta, `${adjustmentType}: ${adjustmentReason}`);
    setSelectedItemForAdjust(null);
  };

  const columns = [
    {
      key: 'sku',
      header: 'SKU & Code',
      width: '140px',
      render: (sku) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0f766e' }}>
          {sku}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Consumable / Drug Description',
      render: (name, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{name}</div>
          <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
            Batch: <span style={{ fontFamily: 'var(--font-mono)' }}>{row.batchLot}</span> • Supplier: {row.supplier}
          </div>
        </div>
      )
    },
    {
      key: 'facilityName',
      header: 'Facility Depot',
      render: (fac) => <span>{fac}</span>
    },
    {
      key: 'category',
      header: 'Therapeutic Category',
      render: (cat) => <span style={{ fontSize: '0.8rem' }}>{cat}</span>
    },
    {
      key: 'currentStock',
      header: 'Stock On-Hand',
      render: (stock, row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: row.status === 'Low Stock' ? '#dc2626' : '#0f172a' }}>
            {stock} {row.unit}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
            Min Reorder Level: {row.reorderLevel}
          </div>
        </div>
      )
    },
    {
      key: 'expiryDate',
      header: 'Batch Expiry',
      width: '130px',
      render: (exp) => {
        const isNear = new Date(exp) < new Date(Date.now() + 60 * 86400000);
        return (
          <span style={{ fontSize: '0.8rem', color: isNear ? '#b45309' : '#334155', fontWeight: isNear ? 600 : 400 }}>
            {exp} {isNear ? '⚠️' : ''}
          </span>
        );
      }
    },
    {
      key: 'status',
      header: 'Stock Health',
      width: '120px',
      render: (status) => (
        <Badge variant={status === 'Normal' ? 'green' : 'red'} dot>
          {status}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Logistics Action',
      sortable: false,
      width: '130px',
      render: (_, row) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleOpenAdjust(row)}
          style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
        >
          <RotateCcw size={13} />
          <span>Adjust Stock</span>
        </button>
      )
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Medical Inventory & Supply Chain</h1>
          <p className="page-description">
            Multi-facility pharmaceutical depots, laboratory reagents, PPE consumables, batch lot tracking, and automated reorder alerts.
          </p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="metric-grid" style={{ marginBottom: '1.5rem' }}>
        <MetricCard
          title="Catalog Items Tracked"
          value={filteredInventory.length}
          subtext="Essential medical inventory SKUs"
          icon={PackageCheck}
          color="teal"
        />
        <MetricCard
          title="Low Stock Critical Alerts"
          value={lowStockCount}
          subtext="Items below reorder point"
          icon={AlertTriangle}
          color={lowStockCount > 0 ? 'red' : 'green'}
        />
        <MetricCard
          title="Aggregated Stock Units"
          value={totalStockUnits.toLocaleString()}
          subtext="Capsules, tablets, and test kits"
          icon={Truck}
          color="blue"
        />
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={filteredInventory}
            searchPlaceholder="Search SKU, medication name, batch lot, or supplier..."
            searchKeys={['sku', 'name', 'batchLot', 'supplier', 'category']}
            exportFileName="careaxis_inventory_stock"
            filterComponent={
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  className="form-select"
                  style={{ width: '160px', height: '36px', fontSize: '0.8rem' }}
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Stock Statuses</option>
                  <option value="Low Stock">Low Stock Alerts</option>
                  <option value="Normal">Normal Stock</option>
                </select>
              </div>
            }
          />
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedItemForAdjust && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedItemForAdjust(null)}
          title={`Adjust Inventory — ${selectedItemForAdjust.name}`}
          subtitle={`Current On-Hand: ${selectedItemForAdjust.currentStock} ${selectedItemForAdjust.unit} (${selectedItemForAdjust.facilityName})`}
          maxWidth="500px"
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedItemForAdjust(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmAdjust}
              >
                <span>Commit Stock Adjustment</span>
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Adjustment Type *</label>
              <select
                className="form-select"
                value={adjustmentType}
                onChange={e => setAdjustmentType(e.target.value)}
              >
                <option value="RECEIVE">Receive Shipment (+ Inbound Stock)</option>
                <option value="WRITE_OFF">Damaged / Expired Write-Off (- Outbound)</option>
                <option value="RECONCILE">Audit Physical Count Adjustment (+/-)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity ({selectedItemForAdjust.unit}) *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={adjustmentQty}
                onChange={e => setAdjustmentQty(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Logistics Documentation Reason *</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={adjustmentReason}
                onChange={e => setAdjustmentReason(e.target.value)}
                required
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
