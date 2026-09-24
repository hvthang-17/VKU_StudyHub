# VKU StudyHub

VKU StudyHub là ứng dụng di động thông minh hỗ trợ sinh viên VKU tìm kiếm, đặt phòng học/phòng lab và quản lý lịch đặt phòng một cách thuận tiện. Ứng dụng được xây dựng bằng **Expo React Native**, **TypeScript**, **Zustand** và **Firebase Cloud Firestore**.

---

## Mục tiêu dự án

Dự án giúp số hóa toàn bộ quy trình đặt phòng học tự học, phòng lab hoặc không gian học nhóm trong khuôn viên Trường Đại học CNTT & TT Việt - Hàn (VKU). Sinh viên có thể xem danh sách phòng học thời gian thực, lọc phòng theo nhu cầu, đặt khung giờ phù hợp, nhận mã QR xuất trình và theo dõi lịch học cá nhân.

---

## Tính năng chính

### 1. Xác thực & Phân quyền Người dùng (Auth & RBAC)
- **Đăng nhập & Đăng ký sinh viên/admin:** Đăng nhập qua Email VKU, quản lý phiên làm việc bền vững.
- **Phân quyền nghiệp vụ (Role-based Access Control):**
  - **Sinh viên (`student`):** Xuất trình mã QR Ticket trên điện thoại cho QTV check-in. Giao diện ẩn nút camera quét QR để ngăn chặn check-in từ xa gian lận.
  - **Quản trị viên / QTV (`admin`):** Được cấp quyền bật Camera/Thư viện ảnh quét mã QR check-in cho sinh viên tại phòng học.

### 2. Tìm kiếm & Lọc Phòng học Quy mô 60+ Phòng
- **Danh sách 64+ phòng học & lab:** Tòa A, B, C, V từ Tầng 1 ➔ 4.
- **Bộ lọc đa tiêu chí (AND Logic):** Lọc Tòa nhà, Sức chứa, Thiết bị và Lọc phòng yêu thích (Favorites toggle).
- **Tối ưu hiệu năng FlatList:** Render mượt ở tốc độ **60 FPS**, loại bỏ hoàn toàn lag khi cuộn hoặc lọc liên tục.

### 3. Đặt Phòng & Kiểm tra Xung đột Lịch
- **Khung giờ cố định 2 tiếng/ca:** `07:30–09:30`, `09:30–11:30`, `13:00–15:00`, `15:00–17:00`.
- **Trạng thái từng ca học:** Sẵn sàng, Đã có người đặt, Trùng lịch cá nhân, Đã quá giờ đặt.
- **Chống đặt trùng tuyệt đối (Race Condition Protection):** Sử dụng Firestore Transaction & Lock Document `slot_locks`.

### 4. QR Booking Pass & Quy trình Check-in
- **Sinh viên xuất trình QR Pass:** Tạo mã QR duy nhất mã hóa thông tin Booking ID, Room ID, User ID.
- **QTV quét mã Check-in:** QTV dùng tính năng **Quét QR** để quét mã của sinh viên trong khoảng 15 phút quanh giờ bắt đầu ca.
- **Tự động Hủy ca Quá giờ Check-in 15 phút (Auto No-Show Cancellation):**
  - Ca không được check-in đúng giờ sẽ bị hủy tự động kèm lý do *"Quá thời hạn check-in (15 phút)"*.
  - **Tự động giải phóng khóa slot trên Firestore (`slot_locks`)**, đưa phòng học về trạng thái **Sẵn sàng** cho người khác sử dụng.
  - Gửi Push Notification báo lý do hủy ca cho sinh viên.

### 5. Trang Cá nhân & Thống kê Đặt phòng (Profile & Stats)
- Hiển thị thông tin sinh viên, badge phân quyền và **Lưới thống kê thời gian thực** (Tổng ca, Đã nhận phòng, Chờ check-in, Đã hủy).

### 6. Nhắc lịch & Thông báo Local Notifications
- Lên lịch nhắc 15 phút trước giờ học và gửi thông báo tức thì khi ca bị hủy do no-show.

## Công nghệ sử dụng

- Expo SDK 57.
- React Native 0.86.
- React 19.
- TypeScript 6.
- Firebase 10.
- Zustand cho state management.
- React Navigation cho điều hướng.
- Expo Camera cho quét QR bằng camera.
- Expo Image Picker cho chọn ảnh QR từ thư viện.
- Expo Notifications cho thông báo local.
- react-native-qrcode-svg để tạo mã QR.

## Cấu trúc thư mục

