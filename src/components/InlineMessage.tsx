import React, { useEffect } from 'react';

export type MessageType = 'success' | 'error' | 'info';

export interface InlineMessageProps {
    type: MessageType;
    message: string;
    onClose: () => void;
    autoClose?: boolean;
}

export default function InlineMessage({ type, message, onClose, autoClose = true }: InlineMessageProps) {
    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [onClose, autoClose]);

    const colors = {
        success: 'bg-success-bg text-success-text border-success-text/20',
        error: 'bg-error-bg text-error-text border-error-text/20',
        info: 'bg-sidebar/10 text-sidebar border-sidebar/20',
    };

    return (
        <div className={`p-4 rounded-lg flex items-center justify-between border ${colors[type]} mb-4 animate-fade-in`}>
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="p-1 opacity-70 hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
}
