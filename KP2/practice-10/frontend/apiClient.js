import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
})

apiClient.interceptors.request.use(
    (config) => {
        let accessToken = localStorage.getItem("accessToken");
        if (accessToken)
            config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
    },
    (error) => {
        throw error;
    }
)

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalResponse = error.config;

        if (error.response?.status === 401 && !originalResponse._retry) {
            originalResponse._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const response = await axios.post(
                    "http://localhost:3000/api/auth/refresh",
                    {refreshToken}
                );

                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem("refreshToken", response.data.refreshToken);
                originalResponse.headers.Authorization = `Bearer ${response.data.accessToken}`;

                return apiClient(originalResponse);

            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                console.error('Refresh token error:', refreshError);
                throw refreshError;
            }
        }
        console.error('Error:', error)
        throw error;
    }
)

async function getProducts() {
    try {
        const response = await apiClient.get('')
    } catch (error) {
        console.log("Get products error:", error.response?.data?.error);
        throw error;
    }
}

async function createProduct(productData) {
    try {
        const response = await apiClient.post('/auth/products', productData);
        return response.data;
    } catch (error) {
        console.error("Create product error:", error.response?.data?.error);
        throw error;
    }
}

