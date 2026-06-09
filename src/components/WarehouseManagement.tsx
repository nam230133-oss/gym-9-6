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

// Translations dictionary
const whTranslations: Record<string, Record<string, string>> = {
  vi: {
    system_subtitle: "HỆ THỐNG QUẢN LÝ KHO HÀNG PHÒNG GYM // LIVE_LOGICAL_AUDIT",
    title_products: "Sản phẩm",
    title_inventory: "Kho hiện tồn",
    title_purchase: "Đơn mua hàng",
    title_receive: "Nhập hàng vào kho",
    title_history: "Nhật ký lưu vết kho",
    title_adjust: "Điều chỉnh tồn kho",
    title_report: "Báo cáo thống kê kho",
    add_new_product: "Vạch mặt sản phẩm mới",
    create_po: "Lập phiếu đặt mua hàng",
    metric_sku: "TỔNG MÃ HÀNG (SKU)",
    metric_total_stock: "TỔNG LƯỢNG TỒN LK",
    metric_capital: "VỐN TỒN DỰ KIẾN",
    metric_low_stock: "SẢN PHẨM SẮP HẾT",
    loading_data: "Đang truy xuất dữ liệu kho...",
    all_categories: "Tất cả danh mục",
    search_product_placeholder: "Tìm tên hoặc mã sản phẩm...",
    no_products_found: "Không tìm thấy sản phẩm nào khớp điều kiện.",
    retail_price: "Ghé mua:",
    cost_price: "Giá vốn:",
    current_stock_level: "Mức tồn hiện tại:",
    low_stock_indicator: "Thấp",
    btn_edit_title: "Chỉnh sửa (Bảo lưu tồn kho)",
    btn_delete_title: "Xóa vĩnh viễn",
    available_stock_records: "DANH MỤC THẺ KHO TỔN KHẢ DỤNG",
    search_by_name_code: "Tìm theo tên/mã...",
    all_types: "Mọi loại",
    th_code: "Mã Sản Phẩm",
    th_name: "Tên Sản Phẩm",
    th_category: "Danh Mục",
    th_unit: "Đơn Vị",
    th_current_stock: "Lượng Tồn Hiện Tại",
    th_min_stock: "Tồn Tối Thiểu",
    th_warning: "Cảnh Báo Sắp Hết",
    th_status: "Trạng Thái",
    alert_reorder: "Cần đặt mua",
    alert_safe: "An toàn",
    no_placeholder_data: "Không có thông tin dự phòng nào.",
    po_list_title: "DANH SÁCH ĐƠN ĐẶT HÀNG MUA PHÒNG GYM",
    no_po_found: "Chưa tạo đơn đặt hàng dạm thảo hoặc đơn mua hàng nào.",
    po_item_count: "Thẻ mặt hàng đặt mua",
    mark_po_ordered: "Đánh dấu gửi Đơn Mua",
    cancel_and_delete_draft: "Hủy & Xóa Nháp",
    receive_physical_stock: "Nhập Kho Vật Lý 📥",
    cancel_order: "Hủy Đơn",
    success_received_at: "Sản phẩm nhập kho an toàn vào ngày",
    physical_stock_intake_title: "NHẬP KHO THỰC TẾ (HÀNG VỀ TỚI PHÒNG GYM)",
    physical_stock_intake_desc: "Để đảm bảo tính toàn vẹn tuyệt đối của lượng tồn kho, việc tạo sản phẩm sẽ không làm tăng tồn. Chỉ các phiếu mua hàng ở trạng thái Ordered mới được duyệt kiểm kê nhập kho thực tế vào thẻ kho tại đây.",
    no_po_waiting: "Không có phiếu đặt hàng nào đang chờ nhập kho vào hệ thống (Ordered). Hãy lướt qua mục 'Mua hàng' để lập phiếu mới hoặc bấm gửi Đơn nháp.",
    waiting_intake: "ĐƠN CHỜ NHẬP KHO",
    total_po_value: "Tổng PO:",
    confirm_physical_intake_btn: "Xác nhận thực tế - Tăng tồn và ghi log lưu vết",
    detail_qty_intake: "Chi tiết sản lượng cần nhập kho:",
    po_order_quantity: "Đặt mua",
    po_items_text: "mặt hàng",
    po_unit_import_price: "Đơn giá gốc:",
    audit_history_title: "MỌI THAO TÁC BIẾN ĐỘNG KHO ĐỀU PHẢI CÓ LỊCH SỬ TRUY VẾT",
    reload_data_btn: "Tải lại dữ liệu",
    th_time: "Thời Gian",
    th_action_type: "Nghiệp Vụ",
    th_change_qty: "Lượng Thay Đổi",
    th_before_qty: "Tồn Trước",
    th_after_qty: "Tồn Sau",
    th_notes: "Ghi Chú Chi Tiết",
    th_operator: "Người Thực Hiện",
    log_import: "NHẬP KHO",
    log_export: "XUẤT BÁN",
    log_adjust_inc: "TĂNG TỒN",
    log_adjust_dec: "GIẢM TỒN",
    no_logs_found: "Chưa có vết biến động kho hàng nào được ghi nhận.",
    adjust_area_eyebrow: "🛠️ KHU VỰC CAN THIỆP ĐIỀU CHỈNH KHO",
    adjust_form_title: "Phiếu Cân Bằng Kho Hàng Vật Lý",
    adjust_form_desc: "Dùng khi có sự chênh lệch thừa / thiếu giữa sổ sách hệ thống và kết quả kiểm kê thực tế tại phòng tập (hỏng hóc, hao số, mất, hàng dùng thử). Mọi hành động can thiệp sẽ thay đổi trực tiếp lượng tồn trên thẻ kho và bắt buộc lưu lại lịch sử chi tiết cho đợt kiểm tra.",
    adjust_label_prod: "1. Chọn sản phẩm cần điều chỉnh",
    select_product_prompt: "Chọn sản phẩm...",
    text_current_stock: "Tồn kho:",
    text_sys_current_stock: "Tồn thực tế hiện hiển thị trên hệ thống:",
    adjust_delta_qty: "Số lượng thay đổi",
    adjust_delta_prompt: "Nhập VD: -5 hoặc +3...",
    adjust_delta_desc: "Giá trị âm (-) để giảm kho, dương (+) để tăng tồn.",
    adjust_after_balance: "Tồn sau kết luận điều chỉnh",
    adjust_label_reason: "2. Lý do chi tiết điều chỉnh",
    adjust_reason_prompt: "VD: Kiểm kê tủ lạnh thấy hao hụt 1 chai, viết giấy phạt trừ lương ca trực đêm...",
    apply_adjust_btn: "Áp Dụng Lệnh Cân Bằng Kho Hàng 🛠️",
    report_asset_eyebrow: "BÁO CÁO TÀI SẢN KHO",
    report_asset_title: "Định Giá Giá Trị Tồn",
    report_asset_desc: "Tổng tiềm năng tài sản vật tư hiện đọng tại cơ sở.",
    text_total_cost_capital: "TỔNG ĐẦU TƯ GỐC (VỐN):",
    text_potential_revenue: "GIÁ TRỊ DOANH SỐ TIỀM NĂNG:",
    text_estimated_gross_profit: "LỢI NHUẬN GỘP DỰ KIẾN KHI BÁN HẾT:",
    report_category_eyebrow: "CHỈ SỐ THỂ LOẠI",
    report_category_title: "Thống Kê Cơ Cấu Hiện Tồn",
    report_category_desc: "Sản lượng phân bổ cho từng loại mặt hàng.",
    edit_product_title: "Sửa thông tin sản phẩm",
    create_product_title: "Tạo mẫu sản phẩm mới",
    warning_create_stock_zero: "⚠️ CHÚ Ý: Theo yêu cầu phân tích - Tạo mới Sản Phẩm sẽ mặc định TỒN KHO = 0. Bạn chỉ có thể tăng tồn qua hoạt động duyệt PO / Nhượng kho.",
    prod_form_code: "Mã sản phẩm (VD: PROD010)",
    prod_form_code_prompt: "Hệ thống tự tạo nếu trống...",
    prod_form_name: "Tên sản phẩm *",
    prod_form_name_prompt: "Nước uống dưa hấu, Whey Gold...",
    prod_form_cat: "Danh mục sản phẩm",
    prod_form_unit: "Đơn vị đóng gói / quy đổi",
    prod_form_cost: "Giá gốc (nhập) *",
    prod_form_price: "Giá niêm yết bán *",
    prod_form_min: "Mức tồn tối thiểu để báo động *",
    prod_form_status: "Trạng thái kinh doanh",
    prod_form_img: "Hình ảnh sản phẩm",
    img_not_uploaded: "Chưa có ảnh",
    img_select_btn: "Chọn hình ảnh từ tệp tin",
    img_desc_help: "Hỗ trợ định dạng PNG, JPG, JPEG dưới 2MB. Tệp ảnh sẽ được lưu trữ trực tiếp.",
    btn_save: "Lưu thông tin",
    supplier_name: "Tên nhà cung cấp *",
    supplier_prompt: "VD: Cty FitNutrition, Đại lý nước giải khát...",
    po_add_items_heading: "Chọn mặt hàng cần mua để thêm vào danh sách",
    po_qty_label: "Số lượng mua",
    po_cost_label: "Giá gốc nhập khớp đơn",
    po_add_btn: "Thêm dòng",
    po_no_items_warning: "Chưa thêm mặt hàng nào cho đơn này",
    po_summary: "BẢNG TẦM QUÁT PO",
    po_creator: "Người lập đơn:",
    search_by_supplier: "Tìm mã PO hoặc nhà cung cấp...",
    alert_po_success: "Lập phiếu mua hàng nháp thành công! Bạn có thể kiểm tra danh sách và đánh dấu gửi PO ngay.",
    alert_po_items_empty: "Vui lòng thêm ít nhất một mặt hàng vào đơn hàng!",
    alert_adjust_success: "Điều chỉnh tồn kho thành công! Nhật ký biến động và thẻ kho đã được lưu.",
    confirm_physical_intake_label: "Bạn có chắc muốn nhập kho không? Trạng thái 'Received' sẽ làm tăng tồn kho thực tế của các sản phẩm tương ứng và tạo lịch sử lưu vết chính xác!",
    confirm_delete_po_label: "Bạn chắc chắn muốn xóa đơn đặt hàng này không?",
    confirm_delete_prod_label: "Bạn có chắc chắn muốn xóa sản phẩm này?",
    alert_cant_delete_product: "Không thể xóa sản phẩm.",
    alert_select_product: "Vui lòng chọn sản phẩm!",
    alert_already_in_cart: "Sản phẩm đã được thêm vào giỏ hàng!",
    alert_input_supplier: "Vui lòng nhập tên nhà cung cấp!",
    alert_create_po_error: "Gặp lỗi khi tạo đơn hàng dạm thảo.",
    alert_update_po_error: "Lỗi khi cập nhật trạng thái đơn hàng mua.",
    alert_cant_apply_adjust: "Không thể áp dụng việc điều chỉnh kho.",
    alert_cant_find_po_delete: "Không tìm thấy đơn hàng cần xóa.",
    po_status_draft: "Bản Nháp",
    po_status_ordered: "Đã Gửi PO",
    po_status_received: "Đã Nhập Kho",
    po_status_cancelled: "Đã Hủy",
    sh_all_cat: "Tất cả",
    sh_mọi_loại: "Tất cả",
    btn_close: "Đóng",
    btn_create_po_draft: "Khởi tạo Phiếu Bản Nháp (Draft PO)",
    cart_empty: "Chưa có sản phẩm nào trong giỏ hàng PO.",
    cart_po_items_header: "Sản phẩm hiện đang đặt",
    status_active: "Đang hoạt động",
    status_inactive: "Ngừng hoạt động",
    supplier_label: "Nhà cung cấp",
    date_label: "Ngày",
    operator_system: "máy",
    unit_item: "sản phẩm",
    adjust_default_reason: "Kiểm kê định kỳ",
    prod_fallback: "SP",
    alert_field_required: "bắt buộc!",
    alert_failed: "Yêu cầu thất bại!",
    alert_error_occurred: "Có lỗi xảy ra!",
    alert_delta_zero: "Số lượng thay đổi không được bằng 0!"
  },
  en: {
    system_subtitle: "GYM INVENTORY MANAGEMENT SYSTEM // LIVE_LOGICAL_AUDIT",
    title_products: "Products",
    title_inventory: "Current Stock",
    title_purchase: "Purchase Orders",
    title_receive: "Stock Intake",
    title_history: "Inventory Logs",
    title_adjust: "Stock Adjustments",
    title_report: "Inventory Reports",
    add_new_product: "Catalog New Product",
    create_po: "Create Purchase Order",
    metric_sku: "TOTAL SKUs",
    metric_total_stock: "TOTAL STOCK",
    metric_capital: "ESTIMATED CAPITAL",
    metric_low_stock: "LOW STOCK ITEMS",
    loading_data: "Loading warehouse data...",
    all_categories: "All Categories",
    search_product_placeholder: "Search by name or product code...",
    no_products_found: "No products matched the filters.",
    retail_price: "Retail Price:",
    cost_price: "Cost Price:",
    current_stock_level: "Current stock:",
    low_stock_indicator: "Low",
    btn_edit_title: "Edit product info (Preserve Stock)",
    btn_delete_title: "Delete permanently",
    available_stock_records: "AVAILABLE STOCK RECORD LIST",
    search_by_name_code: "Search by name/code...",
    all_types: "All types",
    th_code: "Product Code",
    th_name: "Product Name",
    th_category: "Category",
    th_unit: "Unit",
    th_current_stock: "Current Stock",
    th_min_stock: "Min Stock Level",
    th_warning: "Warning Status",
    th_status: "Status",
    alert_reorder: "Reorder Needed",
    alert_safe: "Safe",
    no_placeholder_data: "No data available.",
    po_list_title: "GYM PURCHASE ORDERS CATALOG",
    no_po_found: "No purchase orders or drafts have been created yet.",
    po_item_count: "Items in order",
    mark_po_ordered: "Submit Order as Requested",
    cancel_and_delete_draft: "Cancel & Delete Draft",
    receive_physical_stock: "Receive Physical Intake 📥",
    cancel_order: "Cancel Purchase Order",
    success_received_at: "Successfully checked into inventory on date",
    physical_stock_intake_title: "PHYSICAL STOCK RECEPTION (ARRIVED AT GYM)",
    physical_stock_intake_desc: "Creating catalog products doesn't increase stock directly. Only purchase orders at 'Ordered' status are authorized to be checked into the physical inventory storage logs here.",
    no_po_waiting: "No purchase orders waiting for physical reception (Ordered status). Review 'Purchase Orders' section to create or submit a draft.",
    waiting_intake: "PENDING DEPOSIT",
    total_po_value: "Total PO Value:",
    confirm_physical_intake_btn: "Confirm Reception - Add to Stock and Record Audit Logs",
    detail_qty_intake: "Quantities list to be registered at warehouse:",
    po_order_quantity: "Purchase Quantity",
    po_items_text: "item(s)",
    po_unit_import_price: "Import unit cost:",
    audit_history_title: "ALL MOVEMENTS MUST BE LOGGED FOR COMPLIANCE AUDITS",
    reload_data_btn: "Reload database logs",
    th_time: "Time Record",
    th_action_type: "Movement",
    th_change_qty: "Change Qty",
    th_before_qty: "Previous Balance",
    th_after_qty: "Ending Balance",
    th_notes: "Audit Justification Notes",
    th_operator: "Operator",
    log_import: "STOCK INTAKE",
    log_export: "RETAIL SALES",
    log_adjust_inc: "ADJUST ADD",
    log_adjust_dec: "ADJUST SUB",
    no_logs_found: "No inventory activities recorded.",
    adjust_area_eyebrow: "🛠️ INVENTORY CORRECTIONS WORKBENCH",
    adjust_form_title: "Physical Inventory Adjustments Form",
    adjust_form_desc: "Used when discrepancies occur between system balance sheet and physical gym audit (damages, shrinkage, demo units, etc). All actions write deep logs and adjust stock balances instantly.",
    adjust_label_prod: "1. Select product to adjust",
    select_product_prompt: "Select target product...",
    text_current_stock: "Stock count:",
    text_sys_current_stock: "System registered current stock quantity:",
    adjust_delta_qty: "Adjust Quantity Delta",
    adjust_delta_prompt: "E.g. -5 or +3...",
    adjust_delta_desc: "Negative values (-) will reduce stockpile, positive values (+) will increase it.",
    adjust_after_balance: "Resulting Stock Balance After Correction",
    adjust_label_reason: "2. Explanatory Justification Notes",
    adjust_reason_prompt: "E.g., Fridge checklist was short 1 bottle, team fee updated accordingly...",
    apply_adjust_btn: "Apply Stock Corrections Policy 🛠️",
    report_asset_eyebrow: "WAREHOUSE FINANCIAL ASSETS REPORT",
    report_asset_title: "Capital Valuation Report",
    report_asset_desc: "Total value estimations for the active stock stored inside this gym's physical depots.",
    text_total_cost_capital: "TOTAL INVESTMENT AT COST VALUE:",
    text_potential_revenue: "POTENTIAL SALES REVENUE AT RETAIL VALUE:",
    text_estimated_gross_profit: "POTENTIAL MARGIN ON LIQUIDATION:",
    report_category_eyebrow: "GROUP RATIO INDICES",
    report_category_title: "Depot Density Allocation",
    report_category_desc: "Stock levels allocation across product groups.",
    edit_product_title: "Edit Product Details",
    create_product_title: "Catalog New Product",
    warning_create_stock_zero: "⚠️ NOTICE: As mandated - cataloging a new product starts with stock equal to zero. Balance increases must be handled through purchase logs or manual workbench adjust tools.",
    prod_form_code: "Product SKU Code (e.g. PROD010)",
    prod_form_code_prompt: "System will auto-generate if empty...",
    prod_form_name: "Product Title Label *",
    prod_form_name_prompt: "Drink water, Protein Whey Gold...",
    prod_form_cat: "Designated Product Section",
    prod_form_unit: "Packing / Inventory Unit Mode",
    prod_form_cost: "Acquisition Cost Pricing *",
    prod_form_price: "Recommended Retail Price *",
    prod_form_min: "Minimum Guard Warning Level *",
    prod_form_status: "Sales Activity Status",
    prod_form_img: "Product Visual Graphic",
    img_not_uploaded: "No Graphic",
    img_select_btn: "Choose graphics file from device",
    img_desc_help: "Accepts digital PNG, JPG, JPEG formats under 2MB. Image will be stored directly on server.",
    btn_save: "Save Asset Profiles",
    supplier_name: "External Wholesale Vendor *",
    supplier_prompt: "E.g. FitNutrition Corp, Hydration Ltd",
    po_add_items_heading: "Select products categories to fill this order invoice",
    po_qty_label: "Purchased quantity",
    po_cost_label: "Actual order price at cost",
    po_add_btn: "Add Row",
    po_no_items_warning: "No product items included yet",
    po_summary: "SUMMARY REPORT OVERVIEW",
    po_creator: "Created by operator:",
    search_by_supplier: "Search PO code or wholesale partner...",
    alert_po_success: "Draft order compiled successfully! Check list and assign 'Ordered' status.",
    alert_po_items_empty: "Include at least one item list!",
    alert_adjust_success: "Adjustment finished successfully! Audit entries updated.",
    confirm_physical_intake_label: "Are you sure you want to register intake? 'Received' state will increment product stock balances and publish system changes instantly!",
    confirm_delete_po_label: "Are you sure you want to cancel and delete this draft order?",
    confirm_delete_prod_label: "Are you sure you want to permanently delete this product?",
    alert_cant_delete_product: "Could not remove this product detail.",
    alert_select_product: "Please select a product first!",
    alert_already_in_cart: "This product is already listed in the current list!",
    alert_input_supplier: "Supplier name cannot be empty!",
    alert_create_po_error: "Error occurred while creating draft purchase order.",
    alert_update_po_error: "Error maintaining purchase order status updates.",
    alert_cant_apply_adjust: "Unable to process stock adjustment corrections.",
    alert_cant_find_po_delete: "Specified purchase order not found for deletion.",
    po_status_draft: "Draft",
    po_status_ordered: "Ordered",
    po_status_received: "Received",
    po_status_cancelled: "Cancelled",
    sh_all_cat: "All Categories",
    sh_mọi_loại: "All",
    btn_close: "Close",
    btn_create_po_draft: "Create Draft Purchase Order",
    cart_empty: "No items added to current order list.",
    cart_po_items_header: "Products Currently Listed",
    status_active: "Active",
    status_inactive: "Inactive",
    supplier_label: "Supplier",
    date_label: "Date",
    operator_system: "system",
    unit_item: "items",
    adjust_default_reason: "Routine Inventory Check",
    prod_fallback: "Product",
    alert_field_required: "is required!",
    alert_failed: "Request failed!",
    alert_error_occurred: "An error occurred!",
    alert_delta_zero: "Adjustment quantity cannot be 0!"
  },
  zh: {
    system_subtitle: "健身房商品库存管理系统 // 自动审计机制",
    title_products: "产品列表",
    title_inventory: "商品库存",
    title_purchase: "采购订单",
    title_receive: "确认入库",
    title_history: "库存日志",
    title_adjust: "库存调节",
    title_report: "数据报表",
    add_new_product: "登记新产品",
    create_po: "新建采购订单",
    metric_sku: "商品款数 (SKU)",
    metric_total_stock: "累计总库存",
    metric_capital: "现有资产本金",
    metric_low_stock: "库存告急商品",
    loading_data: "正在载入商品库存数据...",
    all_categories: "所有大类",
    search_product_placeholder: "查找商品名称或SKU编码...",
    no_products_found: "没有匹配该筛选条件的商品。",
    retail_price: "零售售价:",
    cost_price: "进货成本:",
    current_stock_level: "现有库存:",
    low_stock_indicator: "缺货",
    btn_edit_title: "修改产品属性（不改变库存数值）",
    btn_delete_title: "永久移除",
    available_stock_records: "在库商品及警戒量盘查列表",
    search_by_name_code: "搜索产品名或编码...",
    all_types: "全部商品大类",
    th_code: "产品编码",
    th_name: "名称规格",
    th_category: "大类划分",
    th_unit: "结算单位",
    th_current_stock: "现有存量",
    th_min_stock: "安全下限",
    th_warning: "警戒状态",
    th_status: "业务状态",
    alert_reorder: "需紧急采购",
    alert_safe: "库存充足",
    no_placeholder_data: "暂无数据。",
    po_list_title: "健身房采购订单与进货清单总览",
    no_po_found: "还没有创建任何采购草稿或正式进货订单。",
    po_item_count: "已购特色分类项",
    mark_po_ordered: "确认发送并标记发布",
    cancel_and_delete_draft: "废弃并删除草稿",
    receive_physical_stock: "确认货物入库 📥",
    cancel_order: "废弃订单",
    success_received_at: "商品已顺利接收，于下列日期并入总库",
    physical_stock_intake_title: "采购商品实体点收及入库核销",
    physical_stock_intake_desc: "为维护系统总账的精确一致, 创建新产品卡片将默认库存为0。所有商品均需通过采购流程（状态为Ordered）在此处进行物理接收点收后，方可记入实际库存账册。",
    no_po_waiting: "当前没有需要确认入库（状态为Ordered）的采购订单。您可前往“采购订单”处新建或发送采购协议草稿。",
    waiting_intake: "待点收商品包",
    total_po_value: "进货总价 (元):",
    confirm_physical_intake_btn: "确认收到实物 - 增补存库并同步审计日志",
    detail_qty_intake: "点收单件明细清单:",
    po_order_quantity: "进货数",
    po_items_text: "件",
    po_unit_import_price: "采购进货单价:",
    audit_history_title: "全天候库存日志及可追溯财务合规变动表",
    reload_data_btn: "重新加载最新日志",
    th_time: "变动记录时间",
    th_action_type: "变动业务",
    th_change_qty: "变动额度",
    th_before_qty: "原始库存",
    th_after_qty: "调整后新绩",
    th_notes: "盘盈盘亏详细说明",
    th_operator: "操作人",
    log_import: "采购入库",
    log_export: "零售出货",
    log_adjust_inc: "盘点增益",
    log_adjust_dec: "折旧损耗",
    no_logs_found: "没有找到任何商品库存日志。",
    adjust_area_eyebrow: "🛠️ 物理库存偏差微调纠原控制台",
    adjust_form_title: "库存折损盘盈盈亏纠正调账单",
    adjust_form_desc: "由健身房前台及店长在定期盘点、货架破损、到期折损、或赠品试吃等物理清点与账面库存不一致时使用。调节将实时修正大库总存，并强制留下责任查处审计日志。",
    adjust_label_prod: "1. 选定拟调整商品",
    select_product_prompt: "点击选择拟调理的目标商品...",
    text_current_stock: "现存:",
    text_sys_current_stock: "系统账面当下存留总数:",
    adjust_delta_qty: "偏差数量偏差增减额",
    adjust_delta_prompt: "例如输入 -5 表示损耗 5 件，+3 表示多盘出 3 件...",
    adjust_delta_desc: "负数 (-) 减库存总数, 正数 (+) 加库存总数.",
    adjust_after_balance: "系统纠偏调账后最终库存额",
    adjust_label_reason: "2. 纠偏调账合理化释明原因",
    adjust_reason_prompt: "例：冰柜过期饮料清理1瓶，已按财务折旧销账 / 值班员交接漏盘损失已处罚...",
    apply_adjust_btn: "提交执行总账纠错调账指令 🛠️",
    report_asset_eyebrow: "财务大库资产估值核算报告",
    report_asset_title: "在库实物本金及价值盘查核算",
    report_asset_desc: "基于进价与售价对当前大库、各馆站所累积暂估商品库存的总价值汇总。",
    text_total_cost_capital: "在库实物本金总额 (原始成本):",
    text_potential_revenue: "库余预估零售销货总产额 (货架售价总估码):",
    text_estimated_gross_profit: "货架清仓售磬后可变毛利润 (暂估毛利):",
    report_category_eyebrow: "商品大类库存比例图",
    report_category_title: "大库各大类存留密度结构",
    report_category_desc: "当下现有大库中各类商品件数占总存量的比重关系。",
    edit_product_title: "修改产品档案属性",
    create_product_title: "录入配置商品到库信息",
    warning_create_stock_zero: "⚠️ 特别声明: 按照业务内控规则，在录入全新商品时, 其初始库存量将默认归零。您必须后续录入进货PO或在微调控制台进行资产注资方可注入库存量。",
    prod_form_code: "商品编码 SKU (例如 PROD010)",
    prod_form_code_prompt: "留空将由系统智能配给统一编码...",
    prod_form_name: "商品通用名称规格 *",
    prod_form_name_prompt: "例如: 冰镇功能性饮料, 金牌增肌乳清蛋白粉...",
    prod_form_cat: "选择分拨商品的类别组",
    prod_form_unit: "商品包装流通单位",
    prod_form_cost: "结算单价成本 (起价) *",
    prod_form_price: "统一零售面销定价 *",
    prod_form_min: "仓库安防水位配置 (最小下限) *",
    prod_form_status: "业务状态",
    prod_form_img: "产品关联主图照片",
    img_not_uploaded: "暂无图片",
    img_select_btn: "从本地计算机选择照片文件...",
    img_desc_help: "支持PNG、JPG、JPEG常见格式，文件限制在2MB以内。照片上传后保存在服务器本地。",
    btn_save: "保存产品配置",
    supplier_name: "外协配送供应商完整名称 *",
    supplier_prompt: "如：健康食品有限公司, 某某配送中心...",
    po_add_items_heading: "在此挑选要充实到本次订单的在库产品",
    po_qty_label: "进货数量",
    po_cost_label: "实收批发进价成本",
    po_add_btn: "添加新单列",
    po_no_items_warning: "尚未为当前单据配置具体的商品点件",
    po_summary: "采购总帐与支付单细节暂记",
    po_creator: "订单制单员:",
    search_by_supplier: "搜索PO协议号或外协供应商名称...",
    alert_po_success: "草稿进货单编制成功！请您核查细目并点击确认发出指令。",
    alert_po_items_empty: "订单内容不能为空，请先在下方挑选并添加商品入表！",
    alert_adjust_success: "库存纠偏调节成功！审计日志以及在库余额账本已成功合并更新。",
    confirm_physical_intake_label: "您确定要确认点收入库吗？'Received'状态将自动增补商品资产总量，并记入审计总账中！",
    confirm_delete_po_label: "确定要永久撤销并废除该草稿采购单据吗？",
    confirm_delete_prod_label: "您确定要永久移除该商品卡片吗？",
    alert_cant_delete_product: "无法删除指定的商品信息。",
    alert_select_product: "您必须先在挑拣栏选定拟购入的产品！",
    alert_already_in_cart: "该商品已加入本次清单中，不可重复录入！",
    alert_input_supplier: "供应商商号不可为空！",
    alert_create_po_error: "服务器处理或新建采购指令草稿时出错。",
    alert_update_po_error: "更新采购状态指令发生网络或数据库冲突。",
    alert_cant_apply_adjust: "对不起，无法执行对当前商品的库存调节纠正。",
    alert_cant_find_po_delete: "未在系统大库中检索到拟废弃的PO单据实例。",
    po_status_draft: "单据草稿",
    po_status_ordered: "已下发PO",
    po_status_received: "确认入库",
    po_status_cancelled: "已取消",
    sh_all_cat: "所有系列",
    sh_mọi_loại: "所有类别",
    btn_close: "关闭",
    btn_create_po_draft: "提交草稿PO清单",
    cart_empty: "本次采购单中尚未点录任何货品。",
    cart_po_items_header: "当前本单已录入商品",
    status_active: "活跃",
    status_inactive: "停用",
    supplier_label: "供应商",
    date_label: "日期",
    operator_system: "系统",
    unit_item: "件",
    adjust_default_reason: "定期库存盘点",
    prod_fallback: "商品",
    alert_field_required: "为必选/必填项！",
    alert_failed: "操作失败！",
    alert_error_occurred: "执行时发生错误！",
    alert_delta_zero: "调整数量不能为0！"
  }
};

