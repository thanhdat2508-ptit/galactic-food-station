# HƯỚNG DẪN THI CÔNG NGOÀI ĐỜI THỰC — GIAN HÀNG 3D "GALACTIC FOOD STATION (ẨM THỰC NGÂN HÀ)"

> **Đơn vị thực hiện:** Sinh viên Khoa An toàn thông tin D26 — STR4.SEC — Học viện Công nghệ Bưu chính Viễn thông (PTIT)  
> **Tài liệu kỹ thuật đồng bộ 100% với ứng dụng mô phỏng 3D (`index.html`, `layout.js`, `booth.js`, `construction.js`, `materials.js`)**

---

## 1. TỔNG QUAN THIẾT KẾ

**Galactic Food Station – Ẩm Thực Ngân Hà** là phương án thiết kế gian hàng hội trại ẩm thực kết hợp hài hòa giữa:
1. **Kết cấu tre truyền thống Việt Nam:** Hệ khung cột, xà ngang, thanh giằng chéo, mái giàn pergola thoáng đãng và quầy phục vụ ốp nan tre dọc mộc mạc.
2. **Bản sắc Công nghệ & An toàn thông tin (PTIT × STR4.SEC × ATTT D26):** Hệ thống 4 bảng hiệu nhận diện chuẩn logo gốc cùng các chi tiết khiên bảo mật, ổ khóa mã hóa, dải nhị phân `0–1` và bảng mạch điện tử.
3. **Không gian Vũ trụ – Ngân hà:** Hệ ngôi sao tre 3D phát sáng ấm treo bằng dây cước dưới mái, mô hình hành tinh kèm vòng quỹ đạo PVC, biển đám mây *"Ẩm thực Ngân hà"* phía trước quầy và hệ thống đèn LED xanh công nghệ (`#00CFFF`) kết hợp vàng ngôi sao (`#FFD85A`).

### Thông số hình học tiêu chuẩn (mặc định trên mô hình 3D)
- **Chiều ngang khung (W):** `3,00 m` (mái đua ra mỗi bên `0,20 m` → tổng ngang mái `3,40 m`).
- **Chiều sâu khung (D):** `2,00 m` (nan mái đua trước/sau `0,15 m` → tổng sâu mái `2,30 m`).
- **Chiều cao tổng thể (H):** `2,60 m` (đỉnh cột góc `2,415 m`, cao độ xà đầu cột `2,365 m`, cao độ xà đỡ bảng hiệu `1,815 m`, tĩnh không dưới bảng hiệu `1,78 m`).
- **Quầy phục vụ:** Cao `0,85 m`, sâu `0,60 m`, dài `2,32 m` (chừa `0,45 m` bên phải đặt tủ ngăn kéo và lối nhân viên ra vào).
- **Lối thao tác nhân viên bên trong:** Rộng `0,65 m` giữa mặt sau quầy và bàn gấp sơ chế.

---

## 2. KÍCH THƯỚC TỪNG CẤU KIỆN (BẢNG CẮT CHI TIẾT CHO KÍCH THƯỚC 3,0 × 2,0 × 2,6 M)

