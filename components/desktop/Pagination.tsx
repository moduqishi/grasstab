import React from 'react';

interface PaginationProps {
    showPagination: boolean;
    totalPages: number;
    page: number;
    viewState: 'hero' | 'desktop';
}

export const Pagination: React.FC<PaginationProps> = ({
    showPagination,
    totalPages,
    page,
    viewState
}) => {
    if (!showPagination) return null;

    return (
        <div className={`w-full h-[3%] flex items-center justify-center gap-1.5 sm:gap-2.5 z-20 pointer-events-none transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${viewState === 'hero' ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
            {Array.from({ length: totalPages }).map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 drop-shadow-md ${i === page ? 'w-1.5 bg-white' : 'w-1.5 bg-white/30'}`} />
            ))}
        </div>
    );
};
