import google.generativeai as genai

# Test Gemini API
GEMINI_API_KEY = 'AIzaSyCNQeknvnF5pta8WLIapZ6hkvtjijrFv1M'
genai.configure(api_key=GEMINI_API_KEY)

try:
    model = genai.GenerativeModel('gemini-pro')
    
    prompt = """Bạn là trợ lý AI nông nghiệp thông minh của AgriSupply.

Người dùng hỏi: "giá thị trường hôm nay"

Dữ liệu từ database:
📊 **Giá thị trường hôm nay:**

1. **Cà chua**: 12.304 đ/kg
   📍 Chợ đầu mối Bình Điền

2. **Xà lách**: 26.239 đ/kg
   📍 Chợ đầu mối Bình Điền

3. **Dưa lưới**: 46.742 đ/kg
   📍 Chợ đầu mối Bình Điền

Nhiệm vụ: Viết lại câu trả lời tự nhiên, thân thiện, hữu ích hơn. 
- Giữ CHÍNH XÁC tất cả số liệu
- Thêm insight/lời khuyên nếu phù hợp
- Ngắn gọn, dễ hiểu

Câu trả lời:"""
    
    response = model.generate_content(prompt)
    print("✅ Gemini API hoạt động!\n")
    print(response.text)
    
except Exception as e:
    print(f"❌ Lỗi: {e}")
