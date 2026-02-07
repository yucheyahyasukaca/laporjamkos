import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-5 py-3 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm 
        focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:outline-none 
        placeholder:text-slate-400 text-slate-700
        transition-all duration-300 shadow-sm hover:border-violet-300 ${className}`}
                {...props}
            />
        </div>
    );
};
