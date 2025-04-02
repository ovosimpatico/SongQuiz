import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCompactDisc,
  faGuitar,
  faRecordVinyl,
  faHeadphones,
  faMusic,
  faDrum,
  faVolumeUp,
  faLightbulb,
  faUsers,
  faMicrophone,
  faRandom,
  faSliders,
  faBrain,
  faSearch,
  faChair,
  faVolumeHigh
} from '@fortawesome/free-solid-svg-icons';
import { APP_NAME } from '../../../App';
import './LoadingScreen.scss';

interface LoadingScreenProps {
  isLoading: boolean;
}

// Fun music-themed loading messages with corresponding icons
const loadingMessages = [
  { text: "Spinning up the turntables...", icon: faCompactDisc },
  { text: "Tuning the instruments...", icon: faGuitar },
  { text: "Polishing the vinyl records...", icon: faRecordVinyl },
  { text: "Untangling the headphones...", icon: faHeadphones },
  { text: "Cueing up the next track...", icon: faMusic },
  { text: "Finding the perfect beat...", icon: faDrum },
  { text: "Dusting off the album covers...", icon: faRecordVinyl },
  { text: "Warming up the amplifiers...", icon: faVolumeUp },
  { text: "Setting the mood lighting...", icon: faLightbulb },
  { text: "Gathering the band members...", icon: faUsers },
  { text: "Clearing the stage...", icon: faMusic },
  { text: "Testing the microphones...", icon: faMicrophone },
  { text: "Shuffling the playlist...", icon: faRandom },
  { text: "Adjusting the equalizer...", icon: faSliders },
  { text: "Loading music knowledge...", icon: faBrain },
  { text: "Summoning musical genius...", icon: faMusic },
  { text: "Searching the record collection...", icon: faSearch },
  { text: "Dropping the needle...", icon: faRecordVinyl },
  { text: "Finding the best seats in the house...", icon: faChair },
  { text: "Checking sound levels...", icon: faVolumeHigh }
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  const [message, setMessage] = useState(loadingMessages[0]);
  const [key, setKey] = useState(0); // Key for animation reset

  // Change loading message every 2 seconds
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      setMessage(loadingMessages[randomIndex]);
      setKey(prev => prev + 1); // Reset animation
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className={`loading-screen ${isLoading ? 'visible' : ''}`}>
      <div className="loading-screen__container">
        <h2 className="loading-screen__title">{APP_NAME}</h2>

        <div className="loading-screen__animation">
          <div className="loading-screen__blocks">
            <div className="loading-screen__block loading-screen__block--1"></div>
            <div className="loading-screen__block loading-screen__block--2"></div>
            <div className="loading-screen__block loading-screen__block--3"></div>
            <div className="loading-screen__block loading-screen__block--4"></div>
          </div>
        </div>

        <div key={key} className="loading-screen__message">
          <FontAwesomeIcon icon={message.icon} className="loading-screen__message-icon" />
          <span>{message.text}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;