| Mã nhóm | Tên cấu kiện trên mô hình 3D | Tiết diện (Tre chuẩn) | Chiều dài cắt | Số lượng | Vị trí & Công đoạn |
|---|---|---|---|---|---|
| **A1** | Cột góc chính `C1, C2, C3, C4` | Tre đực Ø8–10 cm | `2,36 m` | 04 thanh | GĐ2 · 4 góc khung chính |
| **A2** | Cột giữa phía sau `C5` | Tre đực Ø8–10 cm | `2,43 m` | 01 thanh | GĐ2 · Giữa nhịp khung sau |
| **B1** | Xà dọc đỉnh cột (trái & phải) | Tre Ø6–8 cm | `2,15 m` | 02 thanh | GĐ3 · Nối đỉnh cột trước – sau |
| **B2** | Xà ngang đầu cột (trước & sau) | Tre Ø6–8 cm | `3,03 m` | 02 thanh | GĐ3 · Cao độ `2,365 m` |
| **B3** | Xà đỡ bảng hiệu mặt trước | Tre Ø6–8 cm | `3,03 m` | 01 thanh | GĐ3 · Cao độ `1,815 m` |
| **B4** | Xà ngang giữa & Giằng chân vách sau | Tre Ø6–8 cm | `3,03 m` | 02 thanh | GĐ3 · Cao độ `1,20 m` & `0,42 m` |
| **B5** | Xà ngang giữa & Giằng chân vách trái | Tre Ø6–8 cm | `2,03 m` | 02 thanh | GĐ3 · Cao độ `1,815 m` & `0,42 m` |
| **B6** | Đòn tay đỡ mái (trước, giữa, sau) | Tre Ø6–8 cm | `3,31 m` | 03 thanh | GĐ4 · Đua 2 bên hông `20 cm` |
| **C1** | Thanh chống góc 45° (knee brace) | Tre Ø4–5 cm | `0,64 m` | 10 thanh | GĐ3 · Gia cố góc cột – xà |
| **C2** | Giằng chéo chữ X (vách trái & 2 khoang sau) | Tre Ø4–5 cm | `2,32 m` | 06 thanh | GĐ3 · Chống biến hình ngang |
| **C3** | Nan tre mái song song | Tre Ø4–5 cm | `2,21 m` | 28 thanh | GĐ4 · Rải đều bước `12,1 cm` |
| **C4** | Chân đứng khung quầy | Tre Ø4–5 cm | `0,82 m` | 08 thanh | GĐ5 · 4 cặp chân trước – sau |
| **C5** | Đà ngang dọc quầy & Nẹp kẹp nan | Tre Ø4–5 cm | `2,32 m` | 06 thanh | GĐ5 · Đỡ mặt quầy, kệ & kẹp nan |
| **C6** | Đà ngang hông quầy | Tre Ø4–5 cm | `0,45 m` | 02 thanh | GĐ5 · Khóa khung hông quầy |
| **D1** | Nan tre dọc ốp mặt trước & hông quầy | Tre nan Ø3–4 cm | `0,80 m` | 50 thanh | GĐ5 · 42 nan trước + 8 nan hông |

---

## 3. DANH SÁCH VẬT LIỆU TỔNG HỢP (DỰ TOÁN SINH VIÊN)

1. **Vật liệu khung & mái (mua theo cây nguyên 4,0 m):**
   - Tre đực Ø8–10 cm (Nhóm A): **05 cây 4m**
   - Tre Ø6–8 cm (Nhóm B – xà + đòn tay): **10 cây 4m**
   - Tre Ø4–5 cm (Nhóm C – giằng, nan mái, khung quầy): **26 cây 4m**
   - Tre nan Ø3–4 cm (Nhóm D – nan ốp quầy): **10 cây 4m**
2. **Chân đế & phụ kiện liên kết:**
   - **05 vỏ xô nhựa 18–20L** (tận dụng vỏ thùng sơn cũ) + **05 đoạn ống PVC Ø114** dài `35 cm` + cát, đá mi, xi măng đổ bê tông mác thấp.
   - **10 bao cát gia tải** (`~15 kg/bao`) + 1 cuộn băng keo phản quang vàng-đen.
   - **38 bộ bu lông M8×150 mm** + 76 long đền phẳng + 38 ê cu M8.
   - **02 cuộn dây mây nhựa / dây đay** (50m/cuộn) + **03 bịch dây rút nhựa 30 cm** (100 sợi/bịch).
3. **Vật liệu quầy & bảng hiệu:**
   - **01 tấm ván ép 12–15 mm** khổ `1,22 × 2,44 m` (cắt mặt quầy `2,32 × 0,60 m` và kệ dưới `2,30 × 0,48 m`).
   - **01 tấm Foam/Format 5 mm** (`1,2 × 2,4 m`) làm 4 bảng Logo & icon bảo mật.
   - **01 tấm Foam 10 mm** (`0,8 × 1,8 m`) cắt biển đám mây *"Ẩm thực Ngân hà"*.
   - **01 tấm Mica trong 2 mm** phủ bóng mặt bảng `STR4.SEC`, `D26` và gấp kệ Menu A5.
   - **03 m² Decal PP ngoài trời cán bóng** (in nguyên bản 4 file logo gốc: `ptit.png`, `str4sec.png`, `d26.png`, `doan.png`, biển mây và dải nhị phân `0–1`).
   - **05 m² Bạt Hiflex / bạt lưới Mesh** in phông nền dải ngân hà (`2,80 × 1,82 m`).
