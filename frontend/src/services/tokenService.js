class TokenService {

    getLocalRefreshToken() {
        const user = JSON.parse(localStorage.getItem("tokens"));
        return user?.refresh_token;
    }

    getLocalAccessToken() {
        const user = JSON.parse(localStorage.getItem("tokens"));
        return user?.access_token;
    }

    setTokens(user) {
        const {...userData} = user;
        localStorage.setItem("tokens", JSON.stringify(userData));
        console.log("tokens", JSON.stringify(userData));
    }

    removeTokens() {
        localStorage.removeItem("tokens");
    }
}

export default new TokenService();
