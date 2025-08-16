import React, {useState, useContext, useRef} from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { UserContext } from '../common/UserContext';
import settingsService from '../../services/settingsService';

function ApplicationSettings() {
    const { appName, setAppName, setAppLogo } = useContext(UserContext);
    const [localAppName, setLocalAppName] = useState(appName);
    const [selectedLogoFile, setSelectedLogoFile] = useState(null);
    const [isSavingName, setIsSavingName] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const logoInputRef = useRef(null);

    const handleNameSubmit = async (e) => {
        e.preventDefault();
        if (localAppName.trim() === '') {
            toast.error("Application name cannot be empty.");
            return;
        }
        setIsSavingName(true);
        try {
            await settingsService.updateAppName(localAppName);
            setAppName(localAppName);
            toast.success("Application name updated successfully!");
        } catch (error) {
            toast.error("Failed to update name. Please try again.");
            console.error("Name update error:", error);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleLogoSubmit = async (e) => {
        e.preventDefault();
        if (!selectedLogoFile) {
            toast.warn("Please select a logo file to upload.");
            return;
        }
        setIsUploadingLogo(true);
        try {
            await settingsService.uploadLogo(selectedLogoFile);
            setAppLogo(selectedLogoFile.name + Date.now());
            toast.success("Logo uploaded successfully! It will appear on the next page refresh.");

            if (logoInputRef.current) {
                logoInputRef.current.value = null;
            }
            setSelectedLogoFile(null);
        } catch (error) {
            toast.error("Logo upload failed. Please check file format and size.");
            console.error("Logo upload error:", error);
        } finally {
            setIsUploadingLogo(false);
        }
    };

    return (
        <Row className="mt-4">
            <Col xl={6} className="mb-4">
                <Card className="h-100">
                    <Card.Body>
                        <Card.Title>General Settings</Card.Title>

                        <Row className="justify-content-center">
                            <Col md={10} lg={9} xl={10} xxl={9}>

                                <Form onSubmit={handleNameSubmit} className="mb-4">
                                    <Form.Group className="mb-3" controlId="formAppName">
                                        <Form.Label>Application Name</Form.Label>
                                        <Form.Control type="text" value={localAppName} onChange={(e) => setLocalAppName(e.target.value)} />
                                    </Form.Group>
                                    <Button variant="primary" type="submit" disabled={isSavingName}>
                                        {isSavingName ? 'Saving...' : 'Save Name'}
                                    </Button>
                                </Form>

                                <hr />

                                <Form onSubmit={handleLogoSubmit}>
                                    <Form.Group className="mb-3" controlId="formLogo">
                                        <Form.Label>Company Logo</Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept="image/png, image/jpeg, image/svg+xml"
                                            ref={logoInputRef}
                                            onChange={(e) => setSelectedLogoFile(e.target.files[0])}
                                        />
                                    </Form.Group>
                                    <Button variant="secondary" type="submit" disabled={isUploadingLogo}>
                                        {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                                    </Button>
                                </Form>

                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>

        </Row>
    );
}

export default ApplicationSettings;