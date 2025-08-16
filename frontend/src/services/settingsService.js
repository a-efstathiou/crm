import api from './api';

class SettingsService {

    getApplicationSettings() {
        return api.get("/v1/settings/application")
            .then(response => response.data);
    };

    updateAppName(appName) {
        // The request body must match the UpdateAppNameRequest DTO
        const requestData = { appName };
        return api.put("/v1/settings/application", requestData)
            .then(response => response.data);
    };

   uploadLogo(logoFile) {
        // We must use FormData to send a file
        const formData = new FormData();
        // The key 'logoFile' must match the @RequestParam("logoFile") in your controller
        formData.append('logoFile', logoFile);

        // We need to tell axios to use a different Content-Type for file uploads
        return api.post("/v1/settings/logo-upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    };
}

export default new SettingsService();