```text
VKU_StudyHub/
├── firestore.rules      # Quy tắc bảo mật phân quyền Firestore (RBAC)
├── firebaseConfig.ts    # Khởi tạo kết nối Firebase App, Auth & Firestore
├── scripts/             # Scripts hỗ trợ (Seed 64 phòng, test concurrency)
│   ├── seedFirestore.js
│   └── testConcurrency.js
├── src/
│   ├── components/      # Component UI tái sử dụng (@expo/vector-icons, memo)
│   │   ├── BookingCard.tsx
│   │   ├── DateSelector.tsx
│   │   ├── FilterChips.tsx
│   │   ├── QRModal.tsx
│   │   ├── QRScanner.tsx
│   │   ├── RoomCard.tsx
│   │   ├── SearchBar.tsx
│   │   └── TimeSlotGrid.tsx
│   ├── constants/       # Hằng số màu sắc, khung giờ, filter option
│   ├── navigation/      # Cấu hình AppNavigator & TabNavigator
│   ├── screens/         # Các màn hình chính
│   │   ├── BookingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── MyBookingsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── RoomDetailScreen.tsx
│   ├── services/        # Service nghiệp vụ & giao tiếp Firebase
│   │   ├── authService.ts
│   │   ├── bookingService.ts
│   │   ├── notificationService.ts
│   │   └── roomService.ts
│   ├── store/           # Zustand global state store
│   ├── types/           # TypeScript interfaces & types
│   └── utils/           # Utility xử lý ngày giờ, QR payload, format
```

## Yêu cầu môi trường

- Node.js phiên bản phù hợp với Expo SDK 57.
- npm.
- Expo CLI hoặc dùng trực tiếp qua `npx expo`.
- Thiết bị Android/iOS hoặc emulator/simulator.
- Firebase project đã cấu hình.

## Cài đặt

Cài dependencies:

```bash
npm install
```

## Chạy ứng dụng

Khởi động Metro bundler:

```bash
npm start
```

Chạy Android:

```bash
npm run android
```

Chạy iOS:

```bash
npm run ios
```

Chạy web:

```bash
npm run web
```

## Script hỗ trợ

Seed dữ liệu phòng:

```bash
npm run seed
```

Kiểm tra đặt phòng đồng thời/race condition:

```bash
npm run test:concurrent
```

Kiểm tra TypeScript:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

## Cấu hình Firebase

Dự án sử dụng Firebase cho xác thực, lưu phòng, booking và slot lock. Cần cấu hình thông tin Firebase trong môi trường hoặc file cấu hình tương ứng của dự án.

Các nhóm dữ liệu chính thường dùng:

- Người dùng.
- Phòng học/phòng lab.
- Booking.
- Slot lock để chống nhiều người đặt cùng một phòng, cùng ngày, cùng giờ.

## Quyền thiết bị

Ứng dụng cần một số quyền thiết bị:

- Camera: dùng để quét QR check-in.
- Thư viện ảnh: dùng để chọn ảnh QR đã lưu.
- Notification: dùng để gửi nhắc lịch đặt phòng.

Trong `app.json`, dự án đã cấu hình plugin cho Expo Camera và Expo Notifications.

## Quy tắc đặt phòng theo thời gian thực

Với ngày hôm nay, ứng dụng không cho đặt slot nếu thời gian hiện tại đã bằng hoặc vượt qua giờ bắt đầu slot.

Ví dụ lúc 10:35:

- 07:30 – 09:30: đã quá giờ đặt.
- 09:30 – 11:30: đã quá giờ đặt.
- 13:00 – 15:00: còn đặt được.
- 15:00 – 17:00: còn đặt được.

Các ngày tương lai không bị ảnh hưởng bởi kiểm tra này.

## Luồng sử dụng cơ bản

1. Sinh viên đăng nhập hoặc đăng ký tài khoản.
2. Tìm kiếm/lọc phòng theo nhu cầu.
3. Mở chi tiết phòng.
4. Chọn ngày và khung giờ còn trống.
5. Xác nhận đặt phòng.
6. Nhận QR booking pass.
7. Đến phòng đúng giờ và quét QR để check-in.
8. Theo dõi hoặc hủy booking trong màn hình đặt phòng của tôi.

## Ghi chú phát triển

- Nên chạy TypeScript check trước khi commit thay đổi lớn.
- Khi thay đổi logic booking, nên chạy `npm run test:concurrent` để đảm bảo không phá vỡ cơ chế chống đặt trùng.
- Không nên chỉ chặn booking ở UI; các rule quan trọng cần được kiểm tra thêm trong service.

