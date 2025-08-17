import React from 'react';
import './BusinessProcessFlow.css';

const VISUAL_STAGES = ['NEW', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];

const getStageIndex = (status) => {
    switch (status) {
        case 'NEW':
            return 0;
        case 'OPEN':
            return 1;
        case 'IN_PROGRESS':
        case 'WAITING_CUSTOMER':
            return 2;
        case 'RESOLVED':
        case 'CLOSED':
            return 3;
        default:
            return -1;
    }
};

function BusinessProcessFlow({ currentStatus }) {
    const currentIndex = getStageIndex(currentStatus);

    return (
        <div className="bpf-container">
            {VISUAL_STAGES.map((stage, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;

                if (stage === 'WAITING_CUSTOMER') return null;

                return (
                    <React.Fragment key={stage}>
                        <div className={`bpf-stage ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                            <div className="bpf-dot"></div>
                            <div className="bpf-label">{stage.replace('_', ' ')}</div>
                        </div>

                        {index < VISUAL_STAGES.length - 1 && (
                            <div className={`bpf-connector ${isCompleted ? 'completed' : ''}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

export default BusinessProcessFlow;