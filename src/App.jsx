import { useState, useRef } from 'react';
import './App.css';
import SoundGrid from './components/SoundGrid';


function App() {
  const [activeTab, setActiveTab] = useState('ambient');
  const [sounds, setSounds] = useState([]);


  const ambientAudioRef = useRef(null);
  const effectAudioRefs = useRef([]);
  const folderInputRef = useRef(null); // Nuevo ref para el input de carpeta

  const handleFolderSelect = (event) => {

    const files = event.target.files;

    if (!files.length) {
  
      return;
    }

    const newSoundsMap = new Map();

    // Revocar URLs de objetos anteriores para evitar fugas de memoria
    sounds.forEach(s => {
      if (s.sound && s.sound.startsWith('blob:')) URL.revokeObjectURL(s.sound);
      if (s.icon && s.icon.startsWith('blob:')) URL.revokeObjectURL(s.icon);
    });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name;

                  const pathParts = file.webkitRelativePath.split('/');

                  let currentSoundType = 'ambient'; // Tipo por defecto si no está en una subcarpeta reconocida             

                  // Iterar sobre las partes de la ruta para encontrar las subcarpetas "musica" o "Efectos"

                  for (let j = 0; j < pathParts.length - 1; j++) { // Excluir el nombre del archivo final

                    const part = pathParts[j];

            

                    if (part === 'musica') {

                      currentSoundType = 'ambient';
                      console.log(`Archivo "${fileName}" asignado a tipo "ambient" por estar en la carpeta "musica".`);

                      break; // Encontrado, no es necesario buscar más

                    } else if (part === 'Efectos') {

                      currentSoundType = 'effect';
                      alert(`Archivo "${fileName}" asignado a tipo "effect" por estar en la carpeta "Efectos".`);

                      break; // Encontrado, no es necesario buscar más

                    }

                  }

            

                
                const match = fileName.match(/^(\d+)\.(.*?)\.(mp3|jpg|jpeg)$/);


      if (match) {
        const N = match[1];
        const name = match[2];
        const ext = match[3];

        const mapKey = `${currentSoundType}-${N}`; // Clave compuesta

        if (!newSoundsMap.has(mapKey)) {
          newSoundsMap.set(mapKey, { name: '', sound: '', icon: '', type: currentSoundType });
        }
        const soundEntry = newSoundsMap.get(mapKey);

        if (ext === 'mp3') {
          soundEntry.sound = URL.createObjectURL(file);
          soundEntry.name = name;
          soundEntry.type = currentSoundType; // Asegurar que el tipo es el correcto
        } else if (ext === 'jpg' || ext === 'jpeg') {
          soundEntry.icon = URL.createObjectURL(file);
          if (soundEntry.name === '') soundEntry.name = name;
        }

      }
    }

    const loadedSounds = Array.from(newSoundsMap.values()).filter(s => s.sound); // Ahora se cargan sonidos incluso sin icono


    
    setSounds(loadedSounds);

    // Limpiar el input para que la misma carpeta pueda ser seleccionada de nuevo
    event.target.value = null; 
  };

  const playSound = (sound) => {
    if (sound.type === 'ambient') {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
      const audio = new Audio(sound.sound);
      audio.loop = true;
      audio.volume = 0.8;
      audio.play();
      ambientAudioRef.current = audio;
    } else {
      const audio = new Audio(sound.sound);
      audio.volume = 0.5;
      audio.play();
      
      effectAudioRefs.current.push(audio);
      audio.onended = () => {
        effectAudioRefs.current = effectAudioRefs.current.filter(a => a !== audio);
      };
    }
  };

  const stopAllSounds = () => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current = null;
    }
    effectAudioRefs.current.forEach(audio => audio.pause());
    effectAudioRefs.current = [];
  };



  const ambientSounds = sounds.filter(s => s.type === 'ambient');
  const effectSounds = sounds.filter(s => s.type === 'effect');

  return (
    <div className="App">
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'ambient' ? 'active' : ''}`}
          onClick={() => setActiveTab('ambient')}
        >
          Música Ambiental
        </div>
        <div 
          className={`tab ${activeTab === 'effect' ? 'active' : ''}`}
          onClick={() => setActiveTab('effect')}
        >
          Efectos de Sonido
        </div>
      </div>

      <div className="content">
        {activeTab === 'ambient' && <SoundGrid sounds={ambientSounds} onSoundClick={playSound} />}
        {activeTab === 'effect' && <SoundGrid sounds={effectSounds} onSoundClick={playSound} />}
      </div>

      <div className="controls">

        <input
          type="file"
          webkitdirectory="true"
          multiple
          ref={folderInputRef}
          onChange={handleFolderSelect}
          style={{ display: 'none' }}
        />
        <button className="load-folder-btn" onClick={() => folderInputRef.current.click()}>Cargar Carpeta
        </button>
        <button className="stop-btn" onClick={stopAllSounds}>Parar Todo</button>
      </div>


    </div>
  );
}

export default App;
