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