4. **Trang trí vũ trụ & hệ thống điện 12V:**
   - **02 bó que tre Ø5 mm** (50 que/bó) + giấy kiếng vàng + keo nến đan **06 ngôi sao 3D**.
   - **01 bộ 3 quả cầu xốp** (`Ø26 cm`, `Ø18 cm`, `Ø14 cm`) + ống gen PVC Ø8 mm uốn vòng quỹ đạo + cuộn dây cước trong `Ø0,5 mm`.
   - **06 mét LED dây 12V xanh công nghệ (`#00CFFF`) IP65**, **02 dây đèn LED đom đóm vàng ấm 10m**, **06 đèn LED mini dùng pin** (gắn tâm ngôi sao), **01 bộ nguồn Adapter 12V–5A**, **14 mét dây điện đôi `2×0,75 mm²`** + ống ruột gà bảo vệ.

---

## 4. CÔNG CỤ CẦN CHUẨN BỊ

- **Dụng cụ đo & lấy dấu:** Thước cuộn 5m, thước thủy (ivo) 40cm, dây dọi, dây dù căng mốc, phấn vẽ sân, bút lông dầu đánh mã thanh.
- **Dụng cụ gia công tre/gỗ:** Cưa tay sắc (hoặc máy cắt cầm tay có chụp bảo vệ), dao rọc giấy cỡ lớn, giấy nhám P120, dũa gỗ.
- **Dụng cụ khoan & lắp ghép:** Máy khoan pin/điện + mũi khoan gỗ `Ø9 mm` (dài ≥ 160 mm) + đầu bắn vít bake, 02 cờ lê 13 mm (hoặc đầu tuýp 13), kìm cắt dây rút, súng bắn keo nến, búa cao su.
- **Thiết bị an toàn:** 02 thang chữ A cao `1,8–2,0 m`, 08 đôi găng tay vải bảo hộ có phủ hạt nhựa chống trượt, 01 bình chữa cháy bột ABC 4 kg, băng keo điện Nano.

---

## 5. CÁCH CẮT VÀ CHUẨN BỊ TRE (LÀM TRƯỚC TẠI NHÀ 2–3 NGÀY)

1. **Chọn tre:** Chọn cây tre già đanh, thẳng, không bị nứt dọc. Các thanh chịu lực chính (cột A1–A2, xà B1–B6) ưu tiên cắt sao cho **2 đầu thanh cách mắt đốt tre từ 3–5 cm** để đầu ống không bị bẹp khi siết bu lông.
2. **Ghép thanh theo sơ đồ cắt tối ưu (xem tab MATERIALS trên ứng dụng):**
   - Đo và đánh dấu toàn bộ chiều dài cắt trên cây nguyên 4,0m trước khi cưa để tận dụng tối đa phần tre dư làm thanh chống góc `0,64 m` hoặc chân quầy `0,82 m`.
3. **Xử lý ba-via & khoan lỗ chờ sẵn:**
   - Dùng giấy nhám P120 chà sạch dằm tre ở hai đầu cắt và dọc thân thanh quầy (tránh xước tay khi bê vác và phục vụ khách).
   - Đặt 2 cột trước + các thanh xà lên sàn phẳng, đo và **khoan mồi sẵn lỗ `Ø9 mm`** tại các cao độ liên kết (`0,42 m`, `1,815 m`, `2,365 m`).
4. **Đánh mã ký hiệu:** Dùng bút lông dầu ghi rõ mã (`C1`–`C5`, `B1`–`B6`, `C1`–`C6`, `D1`) và dán băng keo giấy ở đầu mỗi thanh để ra sân lắp ráp như xếp hình Lego.

---

## 6. CÁCH DỰNG HỆ KHUNG CỘT & XÀ NGANG (GIAI ĐOẠN 0 → GIAI ĐOẠN 3)

1. **Định vị mặt bằng (GĐ0):**
   - Căng dây thước tạo hình chữ nhật `3,00 × 2,00 m`. Đo kiểm tra **2 đường chéo bằng đúng `3,61 m`** để đảm bảo 4 góc vuông 90°.
