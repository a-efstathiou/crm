import axios from "axios";
import TokenService from "./tokenService.js";
import authService from "./authService.js";

const instance = axios.create({
    baseURL: "http://localhost:8080/api/",
    headers: {
        "Content-Type": "application/json",
    },
});

instance.interceptors.request.use(
    (config) => {
        const token = TokenService.getLocalAccessToken();

        const publicUrls = [
            "/v1/auth/authenticate",
            "/v1/auth/refresh-token"
        ];

        if (config.url === "/v1/settings/application" && config.method.toLowerCase() === 'get') {
            return config;
        }

        if (token && !publicUrls.includes(config.url)) {
            config.headers["Authorization"] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => {
        const originalConfig = err.config;

        if (originalConfig.url !== "/v1/auth/authenticate" && err.response) {
            if (err.response.status === 403 && !originalConfig._retry) {
                originalConfig._retry = true;

                const refreshToken = TokenService.getLocalRefreshToken();

                if (refreshToken) {
                    try {
                        const rs = await instance.post("/v1/auth/refresh-token",{}, {
                            headers: {
                                'Authorization': 'Bearer '+TokenService.getLocalRefreshToken()
                            }
                        });

                        TokenService.setTokens(rs.data);
                        return instance(originalConfig);
                    } catch (_error) {
                        console.error("Refresh token is invalid. Forcing logout.", _error);
                        await authService.logout();
                        return Promise.reject(_error);
                    }
                }
                else {
                    console.log("No refresh token available. Logging out.");
                    TokenService.removeTokens();
                }
            }
        }

        return Promise.reject(err);
    }
);

export default instance;