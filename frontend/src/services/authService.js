import api from "./api";
import TokenService from "./tokenService.js";

class AuthService {
  access_token;
  refresh_token;
  login(email, password) {
    return api
      .post("/v1/auth/authenticate", {
        email,
        password
      })
      .then(response => {
        if (response.data.access_token) {
          TokenService.setTokens(response.data);
        }

        return response.data;
      }).catch(error => {
        throw error;
      });
  }

  logout() {
    TokenService.removeTokens();
    return api.get("/v1/auth/logout");
  }

  getCurrentUser() {
    return TokenService.getTokens();
  }


}

export default new AuthService()