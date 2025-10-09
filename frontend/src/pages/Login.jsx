import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

const AnimatedInput = ({ icon: Icon, ...props }) => (
  <div className="relative flex items-center">
    <Icon className="absolute left-4 text-gray-400" size={20} />
    <Input
      className="w-full h-14 pl-4 pr-12 text-lg bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-0 transition-all duration-300"
      {...props}
    />
  </div>
);

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, isLoading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] px-4" dir="rtl">
      <div
        className={`w-full max-w-lg p-8 md:p-12 space-y-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      >
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tighter text-gray-900">
            أهلاً بعودتك
          </h1>
          <p className="text-xl text-gray-500">
            سجل الدخول لمتابعة صفقاتك.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
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
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <ArrowRight className="ml-4 h-6 w-6 transform transition-transform duration-300 group-hover:translate-x-2" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-md text-gray-500">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            أنشئ حسابًا جديدًا
          </Link>
        </p>
      </div>
    </div>
  );
}
