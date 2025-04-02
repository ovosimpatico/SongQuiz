import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../ui/Card';
import './SongCard.scss';

interface SongCardProps {
  coverUrl: string;
  blurLevel: number; // 0-20, where 20 is the most blurred
  isRevealed?: boolean;
  audioPlaying?: boolean;
  className?: string;
}

const SongCard: React.FC<SongCardProps> = ({
  coverUrl,
  blurLevel = 10,
  isRevealed = false,
  audioPlaying = false,
  className = '',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Preload the image
    const img = new Image();
    img.src = coverUrl;
    img.onload = () => setIsLoaded(true);
  }, [coverUrl]);

  // Calculate the blur amount based on the blur level
  const blurAmount = isRevealed ? 0 : blurLevel * 2;

  return (
    <Card className={`song-card ${className} ${isLoaded ? 'song-card--loaded' : ''}`}>
      <div className="song-card__container">
        <div
          className="song-card__cover"
          style={{
            backgroundImage: isLoaded ? `url(${coverUrl})` : 'none',
            filter: `blur(${blurAmount}px)`
          }}
        />

        {audioPlaying && (
          <div className="song-card__playing">
            <motion.div
              className="song-card__bar"
              animate={{
                height: [20, 40, 15, 30, 20]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <motion.div
              className="song-card__bar"
              animate={{
                height: [30, 10, 25, 35, 30]
              }}
              transition={{
                duration: 1.7,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <motion.div
              className="song-card__bar"
              animate={{
                height: [15, 30, 45, 20, 15]
              }}
              transition={{
                duration: 1.3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default SongCard;