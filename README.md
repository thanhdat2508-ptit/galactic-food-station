# GALACTIC FOOD STATION — ẨM THỰC NGÂN HÀ (3D BOOTH DESIGNER)

Ứng dụng web tương tác 3D (WebGL / Three.js) mô phỏng kiến trúc, kết cấu, quy trình lắp dựng 9 giai đoạn và dự toán vật tư cho gian hàng hội trại ẩm thực sinh viên **PTIT × STR4.SEC × An toàn thông tin D26**.

---

## 1. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
galactic-food-station/
├── index.html                        # Giao diện chính của ứng dụng 3D Booth Designer
├── style.css                         # Hệ thống giao diện chủ đề Vũ trụ & Công nghệ (#071B45, #00CFFF, #FFD85A)
├── main.js                           # Điều phối Three.js, OrbitControls, Raycasting, Blueprint 2D & Xuất dữ liệu
├── layout.js                         # Bộ máy hình học tham số (tính toán tọa độ & kích thước mọi cấu kiện)
├── booth.js                          # Dựng mô hình 3D chi tiết cao, vật liệu tre có đốt, LED & 4 Logo gốc
├── construction.js                   # Hệ thống mô phỏng thi công 9 giai đoạn (GĐ0 → GĐ8) với hoạt ảnh thực
├── materials.js                      # Dự toán vật tư (BOM), tối ưu cắt cây nguyên 1D & xuất CSV
├── assets/
│   ├── ptit.png                      # Logo PTIT gốc
│   ├── str4sec.png                   # Logo STR4.SEC gốc
│   ├── d26.png                       # Logo An toàn thông tin D26 gốc
│   ├── doan.png                      # Logo Đoàn Thanh niên gốc
│   └── ban-ve-goc.png                # Bản vẽ thiết kế tham chiếu ban đầu
├── lib/
│   └── three/                        # Thư viện Three.js v0.160.0 & Addons (chạy offline 100%, không cần mạng)
├── HUONG_DAN_THI_CONG_GIAN_HANG.md   # Cẩm nang hướng dẫn thi công thực tế 15 mục cho sinh viên
└── README.md                         # Hướng dẫn cài đặt và sử dụng
```

---

## 2. HƯỚNG DẪN CHẠY DỰ ÁN TRÊN MÁY TÍNH (LOCAL SERVER)

Do trình duyệt hiện đại áp dụng chính sách bảo mật CORS đối với ES Modules (`<script type="module">`) và tải texture WebGL, bạn cần chạy dự án qua một Local HTTP Server:

### Cách 1: Sử dụng Python 3 (Khuyến nghị – có sẵn trên macOS / Linux / Windows)

Mở Terminal tại thư mục `galactic-food-station/` và chạy:

```bash
cd "galactic-food-station"
python3 -m http.server 8000
```

Sau đó mở trình duyệt (Chrome, Edge, Safari, Firefox) và truy cập:
👉 **http://localhost:8000**

### Cách 2: Sử dụng Node.js (`npx serve`)

```bash
cd "galactic-food-station"
npx serve -l 8000
```

### Cách 3: Sử dụng VS Code Live Server
Mở thư mục `galactic-food-station` trong VS Code, nhấp chuột phải vào `index.html` và chọn **"Open with Live Server"**.

---

## 3. TÍNH NĂNG NỔI BẬT

1. **Quan sát & Tương tác 3D 360°:**
   - Giữ chuột trái xoay 360°, chuột phải di chuyển (pan), con lăn thu phóng (zoom).
   - 8 nút chuyển góc nhìn nhanh: `FRONT`, `BACK`, `LEFT`, `RIGHT`, `TOP`, `ISOMETRIC`, `DƯỚI MÁI / SAU QUẦY` và `RESET CAMERA`.
   - Click trực tiếp vào bất kỳ thanh tre, chân đế, bảng hiệu, ngôi sao... để xem thông số kỹ thuật, vai trò kết cấu và cách lắp đặt.
2. **Tùy chỉnh Tham số Thời gian thực:**
   - Thay đổi chiều ngang (`2,0–4,5 m`), chiều sâu (`1,5–3,0 m`), chiều cao (`2,3–3,2 m`), chiều cao và chiều sâu quầy.
   - Chuyển đổi 4 loại vật liệu: **Tre tự nhiên**, **Tre sơn phủ PU**, **Gỗ keo xẻ**, **Ống PVC giả tre**.
   - Bật/tắt riêng biệt từng nhóm cấu kiện, từng bảng Logo, ẩn mái/ẩn bảng hiệu, xem khung dây (Wireframe), thước đo 3D và chế độ **Ban ngày / Ban đêm**.
   - Hỗ trợ **Upload thay thế từng Logo** (`PTIT`, `STR4.SEC`, `D26`, `Đoàn TN`) trực tiếp từ máy tính và chỉnh kích thước không làm méo tỷ lệ.
3. **Chế độ Thi công (`CONSTRUCTION MODE` – 9 Giai đoạn `GĐ0` → `GĐ8`):**
   - Hoạt ảnh lắp dựng hình học 3D thực tế: khảo sát mặt bằng, đặt chân đế xô bê tông, xoay dựng cột đứng, lắp xà & giằng chữ X, rải nan mái, đóng quầy tre, treo bảng hiệu và giăng đèn LED.
4. **Dự toán Vật tư (`MATERIALS`) & Bản vẽ Kỹ thuật (`BLUEPRINT`) & Xuất (`EXPORT`):**
   - Tự động tính số cây nguyên cần mua bằng thuật toán ghép thanh 1D, cho phép sửa đơn giá VND, cảnh báo vượt ngân sách, xuất CSV, xuất bản vẽ PNG và xuất mô hình 3D `.glb`.
