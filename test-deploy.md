# Testing Deploy ke Vercel

## Informasi Deploy
- **URL Deployed**: https://game-nine-omega-15.vercel.app
- **Admin Page**: https://game-nine-omega-15.vercel.app/admin

## Testing Checklist

### 1. Test Homepage
```
GET https://game-nine-omega-15.vercel.app/
```
✅ Pastikan halaman utama load dengan baik

### 2. Test Admin Page
```
GET https://game-nine-omega-15.vercel.app/admin
```
✅ Pastikan halaman admin terbuka

### 3. Test Email Endpoint - Test Email
**Method**: POST  
**URL**: `https://game-nine-omega-15.vercel.app/api/test-email`

**Request Body** (JSON):
```json
{
  "email": "test@example.com"
}
```

**Expected Response** (Success):
```json
{
  "success": true,
  "id": "email-id-xxx"
}
```

**Possible Error Responses**:
```json
{
  "error": "Email is required"
}
```
atau
```json
{
  "error": "API key not configured"
}
```

### 4. Test Email Endpoint - Send Email
**Method**: POST  
**URL**: `https://game-nine-omega-15.vercel.app/api/send-email`

**Request Body** (JSON):
```json
{
  "email": "test@example.com",
  "subject": "Test Subject",
  "html": "<h1>Test Email</h1><p>This is a test</p>"
}
```

**Expected Response** (Success):
```json
{
  "success": true,
  "id": "email-id-xxx"
}
```

## Debugging Tips

### Jika Email Tidak Terkirim:
1. ✅ Cek apakah `RESEND_API_KEY` sudah di-set di Vercel
   - Buka Vercel Dashboard → Project Settings → Environment Variables
   - Pastikan `RESEND_API_KEY` ada dan value-nya benar

2. ✅ Cek Vercel Logs
   - Buka Vercel Dashboard → Deployments → Latest Deploy → Logs
   - Lihat error message di console logs

3. ✅ Test API Response
   - Buka browser console
   - Coba request dengan fetch:
   ```javascript
   fetch('https://game-nine-omega-15.vercel.app/api/test-email', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email: 'test@example.com' })
   })
   .then(r => r.json())
   .then(d => console.log(d))
   ```

### Jika ada Error 500:
- Berarti API Key tidak tersetting atau format request salah
- Check Vercel logs untuk error detail

## Langkah Selanjutnya

1. Test email endpoint dari browser console (lihat di atas)
2. Jika berhasil, check email yang dikirim ke tujuan
3. Jika gagal, cek environment variables di Vercel
4. Jika masih gagal, lihat Vercel logs untuk error detail
