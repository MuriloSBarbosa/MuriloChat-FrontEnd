import axios from "axios";

const ip = {
    localhost: "localhost",
    ip: "10.18.7.53"
}

export const ipUse = ip.localhost;

const axiosInstance = axios.create({
    baseURL: `http://${ipUse}:8080`,
    timeout: 1000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
})

export default axiosInstance;

