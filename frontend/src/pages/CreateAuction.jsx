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
