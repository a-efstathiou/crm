import api from './api';
import { toast } from 'react-toastify';

const downloadAttachment = async (attachmentId, fileName) => {
    try {
        const response = await api.get(`/v1/attachments/${attachmentId}`, {
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: response.headers['content-type'] });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);

        document.body.appendChild(link);
        link.click();

        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        toast.error("Download failed. You may not have permission to access this file.");
        console.error("Attachment download error:", error);
    }
};

const attachmentService = {
    downloadAttachment,
};

export default attachmentService;