export const formatRoleForDisplay = (roleString) => {
    if (!roleString) return '';
    return roleString.replace('ROLE_', '').replace(/_/g, ' ').trim();
};

export const formatRoleForAPI = (displayString) => {
    if (!displayString) return '';
    return displayString.replace(/ /g, '_').trim();
};

export const checkIfHasRole = (userRole, requiredRoles) => {

    if (!userRole) {
        return false;
    }

    if (Array.isArray(requiredRoles)) {
        return requiredRoles.includes(userRole);
    }

    return userRole === requiredRoles;
}