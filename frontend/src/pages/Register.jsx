import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

const AnimatedInput = ({ icon: Icon, ...props }) => (
  <div className="relative flex items-center">
    <Icon className="absolute left-4 text-gray-400" size={20} />
    <Input
      className="w-full h-14 pl-4 pr-12 text-lg bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all duration-300"
      {...props}
    />
  </div>
);

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, isLoading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, email, password } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const success = await register(name, email, password);
    if (success) {
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    }
  };

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
  }, []);

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center animate-fade-in-up">
        <CheckCircle className="text-green-500 w-24 h-24 mb-6 animate-subtle-pulse" />
        <h1 className="text-4xl font-bold text-gray-800">تم بنجاح!</h1>
        <p className="mt-2 text-lg text-gray-600">أهلاً بك في عالم المزادات. جاري توجيهك...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] px-4" dir="rtl">
      <div
        className={`w-full max-w-lg p-8 md:p-12 space-y-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      >
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tighter text-gray-900">
            ابدأ رحلتك
          </h1>
          <p className="text-xl text-gray-500">
            خطوة واحدة تفصلك عن أفضل الصفقات.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <AnimatedInput
            icon={User}
            id="name"
            name="name"
            type="text"
            placeholder="الاسم الكامل"
            value={name}
            onChange={onChange}
            required
          />
          <AnimatedInput
            icon={Mail}
            id="email"
            name="email"
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={onChange}
            required
          />
          <AnimatedInput
            icon={Lock}
            id="password"
            name="password"
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={onChange}
            required
          />

          {error && <p className="text-sm font-medium text-red-500 text-center pt-2">{error}</p>}

          <Button
            type="submit"
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-gray-800 to-black text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <>
                <span>إنشاء حساب</span>
                <ArrowRight className="ml-4 h-6 w-6 transform transition-transform duration-300 group-hover:translate-x-2" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-md text-gray-500">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            سجّل الدخول من هنا
          </Link>
        </p>
      </div>
    </div>
  );
}
