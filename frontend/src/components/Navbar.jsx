import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Gavel, LogOut, User, LayoutDashboard, PlusCircle, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center" dir="rtl">
        <Link to="/" className="mr-auto flex items-center gap-2">
          <Gavel className="h-7 w-7 text-blue-600" />
          <span className="text-xl font-bold tracking-tight">مزادي</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-foreground/60 transition-colors hover:text-foreground/80">
            المزادات الحالية
          </Link>
          {user && (
            <Link to="/dashboard" className="text-foreground/60 transition-colors hover:text-foreground/80">
              لوحة التحكم
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3 ml-4">
          {user ? (
            <>
              <Button asChild className="hidden sm:flex">
                <Link to="/create-auction">
                  <PlusCircle className="ml-2 h-5 w-5" />
                  أضف مزادًا
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" dir="rtl">
                  <DropdownMenuLabel>أهلاً, {user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="ml-2 h-4 w-4" />
                    <span>لوحة التحكم</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                    <LogOut className="ml-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild>
                <Link to="/register">إنشاء حساب</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
