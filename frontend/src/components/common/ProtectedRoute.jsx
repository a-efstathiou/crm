import { Navigate, useNavigate } from "react-router-dom";
import React, { useEffect,useContext, useRef } from 'react';
import { toast } from 'react-toastify';

import {UserContext} from "./UserContext.jsx";


const Protected = ({ requiredRoles = [], isLoading, isLoggedIn, children, redirectTo = "/login" }) => {
    const {user} = useContext(UserContext);
    const roles = user?.authorities ?? [];

    const hasPermission = requiredRoles.length === 0
        ? true
        : roles.some(r => requiredRoles.includes(r));

    const toastShown = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) return;
        if (!isLoggedIn || !hasPermission) {
            if (!toastShown.current) {
                toast.error("You do not have permission to access this page.");
                toastShown.current = true;
            }
        } else {
            // reset so future denials can show again (optional)
            toastShown.current = false;
        }

    }, [isLoggedIn, hasPermission,isLoading,toastShown]);

    useEffect(() => {
        const onPopState = () => {
            if (!isLoggedIn || !hasPermission) {
                if (!toastShown.current) {
                    toast.error("You do not have permission to access this page.");
                    toastShown.current = true;
                }
                navigate(redirectTo, { replace: true });
            }
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, [isLoggedIn, hasPermission, navigate, redirectTo]);

    // if(isLoading){
    //     return <div style={{color: "#F4E9CD", fontSize: "50px"}}>Loading...</div>
    // }

    if (isLoading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status" />
                <div className="mt-2">Loading…</div>
            </div>
        );
    }

    if(!user || !isLoggedIn || !hasPermission) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

export default Protected;