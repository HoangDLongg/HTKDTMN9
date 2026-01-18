# ⚠️ MARKET DATA ISSUE

## 🐛 Vấn đề:

Trang Admin Market hiển thị toàn 0 vì:
1. Chưa có dữ liệu trong database
2. Frontend interface không match với Backend model

---

## 📊 Backend Model (Thực tế):

```python
class MarketPrices(models.Model):
    crop = ForeignKey
    price_date = DateField
    price_min = DecimalField      # ← Backend có
    price_max = DecimalField       # ← Backend có  
    price_avg = DecimalField       # ← Backend có
    market_location = CharField    # ← Backend có
    source = ForeignKey
    notes = TextField
```

## 💻 Frontend Interface (Hiện tại):

```typescript
interface MarketPrice {
    crop: { id, name }
    price_date: string
    price_per_kg: number          # ← Frontend dùng (KHÔNG TỒN TẠI!)
    market_name: string           # ← Frontend dùng (KHÔNG TỒN TẠI!)
    quality_grade: string         # ← Frontend dùng (KHÔNG TỒN TẠI!)
}
```

---

## ✅ Giải pháp:

### Option 1: Sửa Frontend (Khuyến nghị)
Sửa `app/admin/market/page.tsx` để dùng đúng fields:

```typescript
interface MarketPrice {
    id: number;
    crop: { id: number; name: string; };
    price_date: string;
    price_min: number;           // ← Đổi
    price_max: number;           // ← Đổi
    price_avg: number;           // ← Đổi
    market_location: string;     // ← Đổi
    notes: string | null;
}
```

### Option 2: Sửa Backend
Thêm migration để đổi tên fields (phức tạp hơn)

---

## 🚀 Seed Data:

Sau khi sửa frontend, chạy:

```bash
cd backend
python seed_market_prices.py
```

Sẽ tạo ~600-800 bản ghi giá cho 30 ngày gần đây.

---

## 📝 TODO:

1. ✅ Tạo script seed_market_prices.py
2. ⬜ Sửa frontend interface
3. ⬜ Sửa frontend display logic
4. ⬜ Chạy seed script
5. ⬜ Test trang market

**Bạn muốn tôi sửa frontend luôn không?** 🤔