2. **Đặt chân đế xô bê tông (GĐ1):**
   - Đặt 5 xô bê tông 20L có chôn sẵn ống lồng PVC `Ø114` vào đúng 5 điểm tim cột `C1` (trước trái), `C2` (trước phải), `C3` (sau phải), `C4` (sau trái), `C5` (giữa sau).
   - Xếp 2 bao cát (15 kg/bao) áp sát phía ngoài/phía sau mỗi xô bê tông và buộc ghì vào quai xô.
3. **Dựng cột chính (GĐ2):**
   - Cắm gốc cột sâu `26 cm` vào ống lồng PVC. Dùng thước thủy áp vào 2 mặt vuông góc của thân cột để chỉnh thẳng đứng, đóng 4 nêm gỗ quanh khe ống lồng rồi xuyên bu lông `M8×150` khóa chân cột.
4. **Lắp xà dọc & xà ngang (GĐ3):**
   - Lắp 2 thanh xà dọc đỉnh cột (`B1`) nối `C1–C4` và `C2–C3`.
   - Lắp xà ngang đầu cột trước/sau (`B2` ở cao độ `2,365 m`), xà đỡ bảng hiệu trước (`B3` ở cao độ `1,815 m`), tiếp theo lắp các thanh giằng chân (`0,42 m`) và xà giữa (`1,20 m`).
   - Tại mỗi nút giao: xuyên bu lông `M8×150` có long đền 2 đầu, siết vừa đủ chặt (không siết quá căng gây nứt tre), sau đó dùng dây mây quấn **nút buộc chéo chữ X (Square Lashing)** 6–8 vòng bên ngoài để khóa ma sát.

---

## 7. CÁCH LẮP HỆ GIẰNG CHỐNG RUNG LẮC

1. **Thanh chống góc 45° (`C1` – dài `0,64 m`):**
   - Lắp tại các góc giữa cột đứng và xà ngang mặt trước, mặt sau và hai bên hông. Khoảng cách từ tim nút góc xuống thân cột và ra thân xà là `0,45 m` (tạo tam giác vuông cân `45–45–90°`).
2. **Giằng chéo chữ X (`C2` – dài `2,32 m`):**
   - Lắp 01 cặp chữ X ở mặt trong vách hông trái và 02 cặp chữ X ở 2 khoang vách sau (`C4–C5` và `C5–C3`).
   - Buộc chặt điểm giao giữa 2 thanh chéo bằng dây rút + dây mây. Hệ giằng chữ X này là yếu tố quyết định giúp gian hàng **không bị xô ngang khi có gió tạt hoặc khi nhiều người tỳ vào quầy**.

---

## 8. CÁCH LẮP MÁI GIÀN TRE (GIAI ĐOẠN 4)

1. **Gác 3 đòn tay mái (`B6` – dài `3,31 m`):**
   - Đặt 3 đòn tay (trước, giữa, sau) vuông góc lên trên 2 xà dọc đỉnh cột sao cho hai đầu đòn tay đua đều ra mỗi bên `20 cm`. Bắt bu lông M8 và buộc dây chéo tại 6 điểm giao.
2. **Rải 28 thanh nan mái song song (`C3` – dài `2,21 m`):**
   - Cố định 2 thanh nan ngoài cùng trước, căng 2 sợi dây dù chuẩn ở đầu trước và đầu sau.
   - Rải đều 26 thanh nan còn lại theo bước `12,1 cm`. Dùng dây rút nhựa 30cm thít chặt từng thanh nan vào cả 3 đòn tay, cắt gọn đầu dây rút thừa.

---

## 9. CÁCH LÀM QUẦY PHỤC VỤ (GIAI ĐOẠN 5)

1. **Khung chịu lực quầy:**
   - Lắp 4 khung chân chữ H (gồm 8 chân đứng `0,82 m` và đà ngang), liên kết bằng 2 đà dọc trên (`cao 0,81 m`) và 2 đà dọc dưới (`cao 0,26 m` làm kệ). Buộc chặt đầu trái của khung quầy vào cột `C1`.
