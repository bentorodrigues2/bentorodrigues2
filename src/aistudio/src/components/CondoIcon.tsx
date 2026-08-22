import React, { useState } from "react";
import iconsData from "../../icons.json";

interface CondoIconProps {
  id: string;
  className?: string;
  size?: number;
  fallback: React.ReactNode;
}

export function CondoIcon({ id, className = "", size = 20, fallback }: CondoIconProps) {
  const [attempt, setAttempt] = useState(0);
  
  // Find icon file name from the icons.json
  let fileName = null;
  for (const category of Object.values(iconsData)) {
    if (Array.isArray(category)) {
      const found = category.find((item: any) => item.id === id);
      if (found) {
        fileName = found.file.replace("SVG/", "");
        break;
      }
    }
  }

  if (fileName && attempt < 2) {
    const cleanFileName = fileName.replace("SVG/", "").replace(".svg", ".png");
    const sources = [
      `/modulos/${cleanFileName}`,
      `/estados-acoes/${cleanFileName}`
    ];
    const src = sources[attempt];
    return (
      <img 
        src={src} 
        alt={id}
        style={{ width: size, height: size }}
        className={`inline-block object-contain shrink-0 ${className}`}
        onError={() => setAttempt(prev => prev + 1)}
      />
    );
  }
  
  return <>{fallback}</>;
}
