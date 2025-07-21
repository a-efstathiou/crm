import React from 'react';

const Profile = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Your Profile</h1>
            <p style={styles.text}>This is your profile page. Here you can view and manage your account settings.</p>
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem',
        textAlign: 'center',
    },
    heading: {
        fontSize: '2rem',
        marginBottom: '1rem',
    },
    text: {
        fontSize: '1rem',
        color: '#666',
    },
};

export default Profile;
