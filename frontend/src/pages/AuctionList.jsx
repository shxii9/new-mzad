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
