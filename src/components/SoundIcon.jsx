import React from 'react';

const SoundIcon = ({ sound, onClick }) => {
  return (
    <div className="sound-item-wrapper"> {/* Nuevo wrapper para nombre + icono */}
      <div className="sound-name">{sound.name}</div>
      <div className="sound-icon" onClick={() => onClick(sound)}>
        {sound.icon ? (
          <img src={sound.icon} alt={sound.name} />
        ) : (
          <div className="play-placeholder-icon" aria-label="Play"></div>
        )}
      </div>
    </div>
  );
};

export default SoundIcon;