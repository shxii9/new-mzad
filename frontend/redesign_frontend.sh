#!/bin/bash

# ==============================================================================
# =            <<< سكربت التجديد الشامل للواجهة الأمامية >>>                  =
# =        ( MERN Auction System - Frontend Redesign Automation )            =
# ==============================================================================

# --- إعدادات الألوان للطباعة ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}==   بدء عملية التجديد الشامل للواجهة الأمامية...   ==${NC}"
echo -e "${BLUE}=======================================================${NC}"

# --- المرحلة 0: التنظيف والإعداد ---
echo -e "\n${YELLOW}--- المرحلة 0: التنظيف والإعداد ---${NC}"

# 1. إزالة Bootstrap من package.json (إذا كان موجودًا)
echo ">> إزالة Bootstrap..."
npm uninstall bootstrap react-bootstrap

# 2. إنشاء ملف jsconfig.json لتحديد الأسماء المستعارة
echo ">> إنشاء ملف jsconfig.json..."
cat << 'EOF' > jsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ]
    }
  },
  "include": ["src"]
}
EOF

# 3. تنظيف ملف index.css
echo ">> تنظيف وإعداد src/index.css..."
cat << 'EOF' > src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# 4. تشغيل إعداد Shadcn/UI (سيقوم بتثبيت Tailwind وتوابعه)
echo ">> تشغيل إعداد Shadcn/UI..."
npx shadcn@latest init <<!
y
1
1
src/index.css
y
tailwind.config.js
@/components
@/lib/utils
n
y
!

echo -e "${GREEN}>> إعداد البيئة اكتمل بنجاح!${NC}"

# --- المرحلة 1: إضافة المكونات الأساسية ---
echo -e "\n${YELLOW}--- المرحلة 1: إضافة مكونات Shadcn/UI الأساسية ---${NC}"
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
npx shadcn@latest add date-picker
npx shadcn@latest add text-area

echo -e "${GREEN}>> تم إضافة جميع المكونات الأساسية!${NC}"

# --- المرحلة 2: إعادة كتابة الملفات الرئيسية ---
echo -e "\n${YELLOW}--- المرحلة 2: إعادة كتابة وتصميم الصفحات والمكونات ---${NC}"

# 2.1: تحديث App.jsx
echo ">> إعادة تصميم src/App.jsx..."
cat << 'EOF' > src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";
import AuctionList from "./pages/AuctionList";
import AuctionDetails from "./pages/AuctionDetails";
import CreateAuction from "./pages/CreateAuction";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VendorDashboard from "./pages/VendorDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <div className="flex flex-col min-h-screen bg-muted/40">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<AuctionList />} />
                <Route path="/auctions/:id" element={<AuctionDetails />} />
                <Route path="/vendor/create-auction" element={<ProtectedRoute><CreateAuction /></ProtectedRoute>} />
                <Route path="/vendor/dashboard" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
      <Toaster />
    </Router>
  );
}
export default App;
EOF

# 2.2: تحديث Login.jsx
echo ">> إعادة تصميم src/pages/Login.jsx..."
cat << 'EOF' > src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onSubmit = async (e) => {
        e.preventDefault();
        const success = await login(formData.email, formData.password);
        if (success) navigate('/');
    };
    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4" dir="rtl">
            <Card className="w-full max-w-md border-0 shadow-lg">
                <CardHeader className="text-center space-y-1"><CardTitle className="text-2xl">تسجيل الدخول</CardTitle><CardDescription>أدخل بياناتك للوصول إلى عالم المزادات</CardDescription></CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="email">البريد الإلكتروني</Label><Input id="email" name="email" type="email" placeholder="name@example.com" required value={formData.email} onChange={onChange} /></div>
                        <div className="space-y-2"><Label htmlFor="password">كلمة المرور</Label><Input id="password" name="password" type="password" required value={formData.password} onChange={onChange} /></div>
                        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}</Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center"><p className="text-sm text-muted-foreground">ليس لديك حساب؟ <Link to="/register" className="font-semibold text-primary hover:underline">سجل الآن</Link></p></CardFooter>
            </Card>
        </div>
    );
};
export default Login;
EOF

