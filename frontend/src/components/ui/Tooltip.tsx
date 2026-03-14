import React from 'react';

type TooltipProps = {
  type: 'large' | 'small' | 'header' | 'quest';
  text?: string;
  header?: string;
  title?: string;
  questType?: 'collection' | 'damage';
  target?: number | string;
  difficulty?: number;
};

const Tooltip: React.FC<TooltipProps> = ({ type, text, header, title, questType, target, difficulty }) => {
  const baseClasses = "absolute z-10 px-3 py-2 text-sm rounded-lg shadow-lg transition-all duration-200 ease-in-out transform opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none";
  
  const renderDifficultyStars = (difficulty: number) => {
    const stars = [];
    const fullStars = Math.floor(difficulty / 2);
    const hasHalfStar = difficulty % 2 === 1;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // Full yellow star
        stars.push(
          <span key={i} className="text-habit-neutral text-xl">★</span>
        );
      } else if (i === fullStars && hasHalfStar) {
        // Half star - using a custom approach with two overlapping stars
        stars.push(
          <span key={i} className="relative text-xl">
            <span className="text-main-gray3">★</span>
            <span className="absolute inset-0 text-habit-neutral overflow-hidden" style={{ width: '50%' }}>★</span>
          </span>
        );
      } else {
        // Empty gray star
        stars.push(
          <span key={i} className="text-main-gray3 text-xl">★</span>
        );
      }
    }
    return stars;
  };
  
  switch (type) {
    case 'large':
      return <div className={`${baseClasses} bg-main-gray7 text-main-white w-48 text-center`}>{text}</div>;
    case 'small':
      return <div className={`${baseClasses} bg-main-gray7 text-main-white whitespace-nowrap text-center`}>{text}</div>;
    case 'header':
      return (
        <div className={`${baseClasses} bg-main-gray7 text-main-white max-w-xs`}>
          <h3 className="font-semibold text-main-white mb-1">{header}</h3>
          <p className="text-main-gray2">{text}</p>
        </div>
      );
    case 'quest':
      const targetLabel = questType === 'collection' ? 'Collect:' : 'Boss HP:';
      return (
        <div className={`${baseClasses} bg-main-gray7 text-main-white w-72 border border-main-gray6`}>
          <h3 className="font-semibold text-main-white mb-2 text-center">{title}</h3>
          <p className="text-main-gray2 mb-1 flex justify-between">
            <span className="text-main-gray1 font-medium">{targetLabel}</span> 
            <span className="text-right">{target}</span>
          </p>
          <p className="text-main-gray2 flex justify-between items-center">
            <span className="text-main-gray1 font-medium">Difficulty:</span> 
            <span className="text-right flex items-center gap-1">
              {renderDifficultyStars(difficulty || 0)}
            </span>
          </p>
        </div>
      );
    default:
      return null;
  }
};

export default Tooltip; 