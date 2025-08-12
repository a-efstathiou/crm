import api from "./api";

class UserService {
    
    getUserByEmail(email){
        return api
        .get("/v1/users/email/"+email)
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
        .get("/v1/users/id/"+id)
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
        .get("/v1/users/getAllUsers")
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error getting users:", error);
            throw error; // Rethrow the error to handle it in the caller
        });
    }

    getAllUsersPaged(page, size, filters = {}){

        const params = new URLSearchParams({
            page,
            size
        });

        // Add filter values to the query params if they exist
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });

        return api
        .get(`/v1/users/getAllUsers?${params.toString()}`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Failed to fetch users:", error);
            throw error; // Rethrow the error to handle it in the caller
        });
    }

    editUserRole(id,role){
        return api
        .put("/v1/users/"+id,{
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
        .get("/v1/users/getAllRoles")
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error getting roles:", error);
            throw error; // Rethrow the error to handle it in the caller
        });
    }

    deleteUser(id){
        return api
        .delete("/v1/users/"+id)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error getting roles:", error);
            throw error; // Rethrow the error to handle it in the caller
        });
    }

    createUser(userData) {
        return api
        .post("/v1/users/createUser", userData)
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