const translateCategory = (cat: string, targetLang: string) => {
  const map: Record<string, Record<string, string>> = {
    "Thực phẩm bổ sung": { vi: "Thực phẩm bổ sung", en: "Supplements", zh: "膳食补充剂" },
    "Nước uống": { vi: "Nước uống", en: "Drinks & Hydration", zh: "饮品类" },
    "Phụ kiện": { vi: "Phụ kiện", en: "Accessories", zh: "配件类" },
    "Dụng cụ": { vi: "Dụng cụ", en: "Gear & Tools", zh: "健身器材" },
    "Khác": { vi: "Khác", en: "Others", zh: "其他" }
  };
  return map[cat]?.[targetLang] || cat;
};

const translateUnit = (unit: string, targetLang: string) => {
  const map: Record<string, Record<string, string>> = {
    "Hộp": { vi: "Hộp", en: "Box", zh: "盒" },
    "Chai": { vi: "Chai", en: "Bottle", zh: "瓶" },
    "Cái": { vi: "Cái", en: "Piece", zh: "件" },
    "Gói": { vi: "Gói", en: "Pack", zh: "包" },
    "Thùng": { vi: "Thùng", en: "Carton", zh: "箱" },
    "Đôi": { vi: "Đôi", en: "Pair", zh: "双" },
    "Hũ": { vi: "Hũ", en: "Tub", zh: "罐" }
  };
  return map[unit]?.[targetLang] || unit;
};

