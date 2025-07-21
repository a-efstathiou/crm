import { Navigate, useNavigate } from "react-router-dom";
import React, { useEffect,useContext, useRef } from 'react';
import { toast } from 'react-toastify';

import {UserContext} from "./UserContext.jsx";


const Protected = ({ isLoggedIn,hasPermission,isLoading, children }) => {
    const {user} = useContext(UserContext);


    const toastShown = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading){
          if (!isLoggedIn || !hasPermission) {
            if (!toastShown.current) {
              toastShown.current = true;
            }
          }
  
        }
    
        
    }, [isLoggedIn, hasPermission,isLoading,toastShown]);

 
    if(isLoading){
        return <div style={{color: "#F4E9CD", fontSize: "50px"}}>Loading...</div>
    }

    window.onpopstate = () => {
        if(!isLoggedIn || !hasPermission){
            toast.error("You do not have permission to access this page.");
            navigate("/login");
        }
        else{
            window.onpopstate = null; 
        }
    }
    


    if(!user){
        if (!isLoggedIn || !hasPermission) {

            
            if(!toastShown.current){
                toast.error("You do not have permission to access this page.");
                toastShown.current = true;
            }
            
            return <Navigate to="/login" replace />;
        }
    }

    return children;
    
    
};
export default Protected;