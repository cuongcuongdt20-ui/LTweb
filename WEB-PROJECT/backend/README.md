# MiniJira Backend

## Yeu cau

- JDK 17
- Maven
- MySQL

## Cau hinh

Cap nhat cau hinh database trong `src/main/resources/application.properties`.

Vi du:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ten_database
spring.datasource.username=root
spring.datasource.password=mat_khau_cua_ban
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

Neu chua co database thi tao truoc:

```sql
CREATE DATABASE ten_database;
```

## Chay du an

```bash
mvn clean install
mvn spring-boot:run
```

Server mac dinh:

```text
http://localhost:8080
```

Neu cong `8080` dang ban, doi trong file cau hinh:

```properties
server.port=8081
```

## Cau truc chinh

```text
src
 |- main
 |  |- java
 |  `- resources
 |     `- application.properties
 `- test
```

## API

Luu y: ngoai tru `/api/auth/**`, tat ca endpoint deu can header:

```http
Authorization: Bearer <JWT>
```

### Auth

- `POST /api/auth/signup` - dang ky tai khoan
- `POST /api/auth/signin` - dang nhap va nhan JWT

### Project

- `POST /api/project/create` - tao project
- `GET /api/project/my` - lay danh sach project ma nguoi dung hien tai tham gia
- `GET /api/project/{id}` - lay chi tiet project
- `PATCH /api/project/{id}` - cap nhat project, chi owner duoc phep
- `DELETE /api/project/delete/{id}` - xoa project, chi owner duoc phep

### Thanh vien project

- `POST /api/project/{id}/members` - them thanh vien theo email, chi owner duoc phep
- `GET /api/project/{id}/members` - lay danh sach thanh vien cua project

### Task

- `POST /api/project/{projectId}/tasks` - tao task, chi owner duoc phep
- `GET /api/project/{projectId}/tasks/my` - neu nguoi dung hien tai la owner thi tra ve tat ca task cua project, neu la member thi chi tra ve task duoc giao cho nguoi do trong project
- `GET /api/tasks/my` - lay tat ca task duoc giao cho nguoi dung hien tai o moi project
- `PATCH /api/project/{projectId}/tasks/{taskId}/status` - cap nhat trang thai task, chi assignee duoc phep
- `GET /api/project/{projectId}/tasks/{taskId}/history` - lay lich su thay doi trang thai task, chi project owner hoac task assignee duoc phep
- `DELETE /api/project/{projectId}/tasks/{taskId}` - xoa task, chi owner duoc phep

### Comment

- `GET /api/project/{projectId}/tasks/{taskId}/comments` - lay danh sach comment, chi project owner hoac task assignee duoc phep
- `POST /api/project/{projectId}/tasks/{taskId}/comments` - tao comment, chi project owner hoac task assignee duoc phep
- `DELETE /api/project/{projectId}/tasks/{taskId}/comments/{commentId}` - xoa comment, chi project owner hoac task assignee duoc phep

## Mau request va response

### Dang ky

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

Response:

```json
"Dang ky thanh cong!"
```

### Dang nhap

```json
POST /api/auth/signin
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "12345678"
}
```

Response:

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

### Tao project

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

Response:

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

### Lay danh sach project cua toi

```json
GET /api/project/my
Authorization: Bearer <JWT>
```

Response:

```json
[
  {
    "id": 1,
    "name": "Mini Jira Core",
    "key": "MJ",
    "description": "Core services for mini jira",
    "status": "PLANNING",
    "createdAt": "2026-03-13T10:15:30",
    "ownerId": 1,
    "ownerName": "Alice Nguyen",
    "role": "MANAGER"
  }
]
```

### Lay chi tiet project

```json
GET /api/project/1
Authorization: Bearer <JWT>
```

Response:

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

### Cap nhat project

```json
PATCH /api/project/1
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "name": "Mini Jira Core API",
  "description": "Updated backend scope",
  "status": "IN_PROGRESS"
}
```

Response:

```json
{
  "id": 1,
  "name": "Mini Jira Core API",
  "key": "MJ",
  "description": "Updated backend scope",
  "status": "IN_PROGRESS",
  "createdAt": "2026-03-13T10:15:30",
  "ownerId": 1,
  "ownerName": "Alice Nguyen"
}
```

### Them thanh vien

```json
POST /api/project/1/members
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "email": "bob@example.com",
  "role": "MEMBER"
}
```

Response:

```json
{
  "id": 10,
  "projectId": 1,
  "userId": 2,
  "userName": "Bob Tran",
  "userEmail": "bob@example.com",
  "role": "MEMBER",
  "joinedAt": "2026-03-13T10:25:00",
  "leftAt": null
}
```

### Lay danh sach thanh vien

```json
GET /api/project/1/members
Authorization: Bearer <JWT>
```

Response:

```json
[
  {
    "id": 10,
    "projectId": 1,
    "userId": 2,
    "userName": "Bob Tran",
    "userEmail": "bob@example.com",
    "role": "MEMBER",
    "joinedAt": "2026-03-13T10:25:00",
    "leftAt": null
  }
]
```

### Tao task

```json
POST /api/project/1/tasks
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "title": "Fix login bug",
  "description": "Redirect loop after signin",
  "assigneeEmail": "bob@example.com",
  "priority": "HIGH",
  "estimatedHours": 6,
  "dueDate": "2026-03-20T18:00:00"
}
```

Response:

```json
{
  "id": 5,
  "projectId": 1,
  "title": "Fix login bug",
  "description": "Redirect loop after signin",
  "status": null,
  "priority": "HIGH",
  "progress": null,
  "estimatedHours": 6.0,
  "actualHours": null,
  "startedAt": null,
  "completedAt": null,
  "dueDate": "2026-03-20T18:00:00",
  "createdAt": "2026-03-19T09:00:00",
  "updatedAt": "2026-03-19T09:00:00",
  "assigneeId": 2,
  "assigneeName": "Bob Tran",
  "assigneeEmail": "bob@example.com",
  "reporterId": 1,
  "reporterName": "Alice Nguyen"
}
```

### Lay task cua toi trong project

```json
GET /api/project/1/tasks/my
Authorization: Bearer <JWT>
```

Response:

```json
[
  {
    "id": 5,
    "projectId": 1,
    "title": "Fix login bug",
    "description": "Redirect loop after signin",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "progress": null,
    "estimatedHours": 6.0,
    "actualHours": null,
    "startedAt": "2026-03-19T09:05:00",
    "completedAt": null,
    "dueDate": "2026-03-20T18:00:00",
    "createdAt": "2026-03-19T09:00:00",
    "updatedAt": "2026-03-19T09:05:00",
    "assigneeId": 2,
    "assigneeName": "Bob Tran",
    "assigneeEmail": "bob@example.com",
    "reporterId": 1,
    "reporterName": "Alice Nguyen"
  }
]
```

Luu y:

- Neu nguoi dung hien tai la owner cua project `1`, endpoint nay tra ve tat ca task trong project.
- Neu nguoi dung hien tai la member cua project `1`, endpoint nay chi tra ve task duoc giao cho nguoi do.

### Lay tat ca task duoc giao

```json
GET /api/tasks/my
Authorization: Bearer <JWT>
```

Response:

```json
[
  {
    "id": 5,
    "projectId": 1,
    "title": "Fix login bug",
    "description": "Redirect loop after signin",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "progress": null,
    "estimatedHours": 6.0,
    "actualHours": null,
    "startedAt": "2026-03-19T09:05:00",
    "completedAt": null,
    "dueDate": "2026-03-20T18:00:00",
    "createdAt": "2026-03-19T09:00:00",
    "updatedAt": "2026-03-19T09:05:00",
    "assigneeId": 2,
    "assigneeName": "Bob Tran",
    "assigneeEmail": "bob@example.com",
    "reporterId": 1,
    "reporterName": "Alice Nguyen"
  }
]
```

### Cap nhat trang thai task

```json
PATCH /api/project/1/tasks/5/status
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "status": "DONE"
}
```

Response:

```json
{
  "id": 5,
  "projectId": 1,
  "title": "Fix login bug",
  "description": "Redirect loop after signin",
  "status": "DONE",
  "priority": "HIGH",
  "progress": null,
  "estimatedHours": 6.0,
  "actualHours": null,
  "startedAt": "2026-03-19T09:05:00",
  "completedAt": "2026-03-19T10:00:00",
  "dueDate": "2026-03-20T18:00:00",
  "createdAt": "2026-03-19T09:00:00",
  "updatedAt": "2026-03-19T10:00:00",
  "assigneeId": 2,
  "assigneeName": "Bob Tran",
  "assigneeEmail": "bob@example.com",
  "reporterId": 1,
  "reporterName": "Alice Nguyen"
}
```

Luu y:

- Khi trang thai task thay doi thuc su, backend tu dong tao mot ban ghi `task_history`.
- Lich su se luu `oldStatus`, `newStatus`, `progressAtThatTime`, `changedAt` va nguoi thuc hien thay doi.

### Lay lich su task

```json
GET /api/project/1/tasks/5/history
Authorization: Bearer <JWT>
```

Response:

```json
[
  {
    "id": 21,
    "taskId": 5,
    "projectId": 1,
    "oldStatus": "IN_PROGRESS",
    "newStatus": "DONE",
    "progressAtThatTime": 0,
    "changedAt": "2026-03-19T10:00:00",
    "userId": 2,
    "userName": "Bob Tran",
    "userEmail": "bob@example.com"
  },
  {
    "id": 20,
    "taskId": 5,
    "projectId": 1,
    "oldStatus": "TODO",
    "newStatus": "IN_PROGRESS",
    "progressAtThatTime": 0,
    "changedAt": "2026-03-19T09:05:00",
    "userId": 2,
    "userName": "Bob Tran",
    "userEmail": "bob@example.com"
  }
]
```

### Cac endpoint xoa

- `DELETE /api/project/delete/{id}` -> `204 No Content`
- `DELETE /api/project/{projectId}/tasks/{taskId}` -> `204 No Content`
- `DELETE /api/project/{projectId}/tasks/{taskId}/comments/{commentId}` -> `204 No Content`

### API comment

#### 1. Lay danh sach comment

Dung endpoint nay de lay tat ca comment cua mot task.

- Method: `GET`
- URL: `/api/project/{projectId}/tasks/{taskId}/comments`
- Authorization: `Bearer <JWT>`
- Quyen truy cap: project owner hoac task assignee
- Thu tu: comment cu nhat dung truoc theo `createdAt`

Vi du request:

```json
GET /api/project/1/tasks/5/comments
Authorization: Bearer <JWT>
```

Response thanh cong: `200 OK`

```json
[
  {
    "id": 11,
    "taskId": 5,
    "projectId": 1,
    "content": "I am checking the login flow now.",
    "createdAt": "2026-03-19T09:40:00",
    "userId": 2,
    "userName": "Bob Tran",
    "userEmail": "bob@example.com"
  },
  {
    "id": 12,
    "taskId": 5,
    "projectId": 1,
    "content": "Please update the redirect handling for expired token.",
    "createdAt": "2026-03-19T10:10:00",
    "userId": 1,
    "userName": "Alice Nguyen",
    "userEmail": "alice@example.com"
  }
]
```

Co the gap cac loi:

- `401 Unauthorized` - thieu JWT hoac JWT khong hop le
- `403 Forbidden` - nguoi dung hien tai khong phai project owner va cung khong phai task assignee
- `404 Not Found` - task khong ton tai trong project

Vi du loi:

```json
{
  "error": "Ban khong co quyen xem comment trong task nay"
}
```

#### 2. Tao comment

Dung endpoint nay de them comment vao task.

- Method: `POST`
- URL: `/api/project/{projectId}/tasks/{taskId}/comments`
- Authorization: `Bearer <JWT>`
- Quyen truy cap: project owner hoac task assignee

Request body:

```json
{
  "content": "Please update the redirect handling for expired token."
}
```

Rang buoc:

- `content` la bat buoc
- `content` khong duoc rong
- `content` toi da `5000` ky tu

Vi du request:

```json
POST /api/project/1/tasks/5/comments
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "content": "Please update the redirect handling for expired token."
}
```

Response thanh cong: `201 Created`

```json
{
  "id": 12,
  "taskId": 5,
  "projectId": 1,
  "content": "Please update the redirect handling for expired token.",
  "createdAt": "2026-03-19T10:10:00",
  "userId": 1,
  "userName": "Alice Nguyen",
  "userEmail": "alice@example.com"
}
```

Co the gap cac loi:

- `400 Bad Request` - `content` rong hoac vuot qua `5000` ky tu
- `401 Unauthorized` - thieu JWT hoac JWT khong hop le
- `403 Forbidden` - nguoi dung hien tai khong phai project owner va cung khong phai task assignee
- `404 Not Found` - task khong ton tai trong project

Vi du loi:

```json
{
  "error": "Ban khong co quyen comment trong task nay"
}
```

#### 3. Xoa comment

Dung endpoint nay de xoa comment khoi task.

- Method: `DELETE`
- URL: `/api/project/{projectId}/tasks/{taskId}/comments/{commentId}`
- Authorization: `Bearer <JWT>`
- Quyen truy cap: project owner hoac task assignee

Vi du request:

```json
DELETE /api/project/1/tasks/5/comments/12
Authorization: Bearer <JWT>
```

Response thanh cong: `204 No Content`

Co the gap cac loi:

- `401 Unauthorized` - thieu JWT hoac JWT khong hop le
- `403 Forbidden` - nguoi dung hien tai khong phai project owner va cung khong phai task assignee
- `404 Not Found` - task hoac comment khong ton tai

Vi du loi:

```json
{
  "error": "Khong tim thay comment id=12"
}
```

## Loi thuong gap

- `400 Bad Request` - du lieu gui len khong hop le
- `401 Unauthorized` - dang nhap that bai, thieu JWT, hoac JWT khong hop le
- `403 Forbidden` - khong du quyen truy cap
- `404 Not Found` - khong tim thay project, user hoac task
- `409 Conflict` - trung du lieu, trang thai khong hop le, hoac xung dot du lieu lien quan

Vi du:

```json
{
  "error": "Nguoi duoc giao khong la thanh vien cua project"
}
```
