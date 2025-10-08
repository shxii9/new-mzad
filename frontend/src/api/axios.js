// src/api/axios.js
import axios from 'axios';

// العنوان الأساسي لجميع طلبات API، يوجه إلى الواجهة الخلفية على المنفذ 3000
const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});

export default api;
