import axios from "axios";

const api = axios.create({
    // baseURL: 'http://192.168.0.70:3000',
    baseURL: 'https://udyami-circle-db.onrender.com',
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api