import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`glass-card p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 ${className} ${onClick ? 'cursor-pointer' : ''}`}
        >
            {children}
        </div>
    );
};