# 2.3: تحديث Register.jsx
echo ">> إعادة تصميم src/pages/Register.jsx..."
cat << 'EOF' > src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:3000/api/users/register', formData );
            toast({ title: "نجاح!", description: "تم إنشاء حسابك. يمكنك الآن تسجيل الدخول." });
            navigate('/login');
        } catch (err) {
            const message = err.response?.data?.message || 'فشل إنشاء الحساب.';
            toast({ variant: "destructive", title: "خطأ", description: message });
        } finally { setLoading(false); }
    };
    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4" dir="rtl">
            <Card className="w-full max-w-md border-0 shadow-lg">
                <CardHeader className="text-center space-y-1"><CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle><CardDescription>املأ النموذج أدناه للانضمام إلى منصتنا</CardDescription></CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="name">الاسم الكامل</Label><Input id="name" name="name" type="text" required value={formData.name} onChange={onChange} /></div>
                        <div className="space-y-2"><Label htmlFor="email">البريد الإلكتروني</Label><Input id="email" name="email" type="email" placeholder="name@example.com" required value={formData.email} onChange={onChange} /></div>
                        <div className="space-y-2"><Label htmlFor="password">كلمة المرور</Label><Input id="password" name="password" type="password" required value={formData.password} onChange={onChange} /></div>
                        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}</Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center"><p className="text-sm text-muted-foreground">لديك حساب بالفعل؟ <Link to="/login" className="font-semibold text-primary hover:underline">تسجيل الدخول</Link></p></CardFooter>
            </Card>
        </div>
    );
};
export default Register;
EOF

# 2.4: تحديث Navbar.jsx
echo ">> إعادة تصميم src/components/Navbar.jsx..."
cat << 'EOF' > src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FaGavel, FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaPlus } from 'react-icons/fa';
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { toast } = useToast();
    const handleLogout = () => {
        logout();
        toast({ title: "تم تسجيل الخروج", description: "نراك لاحقًا!" });
        navigate('/login');
    };
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" dir="rtl">
            <div className="container flex h-14 items-center">
                <Link to="/" className="mr-6 flex items-center space-x-2 space-x-reverse"><FaGavel className="h-6 w-6 text-primary" /><span className="font-bold sm:inline-block">مـزادي</span></Link>
                <nav className="flex flex-1 items-center space-x-4 space-x-reverse">
                    <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">المزادات</Link>
                    {user && (<Link to="/vendor/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">لوحة التحكم</Link>)}
                </nav>
                <div className="flex items-center justify-end space-x-2 space-x-reverse">
                    {user ? (
                        <>
                            <Button asChild><Link to="/vendor/create-auction"><FaPlus className="ml-2 h-4 w-4" /> إضافة مزاد</Link></Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="secondary" size="icon" className="rounded-full"><FaUserCircle className="h-5 w-5" /><span className="sr-only">Toggle user menu</span></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel><div className="flex flex-col space-y-1"><p className="text-sm font-medium leading-none">{user.name}</p><p className="text-xs leading-none text-muted-foreground">{user.email}</p></div></DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/vendor/dashboard')}><FaTachometerAlt className="mr-2 h-4 w-4" /><span>لوحة التحكم</span></DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive"><FaSignOutAlt className="mr-2 h-4 w-4" /><span>تسجيل الخروج</span></DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <nav className="flex items-center space-x-2 space-x-reverse">
                            <Button variant="ghost" asChild><Link to="/login">تسجيل الدخول</Link></Button>
                            <Button asChild><Link to="/register">تسجيل جديد</Link></Button>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
};
export default Navbar;
EOF

# 2.5: تحديث AuctionList.jsx
echo ">> إعادة تصميم src/pages/AuctionList.jsx..."
cat << 'EOF' > src/pages/AuctionList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCountdown } from '@/hooks/use-countdown';

