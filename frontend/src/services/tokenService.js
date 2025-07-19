class TokenService {
    constructor() {
        this.accessToken = null;
    }

    getLocalRefreshToken() {
        const user = JSON.parse(localStorage.getItem("user"));
        return user?.refresh_token;
    }

    getLocalAccessToken() {
        return this.accessToken;
    }

    updateLocalAccessToken(token) {
        this.accessToken = token;
    }

    getUser() {
        return JSON.parse(localStorage.getItem("user"));
    }

    setUser(user) {
        const { access_token, ...userData } = user;
        localStorage.setItem("user", JSON.stringify(userData));
        this.updateLocalAccessToken(access_token);
    }

    removeUser() {
        localStorage.removeItem("user");
    }
}

export default new TokenService();