2. **Mặt bàn & kệ dưới ván ép:**
   - Đặt tấm ván ép kệ dưới (`2,30 × 0,48 m`) lên tầng đà dưới và tấm mặt quầy (`2,32 × 0,60 m`) lên tầng đà trên, bắn vít gỗ cố định. Có thể trải thêm khăn trải bàn chống thấm hoặc dán decal vân gỗ/nhị phân.
3. **Ốp hệ nan tre dọc mặt trước & hông trái:**
   - Kẹp 2 thanh nẹp tre ngang ở mặt trước (cao độ `0,80 m` và `0,12 m`). Xếp 42 thanh nan tre dọc (`D1` – dài `0,80 m`) cách đều nhau `5,5 cm` (khe hở `~2 cm`) và buộc dây rút cố định vào 2 thanh nẹp. Lặp lại cho 8 thanh nan hông trái.

---

## 10. CÁCH LẮP BẢNG HIỆU VÀ 4 LOGO NHẬN DIỆN (GIAI ĐOẠN 6)

> **Nguyên tắc bắt buộc:** Toàn bộ 4 bảng logo (`PTIT`, `STR4.SEC`, `ATTT D26`, `Đoàn Thanh niên`) được in trực tiếp từ **file ảnh gốc cung cấp (`assets/*.png`)**, giữ nguyên tỷ lệ khung hình, màu sắc và chi tiết, tuyệt đối không kéo giãn làm biến dạng logo.

1. **Gia công bảng tại nhà:**
   - Bồi decal in lên tấm Foam 5 mm. Với bảng chữ nhật `STR4.SEC` (`0,78 × 0,59 m`) và bảng trung tâm `An toàn thông tin D26` (`1,52 × 0,59 m`), ốp thêm 1 lớp **Mica trong 2 mm** ở mặt trước và dán 2 thanh nẹp tre nhỏ ở mặt sau để bảng phẳng tuyệt đối, không cong vênh.
   - Với biển tròn `Logo PTIT` (trái, `Ø0,64 m`) và `Logo Đoàn Thanh niên` (phải, `Ø0,64 m`), cắt tròn bằng dao rọc giấy theo dưỡng compa, bọc viền vàng kim.
2. **Treo bảng lên khung (cao độ `1,815 m` – `2,365 m`):**
   - Khoan lỗ nhỏ `Ø5 mm` cách mép trên và mép dưới bảng `2,5 cm`.
   - Dùng dây rút nhựa đen bản to (`4,8 × 300 mm`) buộc **tối thiểu 4 điểm/bảng** (2 điểm treo vào xà đầu cột `2,365 m`, 2 điểm ghì vào xà đỡ bảng hiệu `1,815 m`).
3. **Gắn biển đám mây *"Ẩm thực Ngân hà"* (`1,60 × 0,56 m`):**
   - Cắt từ tấm Foam dày `10 mm`, luồn 6 sợi dây rút từ mặt sau qua khe nan tre mặt trước quầy và buộc vào thanh nẹp ngang.

---

## 11. CÁCH LÀM ĐỒ TRANG TRÍ VŨ TRỤ & AN TOÀN THÔNG TIN (GIAI ĐOẠN 7)

1. **Ngôi sao 3D que tre treo dưới mái (06 ngôi sao `Ø34 cm`):**
   - Mỗi ngôi sao dùng 10 que tre `Ø5 mm × 32 cm` buộc thành 2 khung sao 5 cánh, chập 2 đỉnh vào nhau và chống giữa bằng 5 đoạn que ngắn `8 cm` để tạo độ phồng 3D.
   - Đặt 01 bóng đèn LED mini dùng pin vào tâm ngôi sao, dán giấy kiếng vàng bao ngoài. Dùng dây cước trong `Ø0,5 mm` buộc vào đỉnh sao và treo lên nan mái ở các độ cao so le (`0,45 m` – `0,62 m`) ngay phía sau bảng hiệu.
2. **Hành tinh & Quỹ đạo ống PVC (03 bộ):**
   - Sơn 3 quả cầu xốp bằng màu Acrylic (Vàng Sao Thổ `Ø26 cm`, Xanh Công Nghệ `#00CFFF` `Ø18 cm`, Đỏ Cam Sao Hỏa `Ø14 cm`).
   - Luồn dây kẽm vào trong ống gen nhựa PVC `Ø8 mm`, uốn thành vòng tròn quỹ đạo bao quanh quả cầu, cố định bằng que xiên tre xuyên tâm và treo dây cước lên nan mái.
