import React, { createContext, useReducer, useEffect } from 'react';

// 1. تعريف الحالة الأولية
// نحاول قراءة بيانات المستخدم من localStorage عند بدء التشغيل
const initialState = {
    user: null,
    token: null,
};

try {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
        initialState.user = JSON.parse(storedUser);
        initialState.token = storedToken;
    }
} catch (error) {
    console.error("Failed to parse user from localStorage", error);
    localStorage.clear(); // تنظيف في حالة وجود بيانات تالفة
}


// 2. إنشاء الـ Reducer لإدارة تغييرات الحالة
// الـ Reducer هو دالة نقية تحدد كيف تتغير الحالة بناءً على الإجراءات (actions)
const AuthReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                user: action.payload.user,
                token: action.payload.token,
            };
        case 'LOGOUT':
            return {
                user: null,
                token: null,
            };
        default:
            return state;
    }
};

// 3. إنشاء الـ Context
export const AuthContext = createContext(initialState);

// 4. إنشاء الـ Provider (المُزوِّد)
// هذا المكون سيُغلِّف التطبيق بأكمله ويوفر الحالة والوظائف للمكونات الداخلية
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, initialState);

    // استخدام useEffect لمزامنة الحالة مع localStorage
    useEffect(() => {
        try {
            if (state.user && state.token) {
                localStorage.setItem('user', JSON.stringify(state.user));
                localStorage.setItem('token', state.token);
            } else {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error("Failed to save to localStorage", error);
        }
    }, [state.user, state.token]);

    // الوظائف التي ستكون متاحة للمكونات
    const login = (userData, token) => {
        dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: userData, token: token },
        });
    };

    const logout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <AuthContext.Provider
            value={{
                user: state.user,
                token: state.token,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
