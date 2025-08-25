import { useState } from 'react';
import { MapPin } from 'lucide-react';

interface MapPreviewProps {
  location: string;
}

export const MapPreview = ({ location }: MapPreviewProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors group"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <MapPin className="w-4 h-4" />
        <span className="truncate">{location}</span>
      </div>
      
      {isHovered && (
        <div 
          className="absolute z-20 bottom-full left-0 mb-2 p-2 bg-card border border-border rounded-lg shadow-hover"
          style={{ width: '150px', height: '150px' }}
        >
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDummy&q=${encodeURIComponent(location)}`}
            width="134"
            height="134"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded"
            title={`Map preview for ${location}`}
          />
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border"></div>
        </div>
      )}
    </div>
  );
};