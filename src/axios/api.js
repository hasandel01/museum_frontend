import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    // other configurations
});

export default axiosInstance;