3. **Chi tiết An toàn thông tin:**
   - Cắt Foam 5 mm hình **Khiên bảo mật** (gắn cột trước trái `C1` ở cao độ `1,13 m`), **Ổ khóa mã hóa** (gắn cột trước phải `C2` ở cao độ `1,10 m`), **Dải nhị phân `0–1`** chạy ngang mặt trước quầy và **Tấm mạch điện tử** gắn hông quầy.

---

## 12. CÁCH ĐI DÂY ĐÈN LED & NGUỒN ĐIỆN AN TOÀN

1. **Phân tách nguồn điện chiếu sáng (12V DC) và nguồn bếp:**
   - Toàn bộ dây LED xanh `#00CFFF` (dưới xà bảng hiệu + mép quầy) và dây đèn đom đóm vàng ấm đều sử dụng **điện áp an toàn 12V DC** cấp qua bộ **Adapter 12V–5A**.
   - Hộp chứa Adapter 12V và ổ cắm có cầu dao tự ngắt (CB) được treo cố định trên **cột sau phải `C3` ở độ cao `1,30 m`** (cách xa mặt đất ẩm ướt và có mái che mưa tạt).
2. **Lộ trình đi dây:**
   - Từ ổ cấp điện của Ban Tổ Chức → luồn dây nguồn qua **ống ruột gà nhựa `Ø16 mm`** (dán băng keo vàng-đen cảnh báo nếu đi qua mặt sân) → đi thẳng lên cột `C3` → vào hộp Adapter 12V → từ đó dây 12V đi dọc theo xà dọc đỉnh phải ra cột trước `C2` để cấp cho LED bảng hiệu, LED quầy và đèn đom đóm dưới mái.
   - Cố định dây điện vào thân tre bằng dây rút mỗi `30 cm`, các mối nối bọc ống co nhiệt kín.

---

## 13. KIỂM TRA AN TOÀN KẾT CẤU, ĐIỆN & PHÒNG CHÁY (GIAI ĐOẠN 8)

> **Lưu ý kỹ thuật quan trọng:** Đây là kết cấu gian hàng tạm ngoài trời dùng đối trọng chân đế nổi. Đội thi công cần tuân thủ nghiêm ngặt các giới hạn vận hành và danh mục kiểm tra dưới đây trước khi đón khách:

1. **Kiểm tra chống lật & chịu gió:**
   - Đảm bảo đủ **05 xô bê tông (`~45 kg/xô`) + 10 bao cát (`~15 kg/bao`) = tổng đối trọng chân cột `~375 kg`**.
   - Phông nền phía sau nên dùng **bạt lưới Mesh xuyên gió** (hoặc rạch 4 khe thoát gió hình chữ U nhỏ trên bạt Hiflex). Nếu thời tiết có gió giật mạnh trên cấp 5 (≥ 30 km/h), cần tháo nhanh phông bạt sau và các bảng hiệu lớn để giảm diện tích cản gió.
2. **Kiểm tra tải trọng treo mái:**
   - Hệ mái nan tre chỉ dùng để treo các vật trang trí nhẹ (ngôi sao que tre, quả cầu xốp, dây đèn đom đóm với tổng tải `< 5 kg`). Tuyệt đối không đu người hoặc treo vật nặng lên nan mái.
3. **An toàn nhiệt & phòng cháy khu vực chế biến:**
   - Chỉ sử dụng **bếp điện từ** hoặc nồi hâm điện, hạn chế tối đa bình gas mini/lửa trần trong gian hàng tre.
   - Bếp đặt trên bàn sơ chế phía sau phải giữ **khoảng cách an toàn tối thiểu `0,50 m`** tới phông bạt ngân hà và thân cột tre (trên mô hình 3D đang thiết kế khoảng cách `0,55 m` có vòng tròn cảnh báo màu cam).
   - Không giăng dây đèn đom đóm hoặc treo ngôi sao giấy kiếng ngay phía trên khu vực bếp nấu.

---

