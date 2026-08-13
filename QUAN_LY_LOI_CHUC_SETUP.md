# Trang quản lý lời chúc — V41

## Upload lên GitHub

Đặt vào thư mục gốc repo:

- `quan-ly-loi-chuc.html`
- `firebase-config.js`
- `firestore.rules` có thể lưu trong repo để backup.

Sau khi upload, trang quản lý có URL:

```text
https://<username>.github.io/<repo>/quan-ly-loi-chuc.html
```

## Bắt buộc: bật Firebase Authentication

Firebase Console:

1. **Authentication**
2. **Get started**
3. **Sign-in method**
4. Chọn **Google**
5. Enable → Save

## Authorized domains

Firebase Console:

Authentication → Settings → Authorized domains

Thêm domain GitHub Pages của website, ví dụ:

```text
geelyhaiduong.github.io
```

## Tài khoản quản trị

V41 đang cấu hình:

```text
tunga8hq@gmail.com
```

trong:
- `firebase-config.js`
- `firestore.rules`

Nếu đổi email quản trị, phải sửa ở CẢ HAI file.

## Firestore Rules

Firebase Console:

Firestore Database → Rules

Dán toàn bộ nội dung `firestore.rules` V41 → **Publish**.

Rules V41 cho admin:
- đọc toàn bộ `wedding_wishes`;
- duyệt / ẩn / xóa lời chúc;
- đọc toàn bộ `wedding_rsvp`.

Khách thường:
- không đọc được RSVP;
- chỉ đọc được lời chúc `approved:true`.

## Tính năng trang quản lý

- Google Login
- Lời chúc realtime
- Duyệt
- Ẩn
- Xóa
- Lọc Tất cả / Đang hiện / Đang ẩn
- Tìm kiếm
- Danh sách RSVP
- Tổng nhóm tham dự
- Tổng số khách
- Xuất CSV
