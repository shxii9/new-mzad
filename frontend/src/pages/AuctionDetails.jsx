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
