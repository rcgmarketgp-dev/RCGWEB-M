import React from 'react';
import { getIconifySvgUrl } from '../utils/uiThemes';

interface ExternalIconBadgeProps {
  iconName?: string;
  className?: string;
  fallback: React.ReactNode;
  invertColor?: boolean;
}

export const ExternalIconBadge: React.FC<ExternalIconBadgeProps> = ({
  iconName,
  className = 'w-4 h-4',
  fallback,
  invertColor = true,
}) => {
  const svgUrl = iconName ? getIconifySvgUrl(iconName) : null;
  if (!svgUrl) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={svgUrl}
      alt=""
      aria-hidden="true"
      className={`${className} inline-block shrink-0 ${invertColor ? 'brightness-0 invert' : 'dark:invert'}`}
    />
  );
};
