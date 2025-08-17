import React, { useContext } from 'react';
import { Container, Tabs, Tab, Row, Col } from 'react-bootstrap';
import { UserContext } from '../common/UserContext.jsx';
import { checkIfHasRole } from '../../utils/roleUtils';
import ProfileSettings from './ProfileSettings';
import ApplicationSettings from './ApplicationSettings';
import './Settings.css';

function SettingsPage() {
    const { user, role, isLoggedIn } = useContext(UserContext);

    if (!user) {
        return <Container fluid className="p-4"><h1>Loading...</h1></Container>;
    }

    return (
        <Container fluid className="p-4 settings-page-container">
            <Row className="justify-content-md-center">
                <Col md={11} lg={10} xxl={9}>

                    <h1 className="mb-4">Settings</h1>

                    <Tabs defaultActiveKey="profile" id="settings-tabs" variant="pills" className="mb-4">

                        <Tab eventKey="profile" title="Profile">
                            <ProfileSettings currentUser={user} />
                        </Tab>

                        {isLoggedIn && checkIfHasRole(role, "ROLE_ADMIN") && (
                            <Tab eventKey="application" title="Application">
                                <ApplicationSettings />
                            </Tab>
                        )}
                    </Tabs>
                </Col>
            </Row>
        </Container>
    );
}

export default SettingsPage;