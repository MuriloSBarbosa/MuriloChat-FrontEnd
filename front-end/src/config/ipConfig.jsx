import axios from "axios";

const ip = {
    localhost: "localhost",
    ip: "10.18.7.53"
}

const axiosInstance = axios.create({
    baseURL: `http://${ip.localhost}:8080`,
    timeout: 1000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
})

export default axiosInstance;

