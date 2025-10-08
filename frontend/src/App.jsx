// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// الصفحات الرئيسية
import AuctionList from './pages/AuctionList';
import AuctionDetails from './pages/AuctionDetails';
// صفحات المصادقة (التسجيل والدخول)
import Login from './Login';
import Register from './Register';

// صفحات التاجر والمدير
import CreateAuction from './pages/CreateAuction';
import VendorDashboard from './pages/VendorDashboard';
import CategoryManagement from './pages/CategoryManagement';

// مسارات الحماية
import AdminRoute from './components/AdminRoute';
import VendorRoute from './components/VendorRoute';

const App = () => {
  return (
    <Router>
      <Navbar />
      <main className="container-fluid py-3 main-content">
        <Routes>
          {/* مسارات عامة للجميع */}
          <Route path="/" element={<AuctionList />} />
          <Route path="/auctions/:id" element={<AuctionDetails />} />
          
          {/* 🔴 المسارات التي كنت تفتقدها 
             - تم وضعها في نقطة دخول الملف (src) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* مسارات التاجر (تتطلب تسجيل دخول كـ user أو admin) */}
          <Route element={<VendorRoute />}>
            <Route path="/vendor/create-auction" element={<CreateAuction />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          </Route>
          

          {/* مسارات المدير (تتطلب تسجيل دخول كـ admin فقط) */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/categories" element={<CategoryManagement />} />
          </Route>

        </Routes>
      </main>
      <Footer />
      <ToastContainer position="bottom-right" />
    </Router>
  );
};

export default App;