const translateProductName = (name: string, targetLang: string) => {
  const map: Record<string, Record<string, string>> = {
    "Găng tay tập gym": { vi: "Găng tay tập gym", en: "Gym Gloves", zh: "健身手套" },
    "Bình nước 1L": { vi: "Bình nước 1L", en: "Water Bottle 1L", zh: "1L 水壶" },
    "Nước suối Aquafina": { vi: "Nước suối Aquafina", en: "Aquafina Mineral Water", zh: "阿夸菲纳矿泉水" },
    "Sting dâu": { vi: "Sting dâu", en: "Sting Strawberry", zh: "草莓味Sting" },
    "Khăn lau mồ hôi": { vi: "Khăn lau mồ hôi", en: "Sweat Towel", zh: "运动吸汗毛巾" }
  };
  return map[name]?.[targetLang] || name;
};

interface WarehouseManagementProps {
  subTab: "products" | "inventory" | "purchase" | "receive" | "history" | "adjust" | "report";
  lang?: string;
}

export default function WarehouseManagement({ subTab, lang = "vi" }: WarehouseManagementProps) {
  const t = (key: string) => whTranslations[lang]?.[key] || whTranslations["vi"]?.[key] || key;

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
  const [adjustReason, setAdjustReason] = useState("");

  useEffect(() => {
    if (!adjustReason || adjustReason === "Kiểm kê định kỳ" || adjustReason === "Routine Inventory Check" || adjustReason === "定期库存盘点") {
      setAdjustReason(t("adjust_default_reason"));
    }
  }, [lang]);

  // Categories and units list (used in input forms)
  const categories = ["Thực phẩm bổ sung", "Nước uống", "Phụ kiện", "Dụng cụ", "Khác"];
  const units = ["Hộp", "Chai", "Cái", "Gói", "Thùng", "Đôi", "Hũ"];

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
      setErrorMsg(t("loading_data") + " (Failed)");
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
    if (!productForm.name.trim()) return alert(`${t("prod_form_name")} ${t("alert_field_required")}`);

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const payload = editingProduct 
        ? { ...productForm, id: editingProduct.id }
        : productForm;

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
        alert(data.message || t("alert_failed"));
      }
    } catch (err) {
      console.error(err);
      alert(t("alert_error_occurred"));
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm(t("confirm_delete_prod_label"))) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert(t("alert_cant_delete_product"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // PO handlers
  const handleAddPoItem = () => {
    if (selectedPoProductId === -1) return alert(t("alert_select_product"));
    const exists = poItems.some(item => item.productId === selectedPoProductId);
    if (exists) return alert(t("alert_already_in_cart"));

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
    if (!poSupplierName.trim()) return alert(t("alert_input_supplier"));
    if (poItems.length === 0) return alert(t("alert_po_items_empty"));

    const poDetails = poItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod?.name || t("prod_fallback"),
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
      status: "Draft",
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
        alert(t("alert_po_success"));
      } else {
        alert(t("alert_create_po_error"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatusPO = async (po: PurchaseOrder, newStatus: "Draft" | "Ordered" | "Received" | "Cancelled") => {
    if (newStatus === "Received" && !confirm(t("confirm_physical_intake_label"))) return;
    
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...po, status: newStatus })
      });

      if (res.ok) {
        fetchData();
      } else {
        alert(t("alert_update_po_error"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustProductId === -1) return alert(t("alert_select_product"));
    if (adjustChangeQty === 0) return alert(t("alert_delta_zero"));

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
        alert(t("alert_adjust_success"));
        setAdjustProductId(-1);
        setAdjustChangeQty(0);
        setAdjustReason(t("adjust_default_reason"));
        fetchData();
      } else {
        alert(t("alert_cant_apply_adjust"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePO = async (id: number) => {
    if (!confirm(t("confirm_delete_po_label"))) return;
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert(t("alert_cant_find_po_delete"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          translateProductName(p.name, lang).toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
            📦 {subTab === "products" ? t("title_products") : 
                subTab === "inventory" ? t("title_inventory") : 
                subTab === "purchase" ? t("title_purchase") : 
                subTab === "receive" ? t("title_receive") : 
                subTab === "history" ? t("title_history") : 
                subTab === "adjust" ? t("title_adjust") : t("title_report")}
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            {t("system_subtitle")}
          </p>
        </div>

        {subTab === "products" && (
          <button
            onClick={handleOpenNewProduct}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#CCFF00] text-black font-black text-sm uppercase group transition-all shrink-0 hover:bg-[#b0db00] shadow-[0_10px_20px_rgba(204,255,0,0.1)]"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            {t("add_new_product")}
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
            {t("create_po")}
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
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-semibold">{t("metric_sku")}</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black italic">{totalSkuCount}</span>
            <Database className="w-4 h-4 text-zinc-600" />
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-semibold">{t("metric_total_stock")}</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black italic">{totalStockItemsCount}</span>
            <Box className="w-4 h-4 text-[#CCFF00]" />
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-semibold">{t("metric_capital")}</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-black text-[#CCFF00] font-mono">
              {totalInventoryCapital.toLocaleString(lang === "vi" ? "vi-VN" : "en-US")}đ
            </span>
            <DollarSign className="w-4 h-4 text-zinc-500" />
          </div>
        </div>

        <div className="bg-red-950/20 border border-red-500/10 p-4 rounded-2xl flex flex-col justify-between">
          <p className="text-xs font-mono text-red-500 uppercase tracking-widest font-semibold">{t("metric_low_stock")}</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-2xl font-black italic ${lowStockProducts.length > 0 ? "text-red-500 animate-pulse" : "text-zinc-400"}`}>
              {lowStockProducts.length}
            </span>
            <AlertTriangle className={`w-4 h-4 ${lowStockProducts.length > 0 ? "text-red-500" : "text-zinc-600"}`} />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-12 text-zinc-500 italic gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          {t("loading_data")}
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
                    placeholder={t("search_product_placeholder")}
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
                    <option value="all">{t("all_categories")}</option>
                    {categories.map(c => <option key={c} value={c}>{translateCategory(c, lang)}</option>)}
                  </select>
                </div>
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 italic border border-dashed border-white/5 rounded-2xl">
                  {t("no_products_found")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(p => (
                    <div 
                      key={p.id} 
                      className={`bg-zinc-900/40 p-5 rounded-2xl border ${p.stock <= p.minStock ? "border-amber-500/30" : "border-white/5"} flex flex-col justify-between hover:border-white/20 transition-all`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-neutral-800 shrink-0 overflow-hidden border border-white/5 flex items-center justify-center text-zinc-700">
                          {p.image ? (
                            <img src={p.image} alt={translateProductName(p.name, lang)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Package className="w-8 h-8" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] bg-white/5 text-zinc-400 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {p.code}
                          </span>
                          <h4 className="text-base font-bold text-white mt-1 truncate">{translateProductName(p.name, lang)}</h4>
                          <p className="text-xs text-zinc-500 mt-0.5">{translateCategory(p.category, lang)} // {t("th_unit")}: {translateUnit(p.unit, lang)}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <p className="text-zinc-500">{t("retail_price")}</p>
                          <p className="font-bold text-[#CCFF00]">{p.price.toLocaleString()}đ</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">{t("cost_price")}</p>
                          <p className="font-bold text-zinc-300">{p.importPrice.toLocaleString()}đ</p>
                        </div>
                        <div className="col-span-2 mt-1">
                          <p className="text-zinc-500">{t("current_stock_level")}</p>
                          <p className={`font-bold flex items-center gap-1.5 ${p.stock <= p.minStock ? "text-amber-400 font-bold" : "text-zinc-300"}`}>
                            {p.stock} {translateUnit(p.unit, lang)}
                            {p.stock <= p.minStock && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 flex items-center gap-1 font-semibold uppercase font-sans">
                                <AlertTriangle className="w-2.5 h-2.5" /> {t("low_stock_indicator")}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-2.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                          title={t("btn_edit_title")}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2.5 rounded-lg bg-red-950/20 text-red-400/80 hover:text-red-400 hover:bg-red-950/40 transition-all"
                          title={t("btn_delete_title")}
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
                <span className="text-sm font-mono text-zinc-400">{t("available_stock_records")}</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("search_by_name_code")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-xs focus:outline-none focus:border-[#CCFF00]/40"
                  />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-xs focus:outline-none"
                  >
                    <option value="all">{t("sh_mọi_loại")}</option>
                    {categories.map(c => <option key={c} value={c}>{translateCategory(c, lang)}</option>)}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-zinc-900 border-b border-white/5 text-zinc-400 text-[10px] font-mono uppercase tracking-wider">
                    <tr>
                      <th className="p-4">{t("th_code")}</th>
                      <th className="p-4">{t("th_name")}</th>
                      <th className="p-4">{t("th_category")}</th>
                      <th className="p-4">{t("th_unit")}</th>
                      <th className="p-4 text-right">{t("th_current_stock")}</th>
                      <th className="p-4 text-center">{t("th_min_stock")}</th>
                      <th className="p-4 text-center">{t("th_warning")}</th>
                      <th className="p-4 text-center">{t("th_status")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {filteredProducts.map(p => (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-white/[0.02] transition-colors ${p.stock <= p.minStock ? "bg-red-950/5" : ""}`}
                      >
                        <td className="p-4 font-mono font-bold text-[#CCFF00]">{p.code}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{translateProductName(p.name, lang)}</div>
                        </td>
                        <td className="p-4 text-zinc-400">{translateCategory(p.category, lang)}</td>
                        <td className="p-4 text-zinc-400">{translateUnit(p.unit, lang)}</td>
                        <td className={`p-4 text-right font-black font-mono text-base ${p.stock <= p.minStock ? "text-red-400" : "text-white"}`}>
                          {p.stock}
                        </td>
                        <td className="p-4 text-center font-mono text-zinc-500">{p.minStock}</td>
                        <td className="p-4 text-center">
                          {p.stock <= p.minStock ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/40 border border-red-500/20 text-red-500 text-[10px] font-black uppercase font-mono tracking-tighter">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {t("alert_reorder")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px] font-bold">
                              {t("alert_safe")}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${p.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"}`}>
                            {p.status === "Active" ? t("status_active") : t("status_inactive")}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-zinc-500 italic">
                          {t("no_placeholder_data")}
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
                <h3 className="text-sm font-mono text-zinc-400 mb-4 uppercase">{t("po_list_title")}</h3>
                
                {purchaseOrders.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 italic">
                    {t("no_po_found")}
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
                                {po.status === "Draft" ? t("po_status_draft") : 
                                 po.status === "Ordered" ? t("po_status_ordered") : 
                                 po.status === "Received" ? t("po_status_received") : t("po_status_cancelled")}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">
                              <strong>{t("supplier_label")}:</strong> {po.supplierName} // {t("date_label")}: {po.orderDate}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zinc-500 uppercase font-mono">{t("total_po_value")}</p>
                            <p className="text-lg font-black font-mono text-white mt-0.5">
                              {po.totalAmount.toLocaleString()}đ
                            </p>
                          </div>
                        </div>

                        {/* Order items expander preview */}
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-xs font-bold text-zinc-400 mb-2">{t("po_item_count")} ({po.items.length}):</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {po.items.map((item, idx) => (
                              <div key={idx} className="bg-black/20 p-2.5 rounded border border-white/5 flex justify-between items-center">
                                <span className="font-semibold text-zinc-300">
                                  {translateProductName(item.productName, lang)} <span className="text-[10px] ml-1 text-zinc-500 font-mono">({item.productCode})</span>
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
                                {t("mark_po_ordered")}
                              </button>
                              <button
                                onClick={() => handleDeletePO(po.id)}
                                className="px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-500/15 text-red-400 text-xs font-bold uppercase transition-all hover:bg-red-950/40"
                              >
                                {t("cancel_and_delete_draft")}
                              </button>
                            </>
                          )}

                          {po.status === "Ordered" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatusPO(po, "Received")}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-black uppercase tracking-wider hover:bg-[#b0db00]"
                              >
                                {t("receive_physical_stock")}
                              </button>
                              <button
                                onClick={() => handleUpdateStatusPO(po, "Cancelled")}
                                className="px-3 py-1.5 rounded-lg bg-zinc-850 text-zinc-400 text-xs font-bold uppercase hover:bg-zinc-800"
                              >
                                {t("cancel_order")}
                              </button>
                            </>
                          )}
                          
                          {po.status === "Received" && po.receivedDate && (
                            <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 italic">
                              <CheckCircle2 className="w-4 h-4 shrink-0" /> {t("success_received_at")} {po.receivedDate}
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
                <span className="text-sm font-mono text-zinc-400 uppercase">{t("physical_stock_intake_title")}</span>
                <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
                  {t("physical_stock_intake_desc")}
                </p>

                <div className="mt-6 space-y-4">
                  {purchaseOrders.filter(po => po.status === "Ordered").length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 italic border border-dashed border-white/5 rounded-xl">
                      {t("no_po_waiting")}
                    </div>
                  ) : (
                    purchaseOrders.filter(po => po.status === "Ordered").map(po => (
                      <div key={po.id} className="p-5 rounded-xl border border-sky-500/10 bg-sky-950/5">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <p className="text-zinc-500 text-xs font-mono">{t("waiting_intake")}</p>
                            <h4 className="text-base font-bold text-white mt-1">{po.orderCode} // {t("supplier_label")}: {po.supplierName}</h4>
                            <p className="text-xs text-zinc-400 mt-1">{t("total_po_value")} <strong>{po.totalAmount.toLocaleString()}đ</strong></p>
                          </div>
                          <button
                            onClick={() => handleUpdateStatusPO(po, "Received")}
                            className="px-4 py-2.5 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#b0db00] shadow-md shrink-0"
                          >
                            <ArrowDown className="w-4 h-4" /> {t("confirm_physical_intake_btn")}
                          </button>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-white/5 text-xs text-zinc-400">
                          <p className="font-semibold text-zinc-300">{t("detail_qty_intake")}</p>
                          <ul className="mt-2 space-y-1 pl-4 list-disc">
                            {po.items.map((it, idx) => (
                              <li key={idx}>
                                {translateProductName(it.productName, lang)} ({it.productCode}): {t("po_order_quantity")} <strong>{it.quantity}</strong> {t("po_items_text")} - {t("po_unit_import_price")} {it.importPrice.toLocaleString()}đ
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
                <span className="text-sm font-mono text-zinc-400">{t("audit_history_title")}</span>
                <button
                  onClick={fetchData}
                  className="p-1 px-3.5 py-1.5 rounded bg-white/5 border border-white/5 text-xs font-bold text-zinc-300 hover:text-white"
                >
                  {t("reload_data_btn")}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-zinc-900 border-b border-white/5 text-zinc-400 text-[10px] font-mono uppercase tracking-wider">
                    <tr>
                      <th className="p-4">{t("th_time")}</th>
                      <th className="p-4">{t("th_code")}</th>
                      <th className="p-4">{t("th_name")}</th>
                      <th className="p-4 text-center">{t("th_action_type")}</th>
                      <th className="p-4 text-right">{t("th_change_qty")}</th>
                      <th className="p-4 text-right">{t("th_before_qty")}</th>
                      <th className="p-4 text-right">{t("th_after_qty")}</th>
                      <th className="p-4">{t("th_notes")}</th>
                      <th className="p-4 text-center">{t("th_operator")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px] md:text-xs">
                    {history.map((h) => {
                      const formattedDate = new Date(h.date).toLocaleString(lang === "vi" ? "vi-VN" : "en-US", {
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
                          <td className="p-4 text-zinc-200 truncate max-w-xs font-sans font-semibold">{translateProductName(h.productName, lang)}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${
                              h.type === "IMPORT" ? "bg-emerald-500/10 text-emerald-500" :
                              h.type === "EXPORT" ? "bg-amber-500/10 text-amber-500" :
                              h.type === "ADJUST_INC" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                            }`}>
                              {h.type === "IMPORT" ? t("log_import") :
                               h.type === "EXPORT" ? t("log_export") :
                               h.type === "ADJUST_INC" ? t("log_adjust_inc") : t("log_adjust_dec")}
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
                          <td className="p-4 text-center text-zinc-500">{h.createdBy || t("operator_system")}</td>
                        </tr>
                      );
                    })}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-zinc-500 italic">
                          {t("no_logs_found")}
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
              <span className="text-xs text-[#CCFF00] font-mono uppercase tracking-widest font-bold">{t("adjust_area_eyebrow")}</span>
              <h3 className="text-xl font-bold mt-2">{t("adjust_form_title")}</h3>
              <p className="text-xs text-zinc-500 mt-1">
                {t("adjust_form_desc")}
              </p>

              <form onSubmit={handleAdjustmentSubmit} className="mt-6 space-y-4 text-sm">
                <div>
                  <label className="block text-zinc-400 font-bold mb-2">{t("adjust_label_prod")}</label>
                  <select
                    value={adjustProductId}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setAdjustProductId(id);
                      setAdjustChangeQty(0);
                    }}
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none"
                    required
                  >
                    <option value="">{t("select_product_prompt")}</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {translateProductName(p.name, lang)} ({p.code}) - {t("text_current_stock")} {p.stock} {translateUnit(p.unit, lang)}
                      </option>
                    ))}
                  </select>
                </div>

                {adjustProductId !== -1 && (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                    <p className="text-xs text-zinc-400">
                      {t("text_sys_current_stock")} <strong>{products.find(p => p.id === adjustProductId)?.stock} {translateUnit(products.find(p => p.id === adjustProductId)?.unit || "Cái", lang)}</strong>
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-400 font-bold mb-2">{t("adjust_delta_qty")}</label>
                        <input
                          type="number"
                          value={adjustChangeQty}
                          onChange={(e) => setAdjustChangeQty(Number(e.target.value))}
                          placeholder={t("adjust_delta_prompt")}
                          className="w-full p-3 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-[#CCFF00]"
                          required
                        />
                        <span className="text-[10px] text-zinc-500 mt-1 block">{t("adjust_delta_desc")}</span>
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-bold mb-2">{t("adjust_after_balance")}</label>
                        <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 font-mono font-bold text-lg text-white">
                          {Math.max(0, (products.find(p => p.id === adjustProductId)?.stock || 0) + adjustChangeQty)} {translateUnit(products.find(p => p.id === adjustProductId)?.unit || "Cái", lang)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-zinc-400 font-bold mb-2">{t("adjust_label_reason")}</label>
                  <textarea
                    rows={3}
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder={t("adjust_reason_prompt")}
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-[#CCFF00]"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full p-3.5 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b0db00] shadow-md"
                  >
                    {t("apply_adjust_btn")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================= TAB: REPORT ======================= */}
          {subTab === "report" && (
            <div className="space-y-6">
              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="warehouse-report-grid">
                
                {/* Valuations Card */}
                <div className="bg-zinc-900/20 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#CCFF00] font-black uppercase tracking-widest block">{t("report_asset_eyebrow")}</span>
                    <h3 className="text-lg font-bold text-white mt-1">{t("report_asset_title")}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{t("report_asset_desc")}</p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="p-3 bg-zinc-950 rounded-xl border border-white/5">
                      <p className="text-zinc-500 text-[10px] font-mono">{t("text_total_cost_capital")}</p>
                      <p className="text-xl font-bold font-mono text-[#CCFF00] mt-1">{totalInventoryCapital.toLocaleString()}đ</p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-xl border border-white/5">
                      <p className="text-zinc-500 text-[10px] font-mono">{t("text_potential_revenue")}</p>
                      <p className="text-xl font-bold font-mono text-white mt-1">{totalPotentialRevenue.toLocaleString()}đ</p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-xl border border-white/5">
                      <p className="text-zinc-500 text-[10px] font-mono">{t("text_estimated_gross_profit")}</p>
                      <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{(totalPotentialRevenue - totalInventoryCapital).toLocaleString()}đ</p>
                    </div>
                  </div>
                </div>

                {/* Subcategory split Visual widget */}
                <div className="bg-zinc-900/20 border border-white/5 p-6 rounded-2xl col-span-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#CCFF00] font-black uppercase tracking-widest block">{t("report_category_eyebrow")}</span>
                    <h3 className="text-lg font-bold text-white mt-1">{t("report_category_title")}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{t("report_category_desc")}</p>
                  </div>

                  <div className="mt-6 space-y-4 flex-1 flex flex-col justify-center">
                    {categories.map(cat => {
                      const catProducts = products.filter(p => p.category === cat);
                      const catStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
                      const pct = totalStockItemsCount > 0 ? (catStock / totalStockItemsCount) * 105 : 0;

                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-zinc-400 font-bold">{translateCategory(cat, lang)}</span>
                            <span className="text-zinc-500">{catStock} {t("unit_item")} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="bg-[#CCFF00] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================= MODAL: CREATE / EDIT PRODUCT ======================= */}
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
                  {editingProduct ? t("edit_product_title") : t("create_product_title")}
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
                  {t("warning_create_stock_zero")}
                </p>
              )}

              <form onSubmit={handleProductSubmit} className="space-y-4 text-xs md:text-sm text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">{t("prod_form_code")}</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-neutral-900 border border-white/10 text-white font-mono focus:outline-none"
                      placeholder={t("prod_form_code_prompt")}
                      value={productForm.code}
                      onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">{t("prod_form_name")}</label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-[#CCFF00]"
                      placeholder={t("prod_form_name_prompt")}
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">{t("prod_form_cat")}</label>
                    <select
                      className="w-full p-2.5 rounded bg-neutral-900 border border-white/10 text-white text-xs focus:outline-none"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      {categories.map(c => <option key={c} value={c}>{translateCategory(c, lang)}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">{t("prod_form_unit")}</label>
                    <select
                      className="w-full p-2.5 rounded bg-neutral-900 border border-white/10 text-white text-xs focus:outline-none"
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    >
                      {units.map(u => <option key={u} value={u}>{translateUnit(u, lang)}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono">
                  <div>
                    <label className="block text-zinc-400 font-sans font-bold mb-1 col-span-1">{t("prod_form_cost")}</label>
                    <input
                      type="number"
                      className="w-full p-2 rounded bg-neutral-900 border border-white/10 text-white"
                      value={productForm.importPrice}
                      onChange={(e) => setProductForm({ ...productForm, importPrice: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-sans font-bold mb-1">{t("prod_form_price")}</label>
                    <input
                      type="number"
                      className="w-full p-2 rounded bg-neutral-900 border border-white/10 text-white"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-sans font-bold mb-1">{t("prod_form_min")}</label>
                    <input
                      type="number"
                      className="w-full p-2 rounded bg-neutral-900 border border-white/10 text-white"
                      value={productForm.minStock}
                      onChange={(e) => setProductForm({ ...productForm, minStock: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                {editingProduct && (
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">{t("prod_form_status")}</label>
                    <select
                      className="w-full p-2.5 rounded bg-neutral-900 border border-white/10 text-white text-xs focus:outline-none"
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                    >
                      <option value="Active">{t("status_active")}</option>
                      <option value="Inactive">{t("status_inactive")}</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-zinc-400 font-bold mb-1">{t("prod_form_img")}</label>
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-zinc-600 overflow-hidden shrink-0">
                      {productForm.image ? (
                        <img src={productForm.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-zinc-500">{t("img_not_uploaded")}</span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <input 
                        type="file" 
                        accept="image/*"
                        id="product-image-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProductForm({ ...productForm, image: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label 
                        htmlFor="product-image-upload"
                        className="px-4 py-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white font-bold text-xs cursor-pointer inline-block"
                      >
                        {t("img_select_btn")}
                      </label>
                      <p className="text-[10px] text-zinc-500 mt-1">{t("img_desc_help")}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded bg-zinc-900 text-zinc-400 font-semibold text-xs uppercase"
                  >
                    {t("btn_close")}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-[#CCFF00] text-black font-black text-xs uppercase shadow-md"
                  >
                    {t("btn_save")}
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
                  {t("create_po")}
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
                  <label className="block text-zinc-400 font-bold mb-1">{t("supplier_name")}</label>
                  <input
                    type="text"
                    placeholder={t("supplier_prompt")}
                    className="w-full p-2.5 rounded bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-[#CCFF00]"
                    value={poSupplierName}
                    onChange={(e) => setPoSupplierName(e.target.value)}
                    required
                  />
                </div>

                {/* Local Cart items helper inside PO */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                  <h4 className="font-bold text-zinc-300">{t("po_add_items_heading")}:</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">{t("select_product_prompt")}</label>
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
                        <option value="-1">{t("select_product_prompt")}</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {translateProductName(p.name, lang)} ({p.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">{t("po_qty_label")}</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 rounded bg-neutral-950 border border-white/10 text-white"
                        value={selectedPoQty}
                        onChange={(e) => setSelectedPoQty(Math.max(1, Number(e.target.value)))}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">{t("po_cost_label")}</label>
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
                    {t("po_add_btn")}
                  </button>
                </div>

                {/* Selected Basket PO items list */}
                <div>
                  <h4 className="font-bold text-zinc-300 mb-2">{t("cart_po_items_header")} ({poItems.length}):</h4>
                  {poItems.length === 0 ? (
                    <p className="text-zinc-500 italic text-xs">{t("cart_empty")}</p>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                      {poItems.map((item, index) => {
                        const prod = products.find(p => p.id === item.productId);
                        return (
                          <div key={index} className="p-2 bg-neutral-900 border border-white/5 rounded flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-200">
                              {translateProductName(prod?.name || "", lang)} ({prod?.code})
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
                    {t("po_summary")}: <span className="text-[#CCFF00] text-base">
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
                    {t("btn_close")}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-[#CCFF00] text-black font-black uppercase"
                  >
                    {t("btn_create_po_draft")}
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
