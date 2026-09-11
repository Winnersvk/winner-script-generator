# Winner Script Generator

MVP สำหรับสร้าง Short-form video script ไทย/ลาว จากเรื่องราวดิบ โดยสร้าง 3 directions พร้อม Hook, Script, Text on Screen, Cover, Caption, B-roll และ CTA

## เริ่มใช้งาน

1. ติดตั้ง Node.js 20+
2. แตกไฟล์โปรเจกต์ แล้วรัน:

```bash
npm install
```

3. สร้าง `.env.local` จาก `.env.example`

```env
OPENAI_API_KEY=ใส่_api_key_ของคุณ
OPENAI_MODEL=gpt-5.6
```

หากบัญชี API ของคุณใช้ model อื่น ให้เปลี่ยน `OPENAI_MODEL` ได้

4. เปิด dev server

```bash
npm run dev
```

จากนั้นเปิด http://localhost:3000

## Deploy

เหมาะกับ Vercel: import Git repository แล้วเพิ่ม Environment Variables `OPENAI_API_KEY` และ `OPENAI_MODEL`

## Security

API key ถูกอ่านเฉพาะใน Server Route (`/app/api/generate/route.js`) และไม่ส่งไป browser
