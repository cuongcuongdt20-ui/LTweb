# 🚀 Hướng Dẫn Cấu Hình & Chạy Project

## 📌 1. Yêu cầu môi trường

* **JDK 17** (Bắt buộc)
* Maven
* MySQL Server
* IDE: IntelliJ / VSCode / Eclipse (tùy chọn)

---

## ☕ 2. Cấu hình JDK 17

Project được build với **JDK 17**.

Nếu máy bạn đang dùng JDK khác, hãy chỉnh lại trong file:

```
pom.xml
```

Tìm đoạn:

```xml
<properties>
    <java.version>17</java.version>
</properties>
```

Hoặc:

```xml
<maven.compiler.source>17</maven.compiler.source>
<maven.compiler.target>17</maven.compiler.target>
```

👉 Đảm bảo giá trị là **17**

Sau đó kiểm tra lại bằng lệnh:

```bash
java -version
```

---

## 🧹 3. Xóa cấu hình riêng của VSCode (nếu có)

Để project phù hợp với từng máy:

* Xóa thư mục:

```
.vscode
```

Thư mục này chứa cấu hình riêng của từng môi trường nên không nên dùng chung.

---

## 🗄 4. Cấu hình kết nối MySQL

Mở file:

```
src/main/resources/application.properties
```

Hoặc:

```
application.yml
```

### Ví dụ cấu hình:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ten_database
spring.datasource.username=root
spring.datasource.password=mat_khau_cua_ban
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### ⚠️ Lưu ý:

* Thay `ten_database` bằng tên database trong máy bạn
* Thay `username` và `password` đúng với MySQL của bạn

---

## 🏗 5. Tạo Database (nếu chưa có)

Vào MySQL và chạy:

```sql
CREATE DATABASE ten_database;
```

---

## ▶ 6. Chạy Project

Dùng Maven:

```bash
mvn clean install
mvn spring-boot:run
```

Hoặc chạy trực tiếp từ IDE.

Nếu thành công, server sẽ chạy tại:

```
http://localhost:8080
```

---

## ❗ Các lỗi thường gặp

### 🔴 Port 8080 đã được sử dụng

* Tắt ứng dụng đang dùng port 8080
  hoặc
* Đổi port trong `application.properties`:

```properties
server.port=8081
```

---

## 📂 Cấu trúc thư mục chính

```
src
 ├── main
 │   ├── java
 │   └── resources
 │       └── application.properties
 └── test
```

---

## ✅ Tóm tắt các bước cần làm khi clone project

1. Cài JDK 17
2. Sửa lại `pom.xml` nếu cần
3. Xóa thư mục `.vscode`
4. Cấu hình lại MySQL trong `application`
5. Tạo database
6. Chạy project

---

# 🎉 Chúc bạn chạy project thành công!

---

## API Endpoints (REST)

Lưu ý: Trừ các route `/api/auth/**`, mọi endpoint đều yêu cầu header `Authorization: Bearer <JWT>`.

- Auth
  - POST `/api/auth/signup` — đăng ký tài khoản
  - POST `/api/auth/signin` — đăng nhập, trả JWT
- Project
  - POST `/api/project/create` — tạo project mới (201 Created + Location)
  - GET  `/api/project/{id}` — lấy chi tiết project
  - DELETE `/api/project/delete/{id}` — xóa project (chỉ owner)

### JSON Tests — Auth

Đăng ký:
```json
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Alice Nguyen",
  "email": "alice@example.com",
  "password": "12345678",
  "avatarUrl": "https://example.com/a.png"
}
```
Phản hồi (200 OK):
```json
"Đăng ký thành công!"
```

Đăng nhập:
```json
POST /api/auth/signin
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "12345678"
}
```
Phản hồi (200 OK):
```json
{
  "token": "<JWT>",
  "type": "Bearer",
  "user": {
    "id": 1,
    "name": "Alice Nguyen",
    "email": "alice@example.com",
    "avatarUrl": "https://example.com/a.png"
  }
}
```

### JSON Tests — Project

Tạo mới project:
```json
POST /api/project/create
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "name": "Mini Jira Core",
  "key": "mj",
  "description": "Core services for mini jira"
}
```
Phản hồi (201 Created) + Header `Location: /api/project/1`:
```json
{
  "id": 1,
  "name": "Mini Jira Core",
  "key": "MJ",
  "description": "Core services for mini jira",
  "status": "PLANNING",
  "createdAt": "2026-03-13T10:15:30",
  "ownerId": 1,
  "ownerName": "Alice Nguyen"
}
```

Lấy chi tiết project:
```json
GET /api/project/1
Authorization: Bearer <JWT>
```
Phản hồi (200 OK):
```json
{
  "id": 1,
  "name": "Mini Jira Core",
  "key": "MJ",
  "description": "Core services for mini jira",
  "status": "PLANNING",
  "createdAt": "2026-03-13T10:15:30",
  "ownerId": 1,
  "ownerName": "Alice Nguyen"
}
```

Xóa project (chỉ owner):
```json
DELETE /api/project/delete/1
Authorization: Bearer <JWT>
```
Phản hồi (204 No Content): không có body.

### JSON Errors — ví dụ

- 400 Bad Request (vi phạm validation: thiếu name/key,…)
  (Trả mặc định bởi Spring Validation; ví dụ minh họa)
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Key không được để trống",
  "path": "/api/project/create"
}
```

- 409 Conflict (key đã tồn tại hoặc đang bị tham chiếu khi xóa)
```json
{
  "error": "Key project đã tồn tại: MJ"
}
```

- 403 Forbidden (không phải owner khi xóa)
```json
{
  "error": "Bạn không có quyền xóa project này"
}
```

- 404 Not Found (không tìm thấy project)
```json
{
  "error": "Không tìm thấy project id=999"
}
```

### Gợi ý dùng curl (tùy chọn)

```bash
# Đăng nhập
curl -sS -X POST http://localhost:8080/api/auth/signin \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"12345678"}'

# Tạo project
curl -sS -X POST http://localhost:8080/api/project/create \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Mini Jira Core","key":"mj","description":"Core services"}'

# Lấy chi tiết
curl -sS -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/project/1

# Xóa project
curl -sS -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/project/delete/1 -i
```
