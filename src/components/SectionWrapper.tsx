import React from "react";

const SectionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="bg-black bg-opacity-35 rounded-lg p-5">
            {children}
        </div>
    );
};

export default SectionWrapper;
