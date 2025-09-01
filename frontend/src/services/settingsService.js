import api from './api';

class SettingsService {

    getApplicationSettings() {
        return api.get("/v1/settings/application")
            .then(response => response.data);
    };

    updateAppName(appName) {
        const requestData = { appName };
        return api.put("/v1/settings/application", requestData)
            .then(response => response.data);
    };

    uploadLogo(logoFile) {
        const formData = new FormData();
        formData.append('logoFile', logoFile);

        return api.post("/v1/settings/logo-upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    };
}

export default new SettingsService();