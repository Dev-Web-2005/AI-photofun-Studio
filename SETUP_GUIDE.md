# 🚀 HƯỚNG DẪN CẤU HÌNH SAU KHI CẬP NHẬT

## ✅ ĐÃ SỬA XONG

### 1. **Xóa Proxy trong vite.config.js**

- Đã xóa tất cả các proxy `/api/v1/ai`, `/api/v1/identity`, `/comments`, `/socket.io`
- Frontend giờ sẽ gọi trực tiếp đến backend qua biến môi trường

### 2. **Cập nhật .env.example**

- Thêm `VITE_SOCKET_COMMENT_URL` cho WebSocket comment service
- Thêm `VITE_FIREBASE_DATABASE_URL` cho Firebase Realtime Database

### 3. **Cập nhật deploy.yaml**

- Thêm `VITE_FIREBASE_DATABASE_URL` vào env variables
- Thêm `VITE_FIREBASE_DATABASE_URL` vào envs list
- Thêm `VITE_FIREBASE_DATABASE_URL` vào script tạo .env

---

## 📝 CÁC BƯỚC TIẾP THEO

### Bước 1: Tạo file `.env` trong `src/frontend/`

Sao chép từ `.env.example` và điền giá trị thực:

```bash
cd src/frontend
cp .env.example .env
```

Sau đó sửa file `.env` với các giá trị thực tế:

```env
# API URLs - Production
VITE_API_GATEWAY=https://nmcnpm-api.lethanhcong.site
VITE_AI_API_URL=https://nmcnpm-api-ai.lethanhcong.site
VITE_SOCKET_URL=https://nmcnpm-api.lethanhcong.site
VITE_SOCKET_COMMENT_URL=https://nmcnpm-comment.lethanhcong.site
VITE_COMMENT_API_URL=https://nmcnpm-comment.lethanhcong.site
VITE_FILE_UPLOAD_URL=https://file-service-cdal.onrender.com

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_actual_client_id
VITE_GOOGLE_REDIRECT_URI=https://nmcnpm.lethanhcong.site/google-loading

# Payment
VITE_PAYMENT_API_URL=https://nmcnpm-payment-service.onrender.com/payment/create-payment
VITE_PAYMENT_API_KEY=your_actual_api_key

# Chatbot
VITE_CHATBOT_API_URL=https://agent.lethanhcong.site
VITE_CHATBOT_X_API_KEY=your_actual_key
VITE_CHATBOT_USER_ID=your_actual_user_id
VITE_CHATBOT_BEARER_TOKEN=your_actual_token

# Firebase
VITE_FIREBASE_API_KEY=your_actual_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com

# TURN Server (WebRTC)
VITE_TURN_URL_1=turn:your_turn_server:3478
VITE_TURN_USERNAME_1=your_username
VITE_TURN_CREDENTIAL_1=your_credential
VITE_TURN_URL_2=turn:your_backup_turn:3478
VITE_TURN_USERNAME_2=your_username2
VITE_TURN_CREDENTIAL_2=your_credential2
```

### Bước 2: Cấu hình GitHub Secrets/Variables

Vào GitHub Repository → Settings → Secrets and variables → Actions

#### **Secrets** (dữ liệu nhạy cảm):

```
VITE_GOOGLE_CLIENT_ID
VITE_FIREBASE_API_KEY
VITE_FIREBASE_APP_ID
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL  ← MỚI THÊM
VITE_FIREBASE_MEASUREMENT_ID
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_PAYMENT_API_KEY
VITE_CHATBOT_BEARER_TOKEN
VITE_CHATBOT_USER_ID
VITE_CHATBOT_X_API_KEY
```

#### **Variables** (URL công khai):

```
VITE_GOOGLE_REDIRECT_URI
VITE_API_GATEWAY
VITE_AI_API_URL
VITE_SOCKET_URL
VITE_SOCKET_COMMENT_URL  ← MỚI THÊM
VITE_COMMENT_API_URL
VITE_FILE_UPLOAD_URL
VITE_PAYMENT_API_URL
VITE_CHATBOT_API_URL
VITE_TURN_URL_1
VITE_TURN_URL_2
VITE_TURN_USERNAME_1
VITE_TURN_USERNAME_2
VITE_TURN_CREDENTIAL_1
VITE_TURN_CREDENTIAL_2
```

### Bước 3: Cấu hình Nginx cho Backend API

Nginx cần reverse proxy các request từ frontend đến backend services:

