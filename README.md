# VKU StudyHub

VKU StudyHub là ứng dụng di động hỗ trợ sinh viên VKU tìm kiếm, đặt phòng học/phòng lab và quản lý lịch đặt phòng một cách thuận tiện. Ứng dụng được xây dựng bằng Expo React Native, TypeScript và Firebase.

## Mục tiêu dự án

Dự án giúp số hóa quy trình đặt phòng học tự học, phòng lab hoặc không gian học nhóm trong trường. Sinh viên có thể xem danh sách phòng, lọc theo nhu cầu, chọn ngày và khung giờ phù hợp, nhận mã QR sau khi đặt thành công và dùng QR để check-in.

## Tính năng chính

### Xác thực người dùng

- Đăng nhập sinh viên.
- Đăng ký tài khoản sinh viên.
- Quản lý thông tin người dùng trong ứng dụng.

### Tìm kiếm và lọc phòng

- Xem danh sách phòng học/phòng lab.
- Tìm kiếm theo tên phòng.
- Lọc theo tòa nhà.
- Lọc theo sức chứa.
- Lọc theo thiết bị hỗ trợ như máy chiếu, bảng trắng, máy tính cấu hình cao, điều hòa.
- Xem chi tiết phòng trước khi đặt.

### Đặt phòng theo ngày và khung giờ

- Chọn ngày đặt trong các ngày được hỗ trợ.
- Chọn khung giờ cố định 2 tiếng/ca:
  - 07:30 – 09:30
  - 09:30 – 11:30
  - 13:00 – 15:00
  - 15:00 – 17:00
- Hiển thị trạng thái khung giờ:
  - Sẵn sàng.
  - Đã có người đặt.
  - Trùng lịch cá nhân.
  - Đã quá giờ đặt.
- Không cho đặt các slot cùng ngày đã bắt đầu hoặc đã qua.
- Kiểm tra xung đột lịch của chính người dùng.
- Sử dụng Firestore transaction/slot lock để hạn chế race condition khi nhiều người đặt cùng lúc.

### Quản lý đặt phòng

- Xem danh sách các booking của người dùng.
- Hủy booking đang hoạt động.
- Hiển thị trạng thái booking:
  - Active.
  - Checked-in.
  - Completed.
  - Cancelled.

### QR booking pass và check-in

- Tạo QR pass sau khi đặt phòng thành công.
- Xem lại QR của booking trong màn hình đặt phòng của tôi.
- Quét QR bằng camera để check-in.
- Hỗ trợ chọn ảnh QR từ thư viện để quét.
- Kiểm tra hợp lệ khi check-in:
  - Booking tồn tại.
  - Đúng người dùng.
  - Đúng phòng.
  - Booking còn active.
  - Check-in trong khoảng thời gian cho phép quanh giờ bắt đầu slot.

### Thông báo nhắc lịch

- Lên lịch thông báo local trước giờ bắt đầu slot 15 phút.
- Hủy thông báo nhắc lịch khi booking bị hủy.

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
src/
├── components/          # Component tái sử dụng trong UI
│   ├── BookingCard.tsx
│   ├── DateSelector.tsx
│   ├── FilterChips.tsx
│   ├── QRModal.tsx
│   ├── QRScanner.tsx
│   ├── RoomCard.tsx
│   ├── SearchBar.tsx
│   └── TimeSlotGrid.tsx
├── constants/           # Hằng số màu sắc, khung giờ, filter option
├── navigation/          # Cấu hình điều hướng app
├── screens/             # Các màn hình chính
│   ├── BookingScreen.tsx
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── MyBookingsScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── RegisterScreen.tsx
│   └── RoomDetailScreen.tsx
├── scripts/             # Script seed data và test concurrency
├── services/            # Xử lý nghiệp vụ và giao tiếp Firebase
│   ├── authService.ts
│   ├── bookingService.ts
│   ├── notificationService.ts
│   └── roomService.ts
├── store/               # Zustand store
├── types/               # TypeScript type definitions
└── utils/               # Helper xử lý ngày giờ và QR
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

## Tác giả

VKU StudyHub được phát triển cho mục đích học tập và mô phỏng hệ thống đặt phòng học thông minh cho sinh viên VKU.
