import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Eye, X, ChevronLeft, ChevronRight, Trash2, Search, Send, Tag, Package, Printer, Truck, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUSES = ['', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
const statusCfg: Record<string, { bg: string; text: string; dot: string }> = {
  DELIVERED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  PROCESSING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  SHIPPED: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  CANCELLED: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  PENDING: { bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-400' },
};

const getItemSku = (item: any): string => {
  if (item?.sku) return item.sku;
  const variants = item?.product?.variants;
  if (Array.isArray(variants) && variants.length > 0) {
    const matching = variants.find(
      (v: any) => v?.size?.trim()?.toLowerCase() === item?.size?.trim()?.toLowerCase() || v?.size === item?.size
    );
    if (matching?.sku) return matching.sku;
    if (variants[0]?.sku) return variants[0].sku;
  }
  return '';
};

const printInvoice = (order: any) => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    toast.error('Popup blocker is active. Please enable popups.');
    return;
  }

  const itemsHtml = (order.orderItems || []).map((item: any) => {
    const sku = getItemSku(item);
    return `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;">
        <div style="font-weight: 500; font-size: 13px;">${item.name}</div>
        <div style="font-size: 11px; color: #888; margin-top: 2px;">
          Size: ${item.size}${sku ? ` &bull; SKU: <strong style="color: #444; font-family: monospace; font-size: 11px;">${sku}</strong>` : ''}
        </div>
      </td>
      <td style="padding: 10px 0; text-align: center; border-bottom: 1px solid #eaeaea; font-size: 13px;">${item.quantity}</td>
      <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #eaeaea; font-size: 13px;">₹${item.price.toLocaleString('en-IN')}</td>
      <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #eaeaea; font-size: 13px; font-weight: 600;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `;
  }).join('');

  const formattedDate = format(new Date(order.createdAt), 'dd MMMM yyyy');
  const displayOrderId = order.orderNumber || '#' + order.id.slice(0, 8).toUpperCase();

  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - ${displayOrderId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@300;400;500;600&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #1a1209;
            margin: 0;
            padding: 40px;
            background: #fff;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #b8924a;
            padding-bottom: 20px;
          }
          .brand {
            font-family: 'Cinzel', serif;
            font-size: 28px;
            letter-spacing: 0.2em;
            font-weight: 700;
            color: #1a1209;
            margin: 0;
          }
          .tagline {
            font-family: 'Cinzel', serif;
            font-size: 10px;
            letter-spacing: 0.3em;
            color: #b8924a;
            margin: 5px 0 0 0;
            text-transform: uppercase;
          }
          .invoice-title {
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin: 20px 0 0 0;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
          }
          .details-block h3 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #888;
            margin: 0 0 10px 0;
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 5px;
          }
          .details-block p {
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #888;
            text-align: left;
            padding-bottom: 10px;
            border-bottom: 1px solid #1a1209;
          }
          .totals-table {
            width: 40%;
            margin-left: auto;
            margin-bottom: 0;
          }
          .totals-table td {
            padding: 8px 0;
            font-size: 13px;
          }
          .grand-total {
            font-size: 16px;
            font-weight: 700;
            color: #b8924a;
            border-top: 1px solid #eaeaea;
            padding-top: 12px;
          }
          .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 11px;
            color: #888;
            border-top: 1px solid #eaeaea;
            padding-top: 20px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">AVORO</div>
          <div class="tagline">The memory of your presence</div>
          <div class="invoice-title">Tax Invoice</div>
        </div>
        
        <div class="details-grid">
          <div class="details-block">
            <h3>Bill / Ship To</h3>
            <p><strong>${order.shippingAddress?.fullName || 'Customer'}</strong></p>
            <p>${order.shippingAddress?.address || ''}</p>
            <p>${[order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ')} - ${order.shippingAddress?.postalCode || ''}</p>
            <p>${order.shippingAddress?.country || 'India'}</p>
            ${order.shippingAddress?.phone ? `<p>Phone: ${order.shippingAddress.phone}</p>` : ''}
            ${order.shippingAddress?.email ? `<p>Email: ${order.shippingAddress.email}</p>` : ''}
          </div>
          
          <div class="details-block">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> ${displayOrderId}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Payment Status:</strong> ${order.isPaid ? 'Paid' : 'Unpaid'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50%;">Item Details</th>
              <th style="width: 10%; text-align: center;">Qty</th>
              <th style="width: 20%; text-align: right;">Rate</th>
              <th style="width: 20%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table class="totals-table">
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td style="text-align: right;">₹${order.itemsPrice.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Shipping</td>
              <td style="text-align: right;">${order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice.toLocaleString('en-IN')}`}</td>
            </tr>
            ${order.taxPrice > 0 ? `
              <tr>
                <td>Taxes</td>
                <td style="text-align: right;">₹${order.taxPrice.toLocaleString('en-IN')}</td>
              </tr>
            ` : ''}
            ${order.itemsPrice + order.shippingPrice + order.taxPrice - order.totalPrice > 0 ? `
              <tr>
                <td style="color: #2d7a4f;">Discount</td>
                <td style="text-align: right; color: #2d7a4f;">-₹${(order.itemsPrice + order.shippingPrice + order.taxPrice - order.totalPrice).toLocaleString('en-IN')}</td>
              </tr>
            ` : ''}
            <tr class="grand-total">
              <td><strong>Total</strong></td>
              <td style="text-align: right;"><strong>₹${order.totalPrice.toLocaleString('en-IN')}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for shopping with AVORO. For questions, please contact support@avoro.in</p>
          <p style="font-size: 9px; color: #aaa; margin-top: 10px;">This is a computer-generated invoice and does not require a physical signature.</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

const printPackingSlip = (order: any) => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    toast.error('Popup blocker is active. Please enable popups.');
    return;
  }

  const itemsHtml = (order.orderItems || []).map((item: any) => {
    const sku = getItemSku(item);
    return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea;">
        <div style="font-weight: 600; font-size: 14px;">${item.name}</div>
        <div style="font-size: 12px; color: #666; margin-top: 2px;">
          Size: ${item.size}${sku ? ` &bull; SKU: <strong style="color: #222; font-family: monospace;">${sku}</strong>` : ''}
        </div>
      </td>
      <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #eaeaea; font-size: 15px; font-weight: 700; padding-right: 20px;">${item.quantity}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; text-align: center; font-size: 12px; color: #ccc;">[ ] Packed</td>
    </tr>
  `;
  }).join('');

  const formattedDate = format(new Date(order.createdAt), 'dd MMMM yyyy');
  const displayOrderId = order.orderNumber || '#' + order.id.slice(0, 8).toUpperCase();

  printWindow.document.write(`
    <html>
      <head>
        <title>Packing Slip - ${displayOrderId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@300;400;500;600&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #1a1209;
            margin: 0;
            padding: 40px;
            background: #fff;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #1a1209;
            padding-bottom: 20px;
          }
          .brand {
            font-family: 'Cinzel', serif;
            font-size: 28px;
            letter-spacing: 0.2em;
            font-weight: 700;
            color: #1a1209;
            margin: 0;
          }
          .tagline {
            font-family: 'Cinzel', serif;
            font-size: 10px;
            letter-spacing: 0.3em;
            color: #b8924a;
            margin: 5px 0 0 0;
            text-transform: uppercase;
          }
          .slip-title {
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin: 20px 0 0 0;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
          }
          .details-block h3 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #888;
            margin: 0 0 10px 0;
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 5px;
          }
          .details-block p {
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #888;
            text-align: left;
            padding-bottom: 10px;
            border-bottom: 1px solid #1a1209;
          }
          .footer {
            margin-top: 80px;
            text-align: center;
            font-size: 12px;
            font-style: italic;
            color: #b8924a;
            border-top: 1px solid #eaeaea;
            padding-top: 25px;
            font-family: 'Cinzel', serif;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">AVORO</div>
          <div class="tagline">The memory of your presence</div>
          <div class="slip-title">Packing Slip</div>
        </div>
        
        <div class="details-grid">
          <div class="details-block">
            <h3>Ship To</h3>
            <p><strong>${order.shippingAddress?.fullName || 'Customer'}</strong></p>
            <p>${order.shippingAddress?.address || ''}</p>
            <p>${[order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ')} - ${order.shippingAddress?.postalCode || ''}</p>
            <p>${order.shippingAddress?.country || 'India'}</p>
            ${order.shippingAddress?.phone ? `<p>Phone: ${order.shippingAddress.phone}</p>` : ''}
          </div>
          
          <div class="details-block">
            <h3>Package Details</h3>
            <p><strong>Order ID:</strong> ${displayOrderId}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Shipping Method:</strong> ${order.shippingPrice === 0 ? 'Standard Shipping (Free)' : 'Standard/Express'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 60%;">Item Description</th>
              <th style="width: 20%; text-align: right; padding-right: 20px;">Qty Ordered</th>
              <th style="width: 20%; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for letting AVORO be a part of your journey.</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export default function Orders() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter, search],
    queryFn: () => api.get('/admin/orders', { params: { page, status: statusFilter || undefined, search: search || undefined, limit: 20 } }).then((r) => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => { toast.success('Status updated'); queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); setSelectedOrder(null); },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/orders/${id}`),
    onSuccess: () => { toast.success('Order deleted'); queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); },
    onError: () => toast.error('Failed to delete order'),
  });

  const shiprocketSyncMutation = useMutation({
    mutationFn: (orderId: string) => api.post(`/shipping/orders/${orderId}/sync`),
    onSuccess: (res) => {
      toast.success('Order synced to Shiprocket successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      if (res.data?.order) {
        setSelectedOrder(res.data.order);
      }
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to sync with Shiprocket'),
  });

  const assignAwbMutation = useMutation({
    mutationFn: (orderId: string) => api.post(`/shipping/orders/${orderId}/assign-awb`, {}),
    onSuccess: (res) => {
      toast.success('AWB assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      if (res.data?.order) {
        setSelectedOrder(res.data.order);
      }
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to assign AWB'),
  });

  const getLabelMutation = useMutation({
    mutationFn: (orderId: string) => api.get(`/shipping/orders/${orderId}/label`),
    onSuccess: (res) => {
      const labelUrl = res.data?.label_url || res.data?.response?.data?.label_url || res.data?.not_created?.[0];
      if (labelUrl && typeof labelUrl === 'string' && labelUrl.startsWith('http')) {
        window.open(labelUrl, '_blank');
      } else {
        toast.success('Label generated successfully');
      }
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to fetch shipping label'),
  });

  const getInvoiceMutation = useMutation({
    mutationFn: (orderId: string) => api.get(`/shipping/orders/${orderId}/invoice`),
    onSuccess: (res) => {
      const invoiceUrl = res.data?.invoice_url || res.data?.response?.data?.invoice_url || res.data?.is_invoice_created;
      if (invoiceUrl && typeof invoiceUrl === 'string' && invoiceUrl.startsWith('http')) {
        window.open(invoiceUrl, '_blank');
      } else {
        toast.success('Invoice generated in Shiprocket');
      }
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to fetch Shiprocket invoice'),
  });

  const generatePickupMutation = useMutation({
    mutationFn: (orderId: string) => api.post(`/shipping/orders/${orderId}/generate-pickup`),
    onSuccess: (res) => {
      toast.success('Pickup generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      if (res.data?.order) {
        setSelectedOrder(res.data.order);
      }
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to generate pickup'),
  });

  const [trackingModalData, setTrackingModalData] = useState<any>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState<boolean>(false);

  const handleTrackShipment = async (orderId: string) => {
    setIsTrackingLoading(true);
    try {
      const res = await api.get(`/shipping/orders/${orderId}/track`);
      setTrackingModalData(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to fetch tracking details');
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this order? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-display font-semibold text-text tracking-tight">Orders</h1>
          <p className="text-[13px] text-text-muted mt-1">Track and manage customer orders</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 ${statusFilter === s ? 'bg-gold text-white shadow-sm' : 'bg-white border border-border text-text-mid hover:border-gold/30 hover:text-text'}`}>
            {s || 'All Orders'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[18px] border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-[#FAFAF7]">
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Order</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Customer</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Date</th>
              <th className="text-left px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Status</th>
              <th className="text-right px-4 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Amount</th>
              <th className="text-right px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">Details</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border/30"><td colSpan={6} className="px-6 py-5"><div className="h-4 bg-bg-soft rounded-lg w-full animate-pulse" /></td></tr>
              ))
            ) : data?.orders?.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-text-muted text-[13px]">No orders found</td></tr>
            ) : (
              data?.orders?.map((o: any) => {
                const cfg = statusCfg[o.status] || statusCfg.PENDING;
                return (
                  <tr key={o.id} className="border-b border-border/30 last:border-0 hover:bg-[#FDFCFA] transition-colors duration-200">
                    <td className="px-6 py-4"><code className="text-[11px] text-text-mid bg-bg-soft px-2 py-1 rounded font-mono">{o.orderNumber || `#${o.id.slice(0, 8).toUpperCase()}`}</code></td>
                    <td className="px-4 py-4 text-[13px] font-medium text-text">{o.shippingAddress?.fullName || `${o.user?.firstName ?? ''} ${o.user?.lastName ?? ''}`.trim() || o.guestEmail || 'Guest'}</td>
                    <td className="px-4 py-4 text-[12px] text-text-muted">{format(new Date(o.createdAt), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{o.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-[14px] font-bold text-text">₹{o.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedOrder(o)} className="p-2 hover:bg-bg-soft rounded-lg text-text-muted hover:text-text transition" title="View">
                        <Eye className="w-4 h-4" strokeWidth={1.8} />
                      </button>
                      <button onClick={() => handleDelete(o.id)} className="p-2 hover:bg-rose-50 rounded-lg text-text-muted hover:text-rose-600 transition ml-1" title="Delete">
                        <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-[#FAFAF7]">
            <p className="text-[11px] text-text-muted font-medium">{data.total} orders total</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted disabled:opacity-30 transition"><ChevronLeft className="w-4 h-4" /></button>
              {[...Array(data.pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition ${page === i + 1 ? 'bg-gold text-white shadow-sm' : 'text-text-mid hover:bg-bg-hover'}`}>{i + 1}</button>
              ))}
              <button onClick={() => setPage(Math.min(data.pages, page + 1))} disabled={page === data.pages} className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted disabled:opacity-30 transition"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.12)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <h2 className="text-[16px] font-display font-semibold text-text">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-bg-soft rounded-lg text-text-muted hover:text-text transition"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Order ID</p><p className="text-[12px] font-mono text-text-mid">{selectedOrder.orderNumber || selectedOrder.id.slice(0, 8).toUpperCase()}</p></div>
                <div><p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Customer</p><p className="text-[13px] font-medium text-text">{selectedOrder.shippingAddress?.fullName || `${selectedOrder.user?.firstName ?? ''} ${selectedOrder.user?.lastName ?? ''}`.trim() || selectedOrder.guestEmail || 'Guest'}</p></div>
                <div><p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Total</p><p className="text-[16px] font-bold text-text">₹{selectedOrder.totalPrice.toLocaleString()}</p></div>
                <div><p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Payment</p><p className={`text-[13px] font-semibold ${selectedOrder.isPaid ? 'text-emerald-700' : 'text-rose-600'}`}>{selectedOrder.isPaid ? 'Paid' : 'Unpaid'}</p></div>
              </div>

              {/* Shipping Address */}
              <div className="border-t border-border/50 pt-4">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Shipping Address</p>
                <div className="bg-bg-soft rounded-xl px-4 py-3">
                  {selectedOrder.shippingAddress && (selectedOrder.shippingAddress.fullName || selectedOrder.shippingAddress.address) ? (
                    <>
                      {selectedOrder.shippingAddress.fullName && <p className="text-[13px] font-medium text-text">{selectedOrder.shippingAddress.fullName}</p>}
                      {selectedOrder.shippingAddress.phone && <p className="text-[12px] text-text-muted">📞 {selectedOrder.shippingAddress.phone}</p>}
                      {selectedOrder.shippingAddress.email && <p className="text-[12px] text-text-muted">✉️ {selectedOrder.shippingAddress.email}</p>}
                      {selectedOrder.shippingAddress.address && <p className="text-[12px] text-text-mid mt-1.5">{selectedOrder.shippingAddress.address}</p>}
                      <p className="text-[12px] text-text-mid">
                        {[selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.state].filter(Boolean).join(', ')}
                        {selectedOrder.shippingAddress.postalCode ? ` — ${selectedOrder.shippingAddress.postalCode}` : ''}
                      </p>
                      {selectedOrder.shippingAddress.country && <p className="text-[12px] text-text-mid">{selectedOrder.shippingAddress.country}</p>}
                    </>
                  ) : (
                    <p className="text-[12px] text-text-muted italic">No address provided for this order</p>
                  )}
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Items</p>
                <div className="space-y-2">
                  {selectedOrder.orderItems?.map((item: any) => {
                    const sku = getItemSku(item);
                    return (
                      <div key={item.id} className="flex items-center justify-between py-2.5 px-3 bg-bg-soft rounded-xl">
                        <div>
                          <p className="text-[13px] font-medium text-text">{item.name}</p>
                          <p className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5">
                            <span>{item.size} &times; {item.quantity}</span>
                            {sku && (
                              <span className="font-mono text-[10px] bg-stone-200/70 text-stone-700 px-1.5 py-0.5 rounded font-medium">
                                SKU: {sku}
                              </span>
                            )}
                          </p>
                        </div>
                        <p className="text-[13px] font-bold text-text">₹{item.price.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shiprocket Logistics Section */}
              <div className="border-t border-border/50 pt-4">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Shiprocket Shipping & Logistics</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${selectedOrder.shiprocketOrderId ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {selectedOrder.shiprocketStatus || (selectedOrder.shiprocketOrderId ? 'SYNCED' : 'NOT SYNCED')}
                  </span>
                </div>

                <div className="bg-[#FAF8F5] border border-border/60 rounded-xl p-3.5 space-y-2.5">
                  {selectedOrder.shiprocketOrderId ? (
                    <div className="grid grid-cols-2 gap-2.5 text-[12px]">
                      <div>
                        <span className="text-text-muted block text-[10px] uppercase font-semibold">Shiprocket Order ID</span>
                        <span className="font-mono text-text font-medium">{selectedOrder.shiprocketOrderId}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px] uppercase font-semibold">Shipment ID</span>
                        <span className="font-mono text-text font-medium">{selectedOrder.shiprocketShipmentId || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px] uppercase font-semibold">AWB Code</span>
                        <span className="font-mono text-text font-medium">{selectedOrder.shiprocketAwbCode || 'Not Assigned'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px] uppercase font-semibold">Courier Partner</span>
                        <span className="text-text font-medium">{selectedOrder.shiprocketCourierName || 'Auto/Pending'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[12px] text-text-muted">This order has not been sent to Shiprocket yet.</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                    {/* 1. Push to Shiprocket */}
                    <button
                      onClick={() => shiprocketSyncMutation.mutate(selectedOrder.id)}
                      disabled={shiprocketSyncMutation.isPending}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 text-white font-semibold text-[11.5px] rounded-lg hover:bg-amber-700 disabled:opacity-50 transition shadow-sm"
                      title="Sync/Push Order to Shiprocket"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {shiprocketSyncMutation.isPending ? 'Pushing...' : selectedOrder.shiprocketOrderId ? 'Re-Push Order' : 'Push to Shiprocket'}
                    </button>

                    {/* 2. Assign AWB */}
                    <button
                      onClick={() => assignAwbMutation.mutate(selectedOrder.id)}
                      disabled={assignAwbMutation.isPending || !selectedOrder.shiprocketShipmentId}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-600 text-white font-semibold text-[11.5px] rounded-lg hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                      title={!selectedOrder.shiprocketShipmentId ? 'Push to Shiprocket first' : 'Assign AWB Code'}
                    >
                      <Tag className="w-3.5 h-3.5" />
                      {assignAwbMutation.isPending ? 'Assigning...' : 'Assign AWB'}
                    </button>

                    {/* 3. Generate Pickup */}
                    <button
                      onClick={() => generatePickupMutation.mutate(selectedOrder.id)}
                      disabled={generatePickupMutation.isPending || !selectedOrder.shiprocketShipmentId}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white font-semibold text-[11.5px] rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                      title={!selectedOrder.shiprocketShipmentId ? 'Push to Shiprocket first' : 'Request Pickup'}
                    >
                      <Package className="w-3.5 h-3.5" />
                      {generatePickupMutation.isPending ? 'Generating...' : 'Generate Pickup'}
                    </button>

                    {/* 4. Print Label */}
                    <button
                      onClick={() => getLabelMutation.mutate(selectedOrder.id)}
                      disabled={getLabelMutation.isPending || !selectedOrder.shiprocketShipmentId}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white font-semibold text-[11.5px] rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                      title={!selectedOrder.shiprocketShipmentId ? 'Push to Shiprocket first' : 'Download/Print Shipping Label'}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      {getLabelMutation.isPending ? 'Fetching...' : 'Print Label'}
                    </button>

                    {/* 5. Shiprocket Tax Invoice */}
                    <button
                      onClick={() => getInvoiceMutation.mutate(selectedOrder.id)}
                      disabled={getInvoiceMutation.isPending || !selectedOrder.shiprocketOrderId}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 text-white font-semibold text-[11.5px] rounded-lg hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                      title={!selectedOrder.shiprocketOrderId ? 'Push to Shiprocket first' : 'Download Official Shiprocket Tax Invoice'}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      {getInvoiceMutation.isPending ? 'Fetching...' : 'SR Invoice'}
                    </button>

                    {/* 6. Track Shipment */}
                    <button
                      onClick={() => handleTrackShipment(selectedOrder.id)}
                      disabled={isTrackingLoading || (!selectedOrder.shiprocketOrderId && !selectedOrder.shiprocketAwbCode)}
                      className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 text-white font-semibold text-[11.5px] rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                      title={!selectedOrder.shiprocketOrderId ? 'Push to Shiprocket first to track' : 'Track Shipment Status'}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      {isTrackingLoading ? 'Tracking...' : 'Track Shipment'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Update Status</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => statusMutation.mutate({ id: selectedOrder.id, status: e.target.value })}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-[13px] text-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition mb-4"
                >
                  {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Print Actions */}
              <div className="border-t border-border/50 pt-4 flex gap-3">
                <button
                  onClick={() => printInvoice(selectedOrder)}
                  className="flex-1 px-4 py-2 border border-gold/40 text-gold-dark hover:bg-gold-pale hover:text-gold-dark text-[12.5px] font-semibold rounded-xl transition text-center"
                >
                  Print Invoice
                </button>
                <button
                  onClick={() => printPackingSlip(selectedOrder)}
                  className="flex-1 px-4 py-2 border border-border text-text-mid hover:bg-bg-hover hover:text-text text-[12.5px] font-semibold rounded-xl transition text-center"
                >
                  Print Packing Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Info Modal */}
      {trackingModalData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setTrackingModalData(null)}>
          <div className="bg-white border border-border rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gold-dark" />
                <h3 className="text-[15px] font-display font-semibold text-text">Shipment Tracking</h3>
              </div>
              <button onClick={() => setTrackingModalData(null)} className="p-1.5 hover:bg-bg-soft rounded-lg text-text-muted hover:text-text transition"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {trackingModalData.tracking_data ? (
                <>
                  <div className="bg-bg-soft rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-text-muted font-medium uppercase">Current Status</span>
                      <span className="text-[12px] font-bold text-gold-dark px-2 py-0.5 bg-amber-50 rounded border border-amber-200">
                        {trackingModalData.tracking_data.track_status === 1 ? trackingModalData.tracking_data.shipment_status_text || 'In Transit' : 'Tracking Active'}
                      </span>
                    </div>
                    {trackingModalData.tracking_data.etd && (
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-text-muted">Estimated Delivery:</span>
                        <span className="font-semibold text-text">{trackingModalData.tracking_data.etd}</span>
                      </div>
                    )}
                    {selectedOrder?.shiprocketCourierName && (
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-text-muted">Courier:</span>
                        <span className="font-semibold text-text">{selectedOrder.shiprocketCourierName}</span>
                      </div>
                    )}
                  </div>

                  {/* Activities list */}
                  {trackingModalData.tracking_data.shipment_track_activities?.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">Activity Timeline</h4>
                      <div className="space-y-3 relative pl-4 border-l-2 border-amber-200">
                        {trackingModalData.tracking_data.shipment_track_activities.map((act: any, idx: number) => (
                          <div key={idx} className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gold" />
                            <p className="text-[12.5px] font-medium text-text">{act.activity || act.location}</p>
                            <p className="text-[11px] text-text-muted">{act.date} — {act.location}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {trackingModalData.tracking_data.track_url && (
                    <a
                      href={trackingModalData.tracking_data.track_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-gold text-white font-semibold text-[13px] rounded-xl hover:bg-gold-dark transition mt-2"
                    >
                      <ExternalLink className="w-4 h-4" /> Open Shiprocket Tracking Page
                    </a>
                  )}
                </>
              ) : (
                <div className="py-6 text-center text-text-muted text-[13px] space-y-3">
                  <p>{trackingModalData.message || 'Tracking information available.'}</p>
                  {selectedOrder?.shiprocketAwbCode && (
                    <a
                      href={`https://shiprocket.co/tracking/${selectedOrder.shiprocketAwbCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gold text-white font-semibold text-[12px] rounded-xl hover:bg-gold-dark transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Track on Shiprocket Web
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