const AuctionCountdown = ({ deadline }) => {
    const { days, hours, minutes, seconds, isFinished } = useCountdown(deadline);
    if (isFinished) return <span className="text-sm text-red-500">المزاد مغلق</span>;
    return <div className="text-xs text-muted-foreground">{days > 0 && `${days}ي `}{hours > 0 && `${hours}س `}{minutes > 0 && `${minutes}د `}{`${seconds}ث`}</div>;
};

const AuctionList = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/auctions' );
                setAuctions(res.data.data);
            } catch (error) { console.error("Failed to fetch auctions", error); }
            finally { setLoading(false); }
        };
        fetchAuctions();
    }, []);

    if (loading) return <div className="container py-8 text-center"><p>جاري تحميل المزادات...</p></div>;

    return (
        <div className="container py-8" dir="rtl">
            <h1 className="text-3xl font-bold mb-6">المزادات الحالية</h1>
            {auctions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {auctions.map((auction) => (
                        <Link to={`/auctions/${auction._id}`} key={auction._id}>
                            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                <CardHeader className="p-0"><img src={auction.image} alt={auction.title} className="w-full h-48 object-cover" /></CardHeader>
                                <CardContent className="p-4"><CardTitle className="text-lg mb-2 truncate">{auction.title}</CardTitle><p className="text-sm text-muted-foreground h-10 overflow-hidden">{auction.description}</p></CardContent>
                                <CardFooter className="flex justify-between items-center p-4 bg-muted/50"><div className="font-bold text-primary">{auction.currentPrice.toLocaleString()} ريال</div><AuctionCountdown deadline={auction.deadline} /></CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16"><p className="text-muted-foreground">لا توجد مزادات متاحة حاليًا.</p></div>
            )}
        </div>
    );
};
export default AuctionList;
EOF

# 2.6: تحديث AuctionDetails.jsx
echo ">> إعادة تصميم src/pages/AuctionDetails.jsx..."
cat << 'EOF' > src/pages/AuctionDetails.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '@/context/AuthContext';
import { useCountdown } from '@/hooks/use-countdown';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const AuctionDetails = () => {
    const { id } = useParams();
    const { user, token } = useContext(AuthContext);
    const { toast } = useToast();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [isBidding, setIsBidding] = useState(false);
    const { days, hours, minutes, seconds, isFinished } = useCountdown(auction?.deadline);

    const fetchAuctionDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/auctions/${id}` );
            setAuction(res.data.data);
        } catch (error) { toast({ variant: "destructive", title: "خطأ", description: "فشل في جلب تفاصيل المزاد." }); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchAuctionDetails(); }, [id]);

    const handlePlaceBid = async (e) => {
        e.preventDefault();
        setIsBidding(true);
        try {
            await axios.post(`http://localhost:3000/api/auctions/${id}/bid`, { amount: parseFloat(bidAmount ) }, { headers: { Authorization: `Bearer ${token}` } });
            toast({ title: "نجاح!", description: "تم وضع مزايدتك بنجاح." });
            setBidAmount('');
            fetchAuctionDetails();
        } catch (error) {
            const message = error.response?.data?.message || 'فشل وضع المزايدة.';
            toast({ variant: "destructive", title: "خطأ", description: message });
        } finally { setIsBidding(false); }
    };

    if (loading) return <div className="container py-8 text-center">جاري التحميل...</div>;
    if (!auction) return <div className="container py-8 text-center">لم يتم العثور على المزاد.</div>;

    return (
        <div className="container py-8" dir="rtl">
            <div className="grid md:grid-cols-2 gap-8">
                <div><img src={auction.image} alt={auction.title} className="w-full rounded-lg shadow-lg object-cover" /></div>
                <div className="flex flex-col space-y-6">
                    <Card><CardHeader><CardTitle className="text-3xl">{auction.title}</CardTitle><CardDescription>مقدم من: {auction.user.name}</CardDescription></CardHeader><CardContent><p className="text-muted-foreground">{auction.description}</p></CardContent></Card>
                    <Card>
                        <CardHeader><CardTitle>تفاصيل المزايدة</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-2xl font-bold"><span>السعر الحالي:</span><span className="text-primary">{auction.currentPrice.toLocaleString()} ريال</span></div>
                            <div className="p-4 rounded-lg bg-destructive/10 text-center">
                                <div className="text-sm text-destructive mb-2">{isFinished ? 'المزاد مغلق' : 'الوقت المتبقي'}</div>
                                {!isFinished && (<div className="flex justify-around font-mono text-2xl text-destructive"><span>{days}<small>ي</small></span><span>{hours}<small>س</small></span><span>{minutes}<small>د</small></span><span>{seconds}<small>ث</small></span></div>)}
                            </div>
                            {user && !isFinished ? (
                                <form onSubmit={handlePlaceBid} className="pt-4 space-y-2">
                                    <Input type="number" placeholder={`أدخل مبلغًا أكبر من ${auction.currentPrice}`} value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} min={auction.currentPrice + 1} required disabled={isBidding} />
                                    <Button type="submit" className="w-full" disabled={isBidding}>{isBidding ? 'جاري المزايدة...' : 'زايد الآن'}</Button>
                                </form>
                            ) : (<div className="pt-4 text-center text-muted-foreground">{isFinished ? 'لا يمكن المزايدة على مزاد منتهي.' : <Link to="/login" className="text-primary hover:underline">سجل الدخول للمزايدة</Link>}</div>)}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