```nginx
server {
    listen 443 ssl;
    server_name nmcnpm.lethanhcong.site;

    ssl_certificate /etc/letsencrypt/live/nmcnpm.lethanhcong.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nmcnpm.lethanhcong.site/privkey.pem;

    root /var/www/html/nmcnpm.lethanhcong.site;
    index index.html;

    # Frontend - React SPA
    location / {
        try_files $uri $uri/ /index.html;
        client_max_body_size 50M;
    }

    # KHÔNG CẦN proxy API nữa vì frontend đã gọi trực tiếp
    # Backend APIs được gọi từ VITE_API_GATEWAY, VITE_AI_API_URL, etc.
}
```

### Bước 4: Test Local

```bash
cd src/frontend
npm install
npm run dev
```

Kiểm tra trong console:

- API calls đi đến đâu?
- Có lỗi CORS không?
- Socket có connect được không?

### Bước 5: Deploy lên Production

```bash
git add .
git commit -m "Remove proxy, use environment variables for all API endpoints"
git push origin test
```

GitHub Actions sẽ tự động:

1. Build frontend với các biến môi trường từ GitHub Secrets/Variables
2. Deploy lên `/var/www/html/nmcnpm.lethanhcong.site/`
3. Restart nginx

---

## 🔍 GIẢI QUYẾT LỖI 403/500

### Lỗi 403 Forbidden

**Nguyên nhân:**

- Nginx không có quyền đọc file
- File index.html không tồn tại

**Cách fix:**

```bash
# Kiểm tra file có tồn tại không
ls -la /var/www/html/nmcnpm.lethanhcong.site/

# Cấp quyền đúng
sudo chown -R www-data:www-data /var/www/html/nmcnpm.lethanhcong.site/
sudo chmod -R 755 /var/www/html/nmcnpm.lethanhcong.site/

# Kiểm tra nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Lỗi 500 Internal Server Error

**Nguyên nhân:**

- Backend service không chạy
- Biến môi trường chưa được set đúng trong build
- CORS issue

**Cách fix:**

```bash
# Kiểm tra backend có chạy không
curl http://localhost:8888/health
curl http://localhost:9999/health
curl http://localhost:8003/health

# Kiểm tra Docker containers
docker ps

# Xem logs
docker logs api-gateway
docker logs backendai_api

# Kiểm tra file .env trong dist có đúng không
cat /var/www/html/nmcnpm.lethanhcong.site/assets/index-*.js | grep VITE_
```

### CORS Issues

Nếu gặp lỗi CORS, thêm vào backend:

**Backend Social (Java):**

```java
@CrossOrigin(origins = {"https://nmcnpm.lethanhcong.site"})
```

**Backend AI (Django):**

```python
CORS_ALLOWED_ORIGINS = [
    "https://nmcnpm.lethanhcong.site",
]
```

---

## 📊 KIỂM TRA SAU KHI DEPLOY

### 1. Frontend Build

```bash
cd src/frontend
npm run build
ls -la dist/
```

### 2. Environment Variables trong Build

```bash
# Kiểm tra file JS có chứa biến môi trường
grep -r "VITE_API_GATEWAY" dist/
```

### 3. API Calls

Mở DevTools → Network:

- Requests đi đến đúng URL không?
- Status code là gì?
- Response có đúng không?

### 4. Backend Health Check

```bash
curl https://nmcnpm-api.lethanhcong.site/health
curl https://nmcnpm-api-ai.lethanhcong.site/health
curl https://nmcnpm-comment.lethanhcong.site/health
```

---

## 🎯 TÓM TẮT THAY ĐỔI

| File                  | Thay đổi                                                        |
| --------------------- | --------------------------------------------------------------- |
| `vite.config.js`      | ❌ Xóa tất cả proxy, chỉ giữ `host: true`                       |
| `.env.example`        | ✅ Thêm `VITE_SOCKET_COMMENT_URL`, `VITE_FIREBASE_DATABASE_URL` |
| `deploy.yaml`         | ✅ Thêm biến môi trường thiếu                                   |
| `axiosClient.js`      | ✅ Đã dùng `VITE_API_GATEWAY`                                   |
| `aiApi.js`            | ✅ Đã dùng `VITE_AI_API_URL`                                    |
| `commentApi.js`       | ✅ Đã dùng `VITE_COMMENT_API_URL`                               |
| `communicationApi.js` | ✅ Đã dùng `VITE_FILE_UPLOAD_URL`                               |
| `MessagesPage.jsx`    | ✅ Đã dùng `VITE_SOCKET_URL`                                    |
| `CommentSection.jsx`  | ✅ Đã dùng `VITE_SOCKET_COMMENT_URL`                            |

Tất cả các API giờ đều gọi trực tiếp qua biến môi trường, không còn proxy!
