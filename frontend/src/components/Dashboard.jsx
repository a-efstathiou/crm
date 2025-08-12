import React from 'react';

const Dashboard = () => {
    return (
        <div>
            <h1 style={styles.heading}>Dashboard</h1>
            <p style={styles.text}>Welcome to your CRM Dashboard.</p>
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

export default Dashboard;
