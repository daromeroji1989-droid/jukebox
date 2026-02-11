import React from 'react';
import SoundIcon from './SoundIcon';

const SoundGrid = ({ sounds, onSoundClick }) => {
  const totalSlots = 24;
  const soundSlots = sounds.map((sound, index) => (
    <SoundIcon key={index} sound={sound} onClick={onSoundClick} />
  ));

  const emptySlots = Array.from({ length: totalSlots - sounds.length }).map((_, index) => (
    <div key={`empty-${index}`} className="sound-icon" style={{ backgroundColor: 'transparent', cursor: 'default' }} />
  ));

  return (
    <div className="sound-grid">
      {soundSlots}
      {emptySlots}
    </div>
  );
};

export default SoundGrid;