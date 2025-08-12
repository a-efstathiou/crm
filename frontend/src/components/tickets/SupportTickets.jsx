import React from 'react';

const SupportTickets = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>SupportRequests</h1>
            <p style={styles.text}>Welcome to your CRM SupportRequests.</p>
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

export default SupportTickets;