export default AuctionDetails;
EOF

# 2.7: تحديث CreateAuction.jsx
echo ">> إعادة تصميم src/pages/CreateAuction.jsx..."
cat << 'EOF' > src/pages/CreateAuction.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CreateAuction = () => {
    const [formData, setFormData] = useState({ title: '', description: '', startingPrice: '', deadline: '' });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onFileChange = (e) => setImage(e.target.files[0]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('startingPrice', formData.startingPrice);
        data.append('deadline', formData.deadline);
        if (image) data.append('image', image);

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/api/auctions', data, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            } );
            toast({ title: "نجاح!", description: "تم إنشاء المزاد بنجاح." });
            navigate('/');
        } catch (err) {
            const message = err.response?.data?.message || 'فشل إنشاء المزاد.';
            toast({ variant: "destructive", title: "خطأ", description: message });
        } finally { setLoading(false); }
    };

    return (
        <div className="container py-8" dir="rtl">
            <Card className="max-w-2xl mx-auto">
                <CardHeader><CardTitle className="text-2xl">إنشاء مزاد جديد</CardTitle><CardDescription>املأ التفاصيل أدناه لبدء مزادك</CardDescription></CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="title">عنوان المزاد</Label><Input id="title" name="title" required value={formData.title} onChange={onChange} /></div>
                        <div className="space-y-2"><Label htmlFor="description">الوصف</Label><Textarea id="description" name="description" required value={formData.description} onChange={onChange} /></div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="startingPrice">السعر المبدئي (ريال)</Label><Input id="startingPrice" name="startingPrice" type="number" required value={formData.startingPrice} onChange={onChange} /></div>
                            <div className="space-y-2"><Label htmlFor="deadline">تاريخ انتهاء المزاد</Label><Input id="deadline" name="deadline" type="datetime-local" required value={formData.deadline} onChange={onChange} /></div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="image">صورة المنتج</Label><Input id="image" type="file" onChange={onFileChange} className="file:text-primary" /></div>
                        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'جاري الإنشاء...' : 'إنشاء المزاد'}</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
export default CreateAuction;
EOF

echo -e "\n${GREEN}=====================================================${NC}"
echo -e "${GREEN}==    اكتملت عملية التجديد الشامل بنجاح تام!    ==${NC}"
echo -e "${GREEN}==   الآن قم بتشغيل 'npm run dev' لرؤية السحر.   ==${NC}"
echo -e "${GREEN}=====================================================${NC}"

