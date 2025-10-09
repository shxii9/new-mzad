import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"; // 1. استيراد Toaster الجديد

// استيراد المكونات الأساسية
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// استيراد الصفحات
import AuctionList from "./pages/AuctionList";
import AuctionDetails from "./pages/AuctionDetails";
import CreateAuction from "./pages/CreateAuction";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VendorDashboard from "./pages/VendorDashboard";
// import AdminCategory from "./pages/AdminCategory"; // يمكنك إعادة تفعيله لاحقًا

function App() {
  return (
    <Router>
      {/* وضع Toaster هنا ليظهر فوق كل شيء */}
      <Toaster />
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* --- المسارات العامة --- */}
            <Route path="/" element={<AuctionList />} />
            <Route path="/auctions/:id" element={<AuctionDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* --- المسارات المحمية --- */}
            <Route 
              path="/create-auction" 
              element={
                <ProtectedRoute>
                  <CreateAuction />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <VendorDashboard />
                </ProtectedRoute>
              } 
            />

            {/* --- مسار المدير (مثال) --- */}
            {/*
            <Route 
              path="/admin/categories" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCategory />
                </ProtectedRoute>
              } 
            />
            */}
            
            {/* يمكنك إضافة صفحة 404 هنا */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
