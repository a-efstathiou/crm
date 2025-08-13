import UserService from "./userService.js";
import TokenService from "./tokenService.js";

class RefreshPageService {

    constructor() {
        this.user = null;
        this.id = -1;
    }
  
    onPageRefresh(isLoggedIn,id) {
        this.saveIsLoggedIn(isLoggedIn);
        if(id != null){
            this.saveId(id);
        }
    }

    onPageLoad(){
    
        const id = this.getId();
        const isLoggedIn = this.getIsLoggedIn();
    
        if (isLoggedIn === 'true' && id !== "-1") {
            return UserService.getUserById(id)
                .then(response => {
                    this.setLocalUser(response);
                    return response; // Return the response to the calling code
                })
                .catch(error => {
                    console.error("Error getting user:", error);
                    throw error; // Re-throw the error to propagate it to the calling code
                });
        } else {
            // If not logged in or ID not valid, return a resolved promise with null
            return Promise.resolve(null);
        }
    }

    saveIsLoggedIn(status){
        sessionStorage.setItem("isLoggedIn",status);
    }

    getIsLoggedIn(){
        return sessionStorage.getItem("isLoggedIn");
    }

    saveId(id){
        sessionStorage.setItem("id",id);
    }

    getId(){
        return sessionStorage.getItem("id");
    }

    setLocalUser(user){
       this.user = user;
    }

    getLocalUser(){
        return this.user;
    }

    setReload(status){
        sessionStorage.setItem("reload",status);
    }

    getReload(){
        return sessionStorage.getItem("reload");
    }


}

export default new RefreshPageService()