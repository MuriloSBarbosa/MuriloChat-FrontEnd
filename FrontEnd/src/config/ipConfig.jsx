import axios from "axios";

export const ipUse = "localhost";

const axiosInstance = axios.create({
    baseURL: `http://${ipUse}:8080`,
    timeout: 1000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
})

axiosInstance.interceptors.request.use((config) => {
    const tokenUsuario = sessionStorage.getItem('token');

    if (tokenUsuario) {
        config.headers['authorization'] = `Bearer ${tokenUsuario}`;
    }

    return config;
});

export default axiosInstance;

