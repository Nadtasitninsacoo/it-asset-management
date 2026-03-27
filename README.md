# 🛡️ IT Asset Management System (CORE INTEL)

ระบบบริหารจัดการอุปกรณ์ไอทีระดับองค์กร พัฒนาด้วยโครงสร้าง **NestJS** และระบบจัดการฐานข้อมูล **Prisma ORM** เน้นความปลอดภัยและการจัดการข้อมูลที่มีประสิทธิภาพสูง

## 🚀 เทคโนโลยีหลัก (Tech Stack)
* **Backend:** [NestJS](https://nestjs.com/) (TypeScript)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Security:** JWT (JSON Web Token) & Bcrypt Password Hashing
* **Validation:** Class-validator & Class-transformer

---

## 🛠️ ขั้นตอนการติดตั้งและรันโปรเจกต์ (Local Setup Guide)

เพื่อให้ท่านสามารถตรวจสอบการทำงานของระบบในเครื่องได้สำเร็จ กรุณาทำตามขั้นตอนดังนี้:

### 1. การเตรียมความพร้อม (Prerequisites)
* ติดตั้ง [Node.js](https://nodejs.org/) (เวอร์ชัน 18 หรือใหม่กว่า)
* ติดตั้ง [PostgreSQL](https://www.postgresql.org/download/) และสร้างฐานข้อมูลรอไว้

### 2. การติดตั้ง Dependencies
เข้าไปที่โฟลเดอร์ `backend` แล้วใช้คำสั่ง:
```bash
cd backend
npm install
