import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const { token } = useContext(AuthContext);
    const { toast } = useToast();

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('http://localhost:5002/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.data);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error('فشل في جلب الإشعارات', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5002/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            toast({ variant: "destructive", title: "خطأ", description: "فشل في تحديث الإشعار" });
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('http://localhost:5002/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
            toast({ title: "نجاح", description: "تم تحديد جميع الإشعارات كمقروءة" });
        } catch (error) {
            toast({ variant: "destructive", title: "خطأ", description: "فشل في تحديث الإشعارات" });
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`http://localhost:5002/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
            toast({ title: "نجاح", description: "تم حذف الإشعار" });
        } catch (error) {
            toast({ variant: "destructive", title: "خطأ", description: "فشل في حذف الإشعار" });
        }
    };

    if (loading) return <div className="container py-8 text-center">جاري التحميل...</div>;

    return (
        <div className="container py-8" dir="rtl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <Bell className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">الإشعارات</h1>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                            {unreadCount} جديد
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button onClick={markAllAsRead} variant="outline">
                        <Check className="ml-2 h-4 w-4" />
                        تحديد الكل كمقروء
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">لا توجد إشعارات حتى الآن</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <Card 
                            key={notification._id} 
                            className={`${!notification.isRead ? 'border-r-4 border-r-primary bg-primary/5' : ''}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">{notification.title}</h3>
                                        <p className="text-muted-foreground mb-2">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(notification.createdAt).toLocaleString('ar-SA')}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {!notification.isRead && (
                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => markAsRead(notification._id)}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            onClick={() => deleteNotification(notification._id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
