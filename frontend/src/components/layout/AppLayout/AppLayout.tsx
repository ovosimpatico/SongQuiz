import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import './AppLayout.scss';

interface AppLayoutProps {
  children: ReactNode;
  background?: 'default' | 'gradient';
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  background = 'default'
}) => {
  return (
    <div className={`app-layout app-layout--${background}`}>
      <div className="app-layout__background" />

      <div className="app-layout__content">
        {children}
      </div>

      <motion.div
        className="app-layout__orbs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="app-layout__orb app-layout__orb--1" />
        <div className="app-layout__orb app-layout__orb--2" />
        <div className="app-layout__orb app-layout__orb--3" />
      </motion.div>
    </div>
  );
};

export default AppLayout;