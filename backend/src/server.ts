import express from 'express';
import cors from 'cors';
// รวมการ Import ทั้ง Auth และ Asset ไว้ที่นี่ครับ
import { register, login } from './controllers/authController';
import { addAsset, getAssets, requestBorrow } from './controllers/assetController';

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// --- ROUTES ---

app.post('/api/register', register);
app.post('/api/login', login);

app.get('/api/assets', getAssets);       // ดูอุปกรณ์ทั้งหมด
app.post('/api/assets', addAsset);      // เพิ่มอุปกรณ์ (Admin)
app.post('/api/borrow', requestBorrow); // ส่งคำขอยืม

app.get('/', (req, res) => {
    res.send('IT Asset Management System API is running...');
});

app.listen(PORT, () => {
    console.log(`[Than Jom Phon Server]: Running at http://localhost:${PORT}`);
});