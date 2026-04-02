import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './admin/AdminDashboard';
import ManageAssets from './admin/ManageAssets';
import BorrowAssets from './user/BorrowAssets';
import MyHistory from './admin/MyHistory';
import ProtectedRoute from './components/ProtectedRoute';
import ManageUsers from './admin/ManageUsers';
import ManageRequests from './admin/ManageRequests';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🛡️ Protected Zone: ต้อง Login เท่านั้น */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            {/* 🧑‍🚀 พื้นที่ส่วนกลาง (User และ Admin เข้าได้ทั้งคู่) */}
            <Route index element={<Navigate to="/borrow-assets" replace />} />
            <Route path="borrow-assets" element={<BorrowAssets />} />
            <Route path="my-history" element={<MyHistory />} />

            {/* 👑 เขตบัญชาการ (เฉพาะ ADMIN เท่านั้นที่ผ่านด่านนี้ได้) */}
            <Route element={<ProtectedRoute roleRequired="ADMIN" />}>
              <Route path="admin-dashboard" element={<AdminDashboard />} />
              <Route path="manage-assets" element={<ManageAssets />} />
              <Route path="manage-users" element={<ManageUsers />} />
              <Route path="manage-requests" element={<ManageRequests />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;