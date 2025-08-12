import api from "./api";

class UserService {
    
    getUserByEmail(email){
        return api
        .get("/users/email/"+email)
        .then(response => {
          return response.data;
        })
        .catch(error => {
            console.error("Error getting user:", error);
            throw error; // Rethrow the error to handle it in the caller
        });
    }

    getUserById(id){
        return api
        .get("/users/id/"+id)
        .then(response => {
          return response.data;
        })
        .catch(error => {
            console.error("Error getting user:", error);
            throw error; // Rethrow the error to handle it in the caller
        });
    }

    getAllUsers(){
        return api
        .get("/users/getAllUsers")
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error getting users:", error);
            throw error; // Rethrow the error to handle it in the caller
        });
    }

    editUserRole(id,role){
        return api
        .put("/users/"+id,{
            role
        })
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error editing user role:", error);
            throw error; // Rethrow the error to handle it in the caller
        });
    }

    getAllRoles(){
        return api
        .get("/users/getAllRoles")
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error getting roles:", error);
            throw error; // Rethrow the error to handle it in the caller
        });
    }

}

export default new UserService() ;