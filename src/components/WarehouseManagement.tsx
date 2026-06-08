import React, { useState, useEffect } from "react";
import { 
  Search, Plus, Edit2, Trash2, Filter, ArrowUpRight, Check, X,
  ShoppingBag, Package, Box, ShoppingCart, History, BarChart3, 
  ArrowDown, Settings, AlertTriangle, AlertCircle, RefreshCw,
  PlusCircle, Sliders, ChevronDown, CheckCircle2, DollarSign,
  User, Database, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Product {
  id: number;
  code: string;
  name: string;
  image: string;
  category: string;
  unit: string;
  importPrice: number;
  price: number;
  stock: number;
  minStock: number;
  status: string;
}

interface PurchaseOrderItem {
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  importPrice: number;
}

interface PurchaseOrder {
  id: number;
  orderCode: string;
  supplierName: string;
  orderDate: string;
  receivedDate?: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: "Draft" | "Ordered" | "Received" | "Cancelled";
  createdBy?: string;
}

interface WarehouseHistoryEntry {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  type: "IMPORT" | "EXPORT" | "ADJUST_INC" | "ADJUST_DEC";
  changeQty: number;
  beforeQty: number;
  afterQty: number;
  date: string;
  note: string;
  createdBy?: string;
}

interface WarehouseAdjustmentItem {
  productId: number;
  productName: string;
  productCode: string;
  changeQty: number;
  beforeQty: number;
  afterQty: number;
}

interface WarehouseAdjustment {
  id: number;
  adjustCode: string;
  date: string;
  items: WarehouseAdjustmentItem[];
  reason: string;
  createdBy?: string;
}

interface WarehouseManagementProps {
  subTab: "products" | "inventory" | "purchase" | "receive" | "history" | "adjust" | "report";
}

export default function WarehouseManagement({ subTab }: WarehouseManagementProps) {
  // State lists
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [history, setHistory] = useState<WarehouseHistoryEntry[]>([]);
  const [adjustments, setAdjustments] = useState<WarehouseAdjustment[]>([]);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Loaders
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Product Modals / Form
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    code: "",
    name: "",
    image: "",
    category: "Thực phẩm bổ sung",
    unit: "Hộp",
    importPrice: 0,
    price: 0,
    minStock: 5,
    status: "Active"
  });

  // Purchase Order Form / Modal
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poSupplierName, setPoSupplierName] = useState("");
  const [poItems, setPoItems] = useState<{ productId: number; quantity: number; importPrice: number }[]>([]);
  // Temp state to add an item to PO
  const [selectedPoProductId, setSelectedPoProductId] = useState<number>(-1);
  const [selectedPoQty, setSelectedPoQty] = useState<number>(1);
  const [selectedPoImportPrice, setSelectedPoImportPrice] = useState<number>(0);

  // Manual Adjustment Form
  const [adjustProductId, setAdjustProductId] = useState<number>(-1);
  const [adjustChangeQty, setAdjustChangeQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("Kiểm kê định kỳ");

  // Unique categories helper
  const categories = ["Thực phẩm bổ sung", "Nước uống", "Phụ kiện", "Dụng cụ", "Khác"];
  const units = ["Hộp", "Chai", "Cái", "Gói", "Thùng", "Đôi"];

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const prodRes = await fetch("/api/products");
      const poRes = await fetch("/api/purchase-orders");
      const histRes = await fetch("/api/warehouse-history");
      const adjRes = await fetch("/api/warehouse-adjustments");

      if (prodRes.ok) setProducts(await prodRes.json());
      if (poRes.ok) setPurchaseOrders(await poRes.json());
      if (histRes.ok) setHistory(await histRes.json());
      if (adjRes.ok) setAdjustments(await adjRes.json());
    } catch (err) {
      console.error(err);
      setErrorMsg("Không thể tải thông tin kho từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subTab]);

  // Product Form controls
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      code: "",
      name: "",
      image: "",
      category: "Thực phẩm bổ sung",
      unit: "Hộp",
      importPrice: 0,
      price: 0,
      minStock: 5,
      status: "Active"
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      code: prod.code,
      name: prod.name,
      image: prod.image,
      category: prod.category,
      unit: prod.unit,
      importPrice: prod.importPrice,
      price: prod.price,
      minStock: prod.minStock,
      status: prod.status
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return alert("Vui lòng điền tên sản phẩm!");

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const payload = editingProduct 
        ? { ...productForm, id: editingProduct.id }
        : productForm; // For POST, the backend forces stock = 0

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsProductModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || "Lỗi khi xử lý sản phẩm!");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi gửi dữ liệu.");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert("Không thể xóa sản phẩm.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // PO handlers
  const handleAddPoItem = () => {
    if (selectedPoProductId === -1) return alert("Vui lòng chọn sản phẩm!");
    const exists = poItems.some(item => item.productId === selectedPoProductId);
    if (exists) return alert("Sản phẩm đã được thêm vào giỏ hàng!");

    setPoItems([
      ...poItems,
      {
        productId: selectedPoProductId,
        quantity: selectedPoQty,
        importPrice: selectedPoImportPrice
      }
    ]);
    setSelectedPoProductId(-1);
    setSelectedPoQty(1);
    setSelectedPoImportPrice(0);
  };

  const handleRemovePoItemLocal = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handlePoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierName.trim()) return alert("Vui lòng nhập tên nhà cung cấp!");
    if (poItems.length === 0) return alert("Vui lòng thêm ít nhất một sản phẩm!");

    const poDetails = poItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod?.name || "SP",
        productCode: prod?.code || "CODE",
        quantity: Number(item.quantity),
        importPrice: Number(item.importPrice)
      };
    });

    const totalCalculated = poDetails.reduce((sum, item) => sum + (item.quantity * item.importPrice), 0);

    const payload = {
      supplierName: poSupplierName,
      items: poDetails,
      totalAmount: totalCalculated,
      status: "Draft", // Saves initially as Draft request
      createdBy: "admin"
    };

    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsPoModalOpen(false);
        setPoSupplierName("");
        setPoItems([]);
        fetchData();
      } else {
        alert("Gặp lỗi khi tạo đơn hàng dạm thảo.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatusPO = async (po: PurchaseOrder, newStatus: "Draft" | "Ordered" | "Received" | "Cancelled") => {
    if (newStatus === "Received" && !confirm("Bạn có chắc muốn nhập kho không? Trạng thái 'Received' sẽ làm tăng tồn kho thực tế của các sản phẩm tương ứng và tạo lịch sử lưu vết chính xác!")) return;
    
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...po, status: newStatus })
      });

      if (res.ok) {
        fetchData();
      } else {
        alert("Lỗi khi cập nhật trạng thái đơn hàng mua.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manual Adjustment handles
  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustProductId === -1) return alert("Vui lòng chọn sản phẩm cần điều chỉnh!");
    if (adjustChangeQty === 0) return alert("Tỷ lệ điều chỉnh lượng tồn phải khác 0!");

    const payload = {
      items: [
        {
          productId: adjustProductId,
          changeQty: Number(adjustChangeQty)
        }
      ],
      reason: adjustReason,
      createdBy: "admin"
    };

    try {
      const res = await fetch("/api/warehouse-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Điều chỉnh tồn kho thành công! Nhật ký biến động và thẻ kho đã được lưu.");
        setAdjustProductId(-1);
        setAdjustChangeQty(0);
        setAdjustReason("Kiểm kê định kỳ");
        fetchData();
      } else {
        alert("Không thể áp dụng việc điều chỉnh kho.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // PO Delete
  const handleDeletePO = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa đơn đặt hàng này không?")) return;
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert("Không tìm thấy đơn hàng cần xóa.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filters output products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Basic inventory valuations statistics
  const totalSkuCount = products.length;
  const totalStockItemsCount = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryCapital = products.reduce((sum, p) => sum + (p.stock * p.importPrice), 0);
  const totalPotentialRevenue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="w-full text-zinc-100 flex flex-col gap-6" id="warehouse-view-root">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-white/5 shrink-0">
        <div>
          <h2 className="text-3xl font-black tracking-tighter leading-none italic uppercase">
            📦 {subTab === "products" ? "Sản phẩm" : 
                subTab === "inventory" ? "Kho hiện tồn" : 
                subTab === "purchase" ? "Đơn mua hàng" : 
                subTab === "receive" ? "Nhập hàng vào kho" : 
                subTab === "history" ? "Nhật ký lưu vết kho" : 
                subTab === "adjust" ? "Điều chỉnh tồn kho" : "Báo cáo thống kê kho"}
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            HỆ THỐNG QUẢN LÝ KHO HÀNG PHÒNG GYM // LIVE_LOGICAL_AUDIT
          </p>
        </div>

        {subTab === "products" && (
          <button
            onClick={handleOpenNewProduct}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#CCFF00] text-black font-black text-sm uppercase group transition-all shrink-0 hover:bg-[#b0db00] shadow-[0_10px_20px_rgba(204,255,0,0.1)]"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            Vạch mặt sản phẩm mới
          </button>
        )}

        {subTab === "purchase" && (
          <button
            onClick={() => {
              setIsPoModalOpen(true);
              setPoItems([]);
              setPoSupplierName("");
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#CCFF00] text-black font-black text-sm uppercase group transition-all shrink-0 hover:bg-[#b0db00] shadow-[0_10px_20px_rgba(204,255,0,0.1)]"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            Lập phiếu đặt mua hàng
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* QUICK STATUS METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="warehouse-mini-metrics">
        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-semibold">TỔNG MÃ HÀNG (SKU)</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black italic">{totalSkuCount}</span>
            <Database className="w-4 h-4 text-zinc-600" />
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-semibold">TỔNG LƯỢNG TỒN LK</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black italic">{totalStockItemsCount}</span>
            <Box className="w-4 h-4 text-[#CCFF00]" />
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-semibold">VỐN TỒN DỰ KIẾN</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-black text-[#CCFF00] font-mono">
              {totalInventoryCapital.toLocaleString("vi-VN")}đ
            </span>
            <DollarSign className="w-4 h-4 text-zinc-500" />
          </div>
        </div>

        <div className="bg-red-950/20 border border-red-500/10 p-4 rounded-2xl flex flex-col justify-between">
          <p className="text-xs font-mono text-red-500 uppercase tracking-widest font-semibold">SẢN PHẨM SẮP HẾT</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-2xl font-black italic ${lowStockProducts.length > 0 ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`}>
              {lowStockProducts.length}
            </span>
            <AlertTriangle className={`w-4 h-4 ${lowStockProducts.length > 0 ? 'text-red-500' : 'text-zinc-600'}`} />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-12 text-zinc-500 italic gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Đang truy xuất dữ liệu kho...
        </div>
      )}

      {/* RENDER ACTIVE TAB */}
      {!loading && (
        <div className="w-full shrink-0" id="warehouse-active-panel">
          
          {/* ======================= TAB: PRODUCTS ======================= */}
          {subTab === "products" && (
            <div className="space-y-6">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Tìm tên hoặc mã sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-sm focus:outline-none focus:border-[#CCFF00]/40"
                  />
                </div>
                <div className="w-full sm:w-56">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-sm focus:outline-none text-zinc-300"
                  >
                    <option value="all">Tất cả danh mục</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 italic border border-dashed border-white/5 rounded-2xl">
                  Không tìm thấy sản phẩm nào khớp điều kiện.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(p => (
                    <div 
                      key={p.id} 
                      className={`bg-zinc-900/40 p-5 rounded-2xl border ${p.stock <= p.minStock ? 'border-amber-500/30' : 'border-white/5'} flex flex-col justify-between hover:border-white/20 transition-all`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-neutral-800 shrink-0 overflow-hidden border border-white/5 flex items-center justify-center text-zinc-700">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Package className="w-8 h-8" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] bg-white/5 text-zinc-400 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {p.code}
                          </span>
                          <h4 className="text-base font-bold text-white mt-1 truncate">{p.name}</h4>
                          <p className="text-xs text-zinc-500 mt-0.5">{p.category} // Đơn vị: {p.unit}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <p className="text-zinc-500">Ghé mua:</p>
                          <p className="font-bold text-[#CCFF00]">{p.price.toLocaleString()}đ</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Giá vốn:</p>
                          <p className="font-bold text-zinc-300">{p.importPrice.toLocaleString()}đ</p>
                        </div>
                        <div className="col-span-2 mt-1">
                          <p className="text-zinc-500">Mức tồn hiện tại:</p>
                          <p className={`font-bold flex items-center gap-1.5 ${p.stock <= p.minStock ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                            {p.stock} {p.unit}
                            {p.stock <= p.minStock && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 flex items-center gap-1 font-semibold uppercase font-sans">
                                <AlertTriangle className="w-2.5 h-2.5" /> Thấp
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-2.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Chỉnh sửa (Bảo lưu tồn kho)"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2.5 rounded-lg bg-red-950/20 text-red-400/80 hover:text-red-400 hover:bg-red-950/40 transition-all"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB: INVENTORY ======================= */}
          {subTab === "inventory" && (
            <div className="bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-sm font-mono text-zinc-400">DANH MỤC THẺ KHO TỔN KHẢ DỤNG</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tìm theo tên/mã..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-xs focus:outline-none focus:border-[#CCFF00]/40"
                  />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-xs focus:outline-none"
                  >
                    <option value="all">Mọi loại</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-zinc-900 border-b border-white/5 text-zinc-400 text-[10px] font-mono uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Mã Sản Phẩm</th>
                      <th className="p-4">Tên Sản Phẩm</th>
                      <th className="p-4">Danh Mục</th>
                      <th className="p-4">Đơn Vị</th>
                      <th className="p-4 text-right">Lượng Tồn Hiện Tại</th>
                      <th className="p-4 text-center">Tồn Tối Thiểu</th>
                      <th className="p-4 text-center">Cảnh Báo Sắp Hết</th>
                      <th className="p-4 text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {filteredProducts.map(p => (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-white/[0.02] transition-colors ${p.stock <= p.minStock ? 'bg-red-950/5' : ''}`}
                      >
                        <td className="p-4 font-mono font-bold text-[#CCFF00]">{p.code}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{p.name}</div>
                        </td>
                        <td className="p-4 text-zinc-400">{p.category}</td>
                        <td className="p-4 text-zinc-400">{p.unit}</td>
                        <td className={`p-4 text-right font-black font-mono text-base ${p.stock <= p.minStock ? 'text-red-400' : 'text-white'}`}>
                          {p.stock}
                        </td>
                        <td className="p-4 text-center font-mono text-zinc-500">{p.minStock}</td>
                        <td className="p-4 text-center">
                          {p.stock <= p.minStock ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/40 border border-red-500/20 text-red-500 text-[10px] font-black uppercase font-mono tracking-tighter">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Cần đặt mua
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px] font-bold">
                              An toàn
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${p.status === "Active" ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-zinc-500 italic">
                          Không có thông tin dự phòng nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================= TAB: PURCHASE ======================= */}
          {subTab === "purchase" && (
            <div className="space-y-6">
              <div className="bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden p-5">
                <h3 className="text-sm font-mono text-zinc-400 mb-4 uppercase">DANH SÁCH ĐƠN ĐẶT HÀNG MUA PHÒNG GYM</h3>
                
                {purchaseOrders.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 italic">
                    Chưa tạo đơn đặt hàng dạm thảo hoặc đơn mua hàng nào.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchaseOrders.map(po => (
                      <div 
                        key={po.id} 
                        className="bg-zinc-900/40 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-base font-black text-[#CCFF00] font-mono">
                                {po.orderCode}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                                po.status === "Received" ? "bg-emerald-500/10 text-emerald-500" :
                                po.status === "Ordered" ? "bg-sky-500/10 text-sky-400" :
                                po.status === "Cancelled" ? "bg-red-500/10 text-red-500" : "bg-neutral-800 text-zinc-400"
                              }`}>
                                {po.status === "Draft" ? "Bản Nháp" : 
                                 po.status === "Ordered" ? "Đã Gửi PO" : 
                                 po.status === "Received" ? "Đã Nhập Kho" : "Đã Cancel"}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">
                              <strong>Supplier:</strong> {po.supplierName} // Ngày lập: {po.orderDate}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zinc-500 uppercase font-mono">Tổng giá trị đơn</p>
                            <p className="text-lg font-black font-mono text-white mt-0.5">
                              {po.totalAmount.toLocaleString()}đ
                            </p>
                          </div>
                        </div>

                        {/* Order items expander preview */}
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-xs font-bold text-zinc-400 mb-2">Thẻ mặt hàng đặt mua ({po.items.length}):</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {po.items.map((item, idx) => (
                              <div key={idx} className="bg-black/20 p-2.5 rounded border border-white/5 flex justify-between items-center">
                                <span className="font-semibold text-zinc-300">
                                  {item.productName} <span className="text-[10px] ml-1 text-zinc-500 font-mono">({item.productCode})</span>
                                </span>
                                <span className="font-bold text-zinc-300">
                                  x{item.quantity} // {item.importPrice.toLocaleString()}đ
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Flow Status transitions actions */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 justify-end">
                          {po.status === "Draft" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatusPO(po, "Ordered")}
                                className="px-3 py-1.5 rounded-lg bg-sky-950/40 border border-sky-500/20 text-sky-450 text-xs font-bold uppercase tracking-wider hover:bg-sky-950/80"
                              >
                                Đánh dấu gửi Đơn Mua
                              </button>
                              <button
                                onClick={() => handleDeletePO(po.id)}
                                className="px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-500/15 text-red-400 text-xs font-bold uppercase transition-all hover:bg-red-950/40"
                              >
                                Hủy & Xóa Nháp
                              </button>
                            </>
                          )}

                          {po.status === "Ordered" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatusPO(po, "Received")}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-black uppercase tracking-wider hover:bg-[#b0db00]"
                              >
                                Nhập Kho Vật Lý 📥
                              </button>
                              <button
                                onClick={() => handleUpdateStatusPO(po, "Cancelled")}
                                className="px-3 py-1.5 rounded-lg bg-zinc-850 text-zinc-400 text-xs font-bold uppercase hover:bg-zinc-800"
                              >
                                Hủy Đơn
                              </button>
                            </>
                          )}
                          
                          {po.status === "Received" && po.receivedDate && (
                            <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 italic">
                              <CheckCircle2 className="w-4 h-4 shrink-0" /> Sản phẩm nhập kho an toàn vào ngày {po.receivedDate}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================= TAB: RECEIVE ======================= */}
          {subTab === "receive" && (
            <div className="space-y-6">
              <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5">
                <span className="text-sm font-mono text-zinc-400 uppercase">NHẬP KHO THỰC TẾ (HÀNG VỀ TỚI PHÒNG GYM)</span>
                <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
                  Để đảm bảo tính toàn vẹn tuyệt đối của lượng tồn kho, việc tạo sản phẩm sẽ không làm tăng tồn.
                  Chỉ các phiếu mua hàng ở trạng thái <strong>Đã Gửi PO (Ordered)</strong> mới được duyệt kiểm kê nhập kho thực tế vào thẻ kho tại đây.
                </p>

                <div className="mt-6 space-y-4">
                  {purchaseOrders.filter(po => po.status === "Ordered").length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 italic border border-dashed border-white/5 rounded-xl">
                      Không có phiếu đặt hàng nào đang chờ nhập kho vào hệ thống (Ordered).
                      Hãy lướt qua mục "Mua hàng" để lập phiếu mới hoặc bấm gửi Đơn nháp.
                    </div>
                  ) : (
                    purchaseOrders.filter(po => po.status === "Ordered").map(po => (
                      <div key={po.id} className="p-5 rounded-xl border border-sky-500/10 bg-sky-950/5">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <p className="text-zinc-500 text-xs font-mono">ĐƠN CHỜ NHẬP KHO</p>
                            <h4 className="text-base font-bold text-white mt-1">{po.orderCode} // NCC: {po.supplierName}</h4>
                            <p className="text-xs text-zinc-400 mt-1">Tổng PO: <strong>{po.totalAmount.toLocaleString()}đ</strong></p>
                          </div>
                          <button
                            onClick={() => handleUpdateStatusPO(po, "Received")}
                            className="px-4 py-2.5 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#b0db00] shadow-md shrink-0"
                          >
                            <ArrowDown className="w-4 h-4" /> Xác nhận thực tế - Tăng tồn và ghi log lưu vết
                          </button>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-white/5 text-xs text-zinc-400">
                          <p className="font-semibold text-zinc-300">Chi tiết sản lượng cần nhập kho:</p>
                          <ul className="mt-2 space-y-1 pl-4 list-disc">
                            {po.items.map((it, idx) => (
                              <li key={idx}>
                                {it.productName} ({it.productCode}): Đặt mua <strong>{it.quantity}</strong> mặt hàng - Đơn giá gốc: {it.importPrice.toLocaleString()}đ
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================= TAB: HISTORY ======================= */}
          {subTab === "history" && (
            <div className="bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <span className="text-sm font-mono text-zinc-400">MỌI THAO TÁC BIẾN ĐỘNG KHO ĐỀU PHẢI CÓ LỊCH SỬ TRUY VẾT</span>
                <button
                  onClick={fetchData}
                  className="p-1 px-3.5 py-1.5 rounded bg-white/5 border border-white/5 text-xs font-bold text-zinc-300 hover:text-white"
                >
                  Tải lại dữ liệu
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-zinc-900 border-b border-white/5 text-zinc-400 text-[10px] font-mono uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Thời Gian</th>
                      <th className="p-4">Mã Hàng</th>
                      <th className="p-4">Sản Phẩm</th>
                      <th className="p-4 text-center">Nghiệp Vụ</th>
                      <th className="p-4 text-right">Lượng Thay Đổi</th>
                      <th className="p-4 text-right">Tồn Trước</th>
                      <th className="p-4 text-right">Tồn Sau</th>
                      <th className="p-4">Ghi Chú Chi Tiết</th>
                      <th className="p-4 text-center">Người Thực Hiện</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px] md:text-xs">
                    {history.map((h) => {
                      const formattedDate = new Date(h.date).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        day: "2-digit",
                        month: "2-digit"
                      });

                      return (
                        <tr key={h.id} className="hover:bg-white/[0.01]">
                          <td className="p-4 text-zinc-500">{formattedDate}</td>
                          <td className="p-4 text-[#CCFF00] font-bold">{h.productCode}</td>
                          <td className="p-4 text-zinc-200 truncate max-w-xs font-sans font-semibold">{h.productName}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${
                              h.type === "IMPORT" ? "bg-emerald-500/10 text-emerald-500" :
                              h.type === "EXPORT" ? "bg-amber-500/10 text-amber-500" :
                              h.type === "ADJUST_INC" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                            }`}>
                              {h.type === "IMPORT" ? "NHẬP KHO" :
                               h.type === "EXPORT" ? "XUẤT BÁN" :
                               h.type === "ADJUST_INC" ? "TĂNG TỒN" : "GIẢM TỒN"}
                            </span>
                          </td>
                          <td className={`p-4 text-right font-bold text-sm ${
                            h.type === "IMPORT" || h.type === "ADJUST_INC" ? "text-emerald-400" : "text-amber-400"
                          }`}>
                            {(h.type === "IMPORT" || h.type === "ADJUST_INC") ? "+" : "-"}{h.changeQty}
                          </td>
                          <td className="p-4 text-right text-zinc-500">{h.beforeQty}</td>
                          <td className="p-4 text-right text-zinc-300 font-bold">{h.afterQty}</td>
                          <td className="p-4 text-zinc-400 font-sans">{h.note}</td>
                          <td className="p-4 text-center text-zinc-500">{h.createdBy || "máy"}</td>
                        </tr>
                      );
                    })}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-zinc-500 italic">
                          Chưa có vết biến động kho hàng nào được ghi nhận.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================= TAB: ADJUST ======================= */}
          {subTab === "adjust" && (
            <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-6 max-w-2xl mx-auto">
              <span className="text-xs text-[#CCFF00] font-mono uppercase tracking-widest font-bold">🛠️ KHU VỰC CAN THIỆP ĐIỀU CHỈNH KHO</span>
              <h3 className="text-xl font-bold mt-2">Phiếu Cân Bằng Kho Hàng Vật Lý</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Dùng khi có sự chênh lệch thừa / thiếu giữa sổ sách hệ thống và kết quả kiểm kê thực tế tại phòng tập (hỏng hóc, hao số, mất, hàng dùng thử).
                Mọi hành động can thiệp sẽ thay đổi trực tiếp lượng tồn trên thẻ kho và bắt buộc lưu lại lịch sử chi tiết cho đợt kiểm tra.
              </p>

              <form onSubmit={handleAdjustmentSubmit} className="mt-6 space-y-4 text-sm">
                <div>
                  <label className="block text-zinc-400 font-bold mb-2">1. Chọn sản phẩm cần điều chỉnh</label>
                  <select
                    value={adjustProductId}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setAdjustProductId(id);
                      const prod = products.find(p => p.id === id);
                      setAdjustChangeQty(0);
                    }}
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none"
                    required
                  >
                    <option value="">Chọn sản phẩm...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code}) - Tồn kho: {p.stock} {p.unit}
                      </option>
                    ))}
                  </select>
                </div>

                {adjustProductId !== -1 && (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                    <p className="text-xs text-zinc-400">
                      Tồn thực tế hiện hiển thị trên hệ thống: <strong>{products.find(p => p.id === adjustProductId)?.stock} {products.find(p => p.id === adjustProductId)?.unit}</strong>
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-400 font-bold mb-2">Số lượng thay đổi</label>
                        <input
                          type="number"
                          value={adjustChangeQty}
                          onChange={(e) => setAdjustChangeQty(Number(e.target.value))}
                          placeholder="Nhập VD: -5 hoặc +3..."
                          className="w-full p-3 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-[#CCFF00]"
                          required
                        />
                        <span className="text-[10px] text-zinc-500 mt-1 block">Giá trị âm (-) để giảm kho, dương (+) để tăng tồn.</span>
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-bold mb-2">Tồn sau kết luận điều chỉnh</label>
                        <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 font-mono font-bold text-lg text-white">
                          {Math.max(0, (products.find(p => p.id === adjustProductId)?.stock || 0) + adjustChangeQty)} {products.find(p => p.id === adjustProductId)?.unit}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-zinc-400 font-bold mb-2">2. Lý do chi tiết điều chỉnh</label>
                  <textarea
                    rows={3}
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="VD: Kiểm kê tủ lạnh thấy hao hụt 1 chai, viết giấy phạt trừ lương ca trực đêm..."
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-[#CCFF00]"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full p-3.5 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b0db00] shadow-md"
                  >
                    Áp Dụng Lệnh Cân Bằng Kho Hàng 🛠️
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================= TAB: REPORT ======================= */}
          {subTab === "report" && (
            <div className="space-y-6">
              {/* Dashboard Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="warehouse-report-grid">
                
                {/* Valuations Card */}
                <div className="bg-zinc-900/20 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#CCFF00] font-black uppercase tracking-widest block">BÁO CÁO TÀI SẢN KHO</span>
                    <h3 className="text-lg font-bold text-white mt-1">Định Giá Giá Trị Tồn</h3>
                    <p className="text-xs text-zinc-500 mt-1">Tổng tiềm năng tài sản vật tư hiện đọng tại cơ sở.</p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="p-3 bg-zinc-950 rounded-xl border border-white/5">
                      <p className="text-zinc-500 text-[10px] font-mono">TỔNG ĐẦU TƯ GỐC (VỐN):</p>
                      <p className="text-xl font-bold font-mono text-[#CCFF00] mt-1">{totalInventoryCapital.toLocaleString()}đ</p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-xl border border-white/5">
                      <p className="text-zinc-500 text-[10px] font-mono">GIÁ TRỊ DOANH SỐ TIỀM NĂNG:</p>
                      <p className="text-xl font-bold font-mono text-white mt-1">{totalPotentialRevenue.toLocaleString()}đ</p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-xl border border-white/5">
                      <p className="text-zinc-500 text-[10px] font-mono">LỢI NHUẬN GỘP DỰ KIẾN KHI BÁN HẾT:</p>
                      <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{(totalPotentialRevenue - totalInventoryCapital).toLocaleString()}đ</p>
                    </div>
                  </div>
                </div>

                {/* Subcategory split Visual widget */}
                <div className="bg-zinc-900/20 border border-white/5 p-6 rounded-2xl col-span-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#CCFF00] font-black uppercase tracking-widest block">CHỈ SỐ THỂ LOẠI</span>
                    <h3 className="text-lg font-bold text-white mt-1">Thống Kê Cơ Cấu Hiện Tồn</h3>
                    <p className="text-xs text-zinc-500 mt-1">Sản lượng phân bổ cho từng loại mặt hàng.</p>
                  </div>

                  <div className="mt-6 space-y-4 flex-1 flex flex-col justify-center">
                    {categories.map(cat => {
                      const catProducts = products.filter(p => p.category === cat);
                      const catStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
                      const pct = totalStockItemsCount > 0 ? (catStock / totalStockItemsCount) * 105 : 0;

                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-zinc-300">{cat} ({catProducts.length} mấu)</span>
                            <span className="font-mono text-[#CCFF00] font-black">{catStock} {catStock > 0 ? `(${Math.round((catStock/totalStockItemsCount)*100)}%)` : ''}</span>
                          </div>
                          <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="bg-[#CCFF00] h-full rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Warnings and low stock insights */}
              <div className="bg-zinc-900/20 border border-white/5 p-5 rounded-2xl">
                <span className="text-xs font-mono text-amber-500 flex items-center gap-1.5 uppercase font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> CẢNH BÁO KIỂM KÊ BAO PHỦ: SẢN PHẨM KHỐN CÙNG CẦN CHÚ Ý
                </span>
                
                {lowStockProducts.length === 0 ? (
                  <p className="text-xs text-zinc-400 mt-2 italic">Tất cả sản phẩm đều đang nằm trên ngưỡng tối thiểu. Thẻ kho sạch và an toàn!</p>
                ) : (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lowStockProducts.map(p => (
                      <div key={p.id} className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/25 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white truncate max-w-[150px]">{p.name}</p>
                          <p className="text-zinc-500 font-mono mt-0.5">{p.code} // TỒN {p.stock}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 uppercase">
                          Dưới {p.minStock} {p.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================= MODAL: NEW / EDIT PRODUCT ======================= */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-black/85"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
                <h3 className="text-lg font-black uppercase text-white tracking-tight">
                  {editingProduct ? `Sửa thông tin sản phẩm` : "Tạo mẫu sản phẩm mới"}
                </h3>
                <button 
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!editingProduct && (
                <p className="text-amber-500 text-[11px] mb-4 p-2.5 rounded bg-amber-500/5 border border-amber-500/20 font-bold uppercase tracking-tight">
                  ⚠️ CHÚ Ý: Theo yêu cầu phân tích - Tạo mới Sản Phẩm sẽ mặc định TỒN KHO = 0. Bạn chỉ có thể tăng tồn qua hoạt động duyệt PO / Nhượng kho.
                </p>
              )}

              <form onSubmit={handleProductSubmit} className="space-y-4 text-xs md:text-sm text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Mã sản phẩm (VD: PROD010)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-neutral-900 border border-white/10 text-white font-mono focus:outline-none"
                      placeholder="Hệ thống tự tạo nếu trống..."
                      value={productForm.code}
                      onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Tên sản phẩm *</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-[#CCFF00]"
                      placeholder="Nước uống dưa hấu, Whey Gold..."
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Danh mục sản phẩm</label>
                    <select
                      className="w-full p-2.5 rounded bg-neutral-900 border border-white/10 text-white text-xs focus:outline-none"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Đơn vị đóng gói / quy đổi</label>
                    <select
                      className="w-full p-2.5 rounded bg-neutral-900 border border-white/10 text-white text-xs focus:outline-none"
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono">
                  <div>
                    <label className="block text-zinc-400 font-sans font-bold mb-1 col-span-1">Giá gốc (nhập) *</label>
                    <input
                      type="number"
                      className="w-full p-2 rounded bg-neutral-900 border border-white/10 text-white"
                      value={productForm.importPrice}
                      onChange={(e) => setProductForm({ ...productForm, importPrice: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-sans font-bold mb-1">Giá niêm yết bán *</label>
                    <input
                      type="number"
                      className="w-full p-2 rounded bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-[#CCFF00]"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-sans font-bold mb-1">Cảnh báo tối thiểu</label>
                    <input
                      type="number"
                      className="w-full p-2 rounded bg-neutral-900 border border-white/10 text-white"
                      value={productForm.minStock}
                      onChange={(e) => setProductForm({ ...productForm, minStock: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-2">Hình ảnh sản phẩm</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {productForm.image ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 group shrink-0">
                        <img 
                          src={productForm.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, image: "" })}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 transition-opacity cursor-pointer"
                          title="Xóa hình ảnh"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl border border-dashed border-white/10 bg-zinc-900 flex flex-col items-center justify-center text-zinc-500 shrink-0">
                        <Package className="w-8 h-8" />
                        <span className="text-[9px] uppercase mt-1 font-semibold">Chưa có ảnh</span>
                      </div>
                    )}

                    <div className="flex-1">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl cursor-pointer text-zinc-300 hover:text-white hover:bg-zinc-805 transition-colors text-xs font-bold font-sans">
                        <Plus className="w-4 h-4 text-[#CCFF00]" />
                        <span>Chọn hình ảnh từ tệp tin</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProductForm({ ...productForm, image: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">Hỗ trợ định dạng PNG, JPG, JPEG dưới 2MB. Tệp ảnh sẽ được lưu trữ trực tiếp.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Trạng thái bán hàng</label>
                  <select
                    className="w-full p-2.5 rounded bg-neutral-900 border border-white/10 text-white focus:outline-none text-xs"
                    value={productForm.status}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                  >
                    <option value="Active">Đang Bán / Kích Hoạt (Active)</option>
                    <option value="Inactive">Ngừng kinh doanh (Inactive)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-[#CCFF00] text-black font-black uppercase"
                  >
                    {editingProduct ? "Lưu thay đổi" : "Khởi tạo sản phẩm"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================= MODAL: CREATE PURCHASE ORDER ======================= */}
      <AnimatePresence>
        {isPoModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPoModalOpen(false)}
              className="absolute inset-0 bg-black/85"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto text-left"
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                <h3 className="text-lg font-black uppercase text-white tracking-tight">
                  TẠO ĐƠN ĐẶT MUA HÀNG (DẠM THẢO PHIẾU NHẬP)
                </h3>
                <button 
                  onClick={() => setIsPoModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePoSubmit} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Tên Nhà Cung Cấp *</label>
                  <input
                    type="text"
                    placeholder="VD: Cty Cổ Phần Whey Gym Việt Nam, Nước Giải Khát Coca-Cola..."
                    className="w-full p-2.5 rounded bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-[#CCFF00]"
                    value={poSupplierName}
                    onChange={(e) => setPoSupplierName(e.target.value)}
                    required
                  />
                </div>

                {/* Local Cart items helper inside PO */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                  <h4 className="font-bold text-zinc-300">Thêm mặt hàng đặt mua vào danh sách:</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Chọn sản phẩm</label>
                      <select
                        className="w-full p-2 rounded bg-neutral-950 border border-white/10 text-white text-xs"
                        value={selectedPoProductId}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          setSelectedPoProductId(id);
                          const prod = products.find(p => p.id === id);
                          if (prod) setSelectedPoImportPrice(prod.importPrice);
                        }}
                      >
                        <option value="-1">Chọn...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Số lượng mua</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 rounded bg-neutral-950 border border-white/10 text-white"
                        value={selectedPoQty}
                        onChange={(e) => setSelectedPoQty(Math.max(1, Number(e.target.value)))}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Giá vốn thỏa thuận (Giá gốc)</label>
                      <input
                        type="number"
                        className="w-full p-2 rounded bg-neutral-950 border border-white/10 text-white"
                        value={selectedPoImportPrice}
                        onChange={(e) => setSelectedPoImportPrice(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPoItem}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-[#CCFF00] font-black text-[11px] uppercase rounded-lg border border-[#CCFF00]/10 tracking-widest"
                  >
                    + Thêm dòng sản phẩm đặt
                  </button>
                </div>

                {/* Selected Basket PO items list */}
                <div>
                  <h4 className="font-bold text-zinc-300 mb-2">Sản phẩm hiện đang đặt ({poItems.length}):</h4>
                  {poItems.length === 0 ? (
                    <p className="text-zinc-500 italic text-xs">Chưa có sản phẩm nào trong giỏ hàng PO.</p>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                      {poItems.map((item, index) => {
                        const prod = products.find(p => p.id === item.productId);
                        return (
                          <div key={index} className="p-2 bg-neutral-900 border border-white/5 rounded flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-200">
                              {prod?.name} ({prod?.code})
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-zinc-400">
                                {item.quantity} x {item.importPrice.toLocaleString()}đ = {(item.quantity * item.importPrice).toLocaleString()}đ
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemovePoItemLocal(index)}
                                className="text-red-500 hover:text-red-400 p-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {poItems.length > 0 && (
                  <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 text-right font-mono font-bold">
                    TỔNG CỘNG ĐƠN ĐỒNG: <span className="text-[#CCFF00] text-base">
                      {poItems.reduce((sum, item) => sum + (item.quantity * item.importPrice), 0).toLocaleString()}đ
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsPoModalOpen(false)}
                    className="px-4 py-2 rounded bg-zinc-900 text-zinc-300 font-semibold"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-[#CCFF00] text-black font-black uppercase"
                  >
                    Khởi tạo Phiếu Bản Nháp (Draft PO)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