## 14. DỰ KIẾN NHÂN LỰC VÀ THỜI GIAN THI CÔNG THEO CÔNG ĐOẠN

- **Nhân sự khuyến nghị:** **06 – 08 sinh viên** chia làm 2 tổ:
  - **Tổ Kết cấu (4 người):** Phụ trách định vị, chân đế, dựng cột, lắp xà, giằng chéo và mái.
  - **Tổ Quầy – Trang trí – Điện (2–4 người):** Phụ trách lắp quầy, ốp nan, gắn bảng hiệu, treo sao/hành tinh và đi dây LED.

| Giai đoạn | Nội dung công việc tại hiện trường (khi đã gia công sẵn tại nhà) | Nhân sự | Thời gian |
|---|---|---|---|
| **GĐ 0** | Khảo sát mặt bằng, đo 2 đường chéo, đánh dấu 5 tim cột `C1–C5` | 3 người | 15 phút |
| **GĐ 1** | Đặt 5 chân đế xô bê tông, xếp 10 bao cát chống lật & tập kết tre | 6 người | 15 phút |
| **GĐ 2** | Dựng 5 cột chính vào ống lồng, cân thước thủy, đóng nêm & khóa bu lông | 4 người | 20 phút |
| **GĐ 3** | Lắp xà dọc, xà ngang, giằng chân, chống góc 45° & giằng chéo chữ X | 4 người | 30 phút |
| **GĐ 4** | Gác 3 đòn tay mái & rải buộc 28 thanh nan mái song song | 4 người | 25 phút |
| **GĐ 5** | Lắp khung quầy, mặt ván ép, ốp 50 nan tre dọc & kê bàn/tủ/thùng đá | 3 người | 30 phút |
| **GĐ 6** | Treo 4 bảng Logo (`PTIT`, `STR4.SEC`, `D26`, `Đoàn TN`) & biển mây | 3 người | 20 phút |
| **GĐ 7** | Căng phông ngân hà, treo sao 3D, hành tinh, icon bảo mật & đi LED 12V | 4 người | 25 phút |
| **GĐ 8** | Kiểm tra an toàn 12 điểm, vệ sinh mặt bằng & chạy thử ánh sáng | Toàn đội | 15 phút |
| **TỔNG** | **Thời gian lắp dựng hoàn chỉnh tại sân hội trại** (`song song 2 tổ`) | **6–8 SV** | **~150–180 phút** |

---

## 15. CÁC PHƯƠNG ÁN TIẾT KIỆM CHI PHÍ TỐI ĐA CHO SINH VIÊN

1. **Mượn & tái sử dụng đồ nội thất (Tiết kiệm `~600.000 – 900.000 ₫`):**
   - Bàn gấp sơ chế, tủ nhựa 3 ngăn kéo, thùng đá giữ lạnh, ổ cắm điện kéo dài và bếp từ hoàn toàn có thể mượn từ Văn phòng Đoàn Khoa, CLB STR4.SEC hoặc phòng trọ của các thành viên trong lớp.
2. **Tự đúc chân đế bằng vỏ thùng sơn cũ (Tiết kiệm `~300.000 ₫`):**
   - Xin vỏ thùng sơn nước 18–20L tại các công trình sửa nhà, mua 1m ống PVC `Ø114` cắt làm 5 đoạn và trộn cát + xi măng đổ tại nhà trước 5 ngày (chỉ tốn `~38.000 ₫/chân`).
3. **Ghép thanh tre theo sơ đồ 1D trên ứng dụng (Tiết kiệm `15–20%` tiền tre):**
   - Mua tre nguyên cây 4,0m tại vựa vật liệu xây dựng và cắt theo đúng sơ đồ ghép thanh trong mục **MATERIALS** của phần mềm giúp tận dụng mọi đoạn tre ngắn làm chân quầy, thanh chống góc và nan ốp quầy.
4. **Thanh lý hoặc lưu kho tái sử dụng sau hội trại:**
   - Toàn bộ liên kết dùng **bu lông M8 tháo lắp được + dây rút** (không đóng đinh làm vỡ tre), nên sau hội trại có thể tháo gọn trong 45 phút để lưu kho cho CLB STR4.SEC dùng vào đợt tuyển thành viên hoặc hội trại năm sau.
