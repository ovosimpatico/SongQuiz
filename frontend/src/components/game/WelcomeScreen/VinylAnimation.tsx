import React from 'react';
import { motion } from 'framer-motion';

const VinylAnimation: React.FC = () => {
  return (
    <div className="welcome-screen__vinyl">
      <motion.div
        className="vinyl-record"
        animate={{ rotate: 360 }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="vinyl-label"></div>
      </motion.div>
    </div>
  );
};

export default VinylAnimation;