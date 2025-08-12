// This file will contain all role-related helper functions.

/**
 * Converts an API role string into a user-friendly display format.
 * Example: "ROLE_SUPPORT_AGENT" -> "SUPPORT AGENT"
 * @param {string} roleString - The role string from the API.
 * @returns {string} The formatted display string.
 */
export const formatRoleForDisplay = (roleString) => {
    if (!roleString) return '';
    return roleString.replace('ROLE_', '').replace(/_/g, ' ').trim();
};

/**
 * Converts a user-friendly display string back into the API format.
 * Example: "SUPPORT AGENT" -> "SUPPORT_AGENT"
 * @param {string} displayString - The display string from the UI.
 * @returns {string} The formatted string for the API.
 */
export const formatRoleForAPI = (displayString) => {
    if (!displayString) return '';
    return displayString.replace(/ /g, '_').trim();
};