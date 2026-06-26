# Wuthering Waves Companion

App desktop tổng hợp công cụ cho game **Wuthering Waves**: tra cứu nhân vật, tính sát thương & tối ưu Echo, mô phỏng convene (gacha) và quản lý tài nguyên hằng ngày. Offline-first.

## Tech stack

- **Tauri 2** (vỏ desktop, Rust) + **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS v4** (theme dark "neon-glass"), **framer-motion**, **zustand**, **react-router**, **lucide-react**

## Cấu trúc

```
src/
  data/        # dataset game (JSON cộng đồng) + manifest version-stamp
  lib/         # logic & dữ liệu tham chiếu (elements, utils, ...)
  components/  # component dùng chung (Sidebar, PageHeader, ...)
  features/    # 4 module: resonators · calculator · gacha · tracker + dashboard
  routes/      # layout, routing, cấu hình nav
  styles/      # global.css (Tailwind + design tokens)
src-tauri/     # vỏ Tauri (Rust)
```

## Chạy dev

```bash
npm install
npm run tauri dev     # build Rust + mở cửa sổ desktop
# hoặc chỉ frontend:
npm run dev           # Vite tại http://localhost:1420
```

Build bản cài đặt:

```bash
npm run tauri build
```

## Yêu cầu môi trường

- **Node.js** (đã cài tại `D:\Application\NodeJS`)
- **Rust** + **MSVC C++ Build Tools** (cho Tauri) — tại `D:\Application\Rust` và `D:\Application\VSBuildTools`

> ⚠️ Trên máy này, các shell tự động không kế thừa PATH mới. Khi chạy lệnh cần `node`/`cargo`, nạp thủ công:
> ```powershell
> $env:Path = "D:\Application\NodeJS;D:\Application\Rust\.cargo\bin;" + $env:Path
> $env:RUSTUP_HOME = "D:\Application\Rust\.rustup"; $env:CARGO_HOME = "D:\Application\Rust\.cargo"
> ```

## Dữ liệu

- **Nhân vật / vũ khí / echo / sonata**: chuẩn hoá từ [`DommyMM/wuwabuild`](https://github.com/DommyMM/wuwabuild) (chạy site wuwa.build) bằng `scripts/build-data.mjs` → `src/data/wuwa/*.json`. Chạy lại script để cập nhật:
  ```bash
  node scripts/build-data.mjs
  ```
- **Ảnh**: CDN chính thức `files.wuthery.com` (avatar, splash art, icon nguyên tố/vũ khí) — URL nằm sẵn trong dữ liệu.
- **Tin tức**: API chính thức Kuro Games (cập nhật trực tiếp khi mở app).
- **Code & Banner**: dữ liệu curated, ghi rõ ngày cập nhật (không có API chính thức).

## Tính năng

Dashboard cinematic (hero nhân vật + tin tức live) · Resonators (DB + chi tiết + gợi ý build + nguyên liệu) · **Convene** (liên kết URL thật → pity, thống kê, nhân vật sở hữu) · Daily Tracker (Waveplate + nhiệm vụ) · **News** (live) · **Codes** · **Banners/Leaks**.

### Liên kết Convene (pity thật)

Dán URL Convene History lấy trong game (Convene → History; URL nằm trong `…\Client\Saved\Logs\Client.log`). App gọi API gacha chính thức của Kuro, tính pity thật cho từng banner và suy ra nhân vật sở hữu. `record_id` trong URL hết hạn sau ~1 ngày — lấy lại khi cần. Dữ liệu lưu cục bộ và gộp dồn qua các lần nhập.
