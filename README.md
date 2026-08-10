# Wedding Passport — GitHub-ready

## Chỉnh thông tin
Chỉ cần mở **config.js**. Không cần sửa `index.html`.

Bạn có thể đổi:
- Tên cô dâu / chú rể
- Ngày cưới
- Giờ đón khách / khai tiệc
- Nhà hàng / địa chỉ
- Tên bố mẹ
- Story of Love
- Ảnh ở từng khu vực

## Thay ảnh
1. Upload ảnh vào thư mục phù hợp trong `assets/images/`.
2. Mở `config.js`.
3. Thay URL ảnh mẫu bằng đường dẫn tương đối, ví dụ:

```js
"assets/images/hero/01.jpg"
```

Không dùng dấu `/` ở đầu đường dẫn.

### Tỉ lệ ảnh gợi ý
- `hero`: 7 ảnh vuông 1:1
- `invitation`: 3 ảnh
- `story`: 1 ảnh
- `familyMain`: 1 ảnh lớn
- `familyFilm`: 7 ảnh dọc 4:5
- `groomPortrait`, `bridePortrait`: ảnh chân dung
- `flight`: 2 ảnh
- `albumCover`: 3 ảnh
- `album`: tối đa 18 ảnh, ưu tiên dọc 5:7
- `footer`: 1 ảnh

## Upload GitHub Pages
Upload **toàn bộ file/thư mục bên trong gói này** lên repository, để `index.html` nằm ở thư mục gốc.

Cấu trúc:

```text
index.html
config.js
customize.js
assets/
  images/
```

Sau đó bật GitHub Pages cho branch `main` và thư mục `/(root)`.

## Lưu ý
Một số tài nguyên trang trí và font của mẫu gốc vẫn đang tải từ CDN của mẫu.
Form RSVP hiện là phần giao diện của source gốc; nếu muốn lưu danh sách khách mời, nên nối riêng Google Sheets / Apps Script / dịch vụ form.
