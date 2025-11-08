import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// Empty square checkbox (unchecked)
export const CheckboxEmpty: React.FC<IconProps> = ({ size = 14, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="1.5" y="1.5" width="21" height="21" rx="3" ry="3" />
    </svg>
  );
};

// Filled checkbox with checkmark (checked)
export const CheckboxFilled: React.FC<IconProps> = ({ size = 14, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="1.5" y="1.5" width="21" height="21" rx="3" ry="3" fill="currentColor" />
      <polyline points="7.5 12 11 15.5 16.5 8.5" stroke="white" strokeWidth="2.5" fill="none" />
    </svg>
  );
};
