import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// استيراد المكونات الهيكلية
import Login from './Login';
import Register from './Register';
import AuctionList from './pages/AuctionList';

// استيراد مكونات المدير والحماية
import CategoryManagement from './pages/admin/CategoryManagement';
import AdminRoute from './AdminRoute'; // <--- المكون الجديد

const Layout = ({ children }) => (
    <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark" dir="rtl">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">نظام المزادات</Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">المزادات (الرئيسية)</Link>
                        </li>
                    </ul>
                    {/* رابط لوحة تحكم المدير - سيتم إخفاؤه لاحقًا إذا لم يكن admin */}
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/categories">إدارة الفئات</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/login">تسجيل الدخول</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <div className="container mt-4">
            {children}
        </div>
    </div>
);

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    {/* المسار الرئيسي للمستخدم العادي (التاجر) */}
                    <Route path="/" element={<AuctionList />} /> 
                    
                    {/* مسارات المصادقة */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* --------------------------------------------------- */}
                    {/* حماية مسار المدير باستخدام AdminRoute */}
                    <Route element={<AdminRoute />}> 
                        <Route path="/admin/categories" element={<CategoryManagement />} />
                    </Route>
                    {/* --------------------------------------------------- */}
                    
                </Routes>
            </Layout>
            <ToastContainer position="bottom-right" theme="colored" />
        </Router>
    );
}

export default App;
