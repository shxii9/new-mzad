// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-dark text-white text-center py-3 mt-5 shadow-lg">
            <div dir="rtl" className="container">
                <p className="mb-0">
                    &copy; {new Date().getFullYear()} نظام المزادات الإلكتروني. تم التصميم بعناية فائقة.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
