import axios from "axios";
import { showLoader, hideLoader } from '../redux/slices/globalLoaderSlice.js';

let storeRef = null;

export const injectStore = (_store) => {
    storeRef = _store;
};

const api = axios.create({
    // baseURL: 'http://192.168.0.70:3000',
    baseURL: 'https://backend.udyamikutumba.com',
});

api.interceptors.request.use(
    (config) => {
        if (storeRef) {
            storeRef.dispatch(showLoader());
        }
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        if (storeRef) {
            storeRef.dispatch(hideLoader());
        }
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (res) => {
        if (storeRef) {
            storeRef.dispatch(hideLoader());
        }
        return res;
    },
    (err) => {
        if (storeRef) {
            storeRef.dispatch(hideLoader());
        }
        return Promise.reject(err);
    }
);

export default api;