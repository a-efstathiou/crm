import UserService from "./userService.js";

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
                    return response;
                })
                .catch(error => {
                    console.error("Error getting user:", error);
                    throw error;
                });
        } else {
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

    setReload(status){
        sessionStorage.setItem("reload",status);
    }

    getReload(){
        return sessionStorage.getItem("reload");
    }


}

export default new RefreshPageService()