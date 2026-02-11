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

                  let currentSoundType = 'effect'; // Tipo por defecto si no está en una subcarpeta reconocida

            

                  

                  // Iterar sobre las partes de la ruta para encontrar las subcarpetas "Música" o "Efectos"

                  for (let j = 0; j < pathParts.length - 1; j++) { // Excluir el nombre del archivo final

                    const part = pathParts[j];

            

                    if (part === 'Música') {

                      currentSoundType = 'ambient';

                      break; // Encontrado, no es necesario buscar más

                    } else if (part === 'Efectos') {

                      currentSoundType = 'effect';

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
      audio.volume = 0.04;
      audio.play();
      ambientAudioRef.current = audio;
    } else {
      const audio = new Audio(sound.sound);
      audio.volume = 1;
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
        <div // NEW TAB
          className={`tab ${activeTab === 'instructions' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructions')}
        >
          Instrucciones
        </div>
      </div>

      <div className="content">
        {activeTab === 'ambient' && <SoundGrid sounds={ambientSounds} onSoundClick={playSound} />}
        {activeTab === 'effect' && <SoundGrid sounds={effectSounds} onSoundClick={playSound} />}
        {activeTab === 'instructions' && ( // NEW CONTENT AREA
          <div className="instructions-content" style={{textAlign: 'left', padding: '1rem'}}>
            <h2>Cómo usar RPG Jukebox</h2>
            <p>Esta aplicación te permite cargar y reproducir tus propios sonidos y música organizada desde una carpeta local de tu ordenador.</p>

            <h3>1. Prepara tus archivos</h3>
            <p>Organiza tus archivos de audio y sus iconos correspondientes en una estructura de carpetas en tu PC:</p>
            <ul>
              <li>Crea una carpeta principal (ej: <code>MiBibliotecaRPG</code>) que seleccionarás en la aplicación.</li>
              <li>Dentro de esta carpeta principal, crea subcarpetas llamadas <code>Música</code> y <code>Efectos</code>.</li>
              <li>**Convención de Nombres:**
                <ul>
                  <li>Cada par sonido/icono debe compartir el mismo número inicial <code>N</code>.</li>
                  <li><code>N.nombre.mp3</code> para el sonido.</li>
                  <li><code>N.nombre.jpg</code> o <code>N.nombre.jpeg</code> para el icono.</li>
                  <li>Ejemplos: <code>1.CancionHeroica.mp3</code>, <code>1.CancionHeroica.jpg</code></li>
                  <li>**Importante:** Puedes repetir el número <code>N</code> si los archivos están en diferentes subcarpetas de tipo (ej: <code>Música/1.Cancion.mp3</code> y <code>Efectos/1.Explosion.mp3</code> son válidos).</li>
                </ul>
              </li>
              <li>**Asignación de Tipo:**
                <ul>
                  <li>Los archivos encontrados en la subcarpeta <code>Música</code> se clasificarán como "Música Ambiental".</li>
                  <li>Los archivos encontrados en la subcarpeta <code>Efectos</code> se clasificarán como "Efectos de Sonido".</li>
                  <li>Otros archivos (o los que no estén en estas subcarpetas) se clasificarán por defecto como "Efectos de Sonido".</li>
                </ul>
              </li>
            </ul>

            <h3>2. Carga la carpeta local</h3>
            <p>En la aplicación, haz clic en el botón **"Cargar Carpeta Local"** y selecciona la carpeta principal que preparaste en el paso anterior.</p>
            <p>La aplicación procesará tus archivos y los mostrará en las pestañas correspondientes.</p>

            <h3>3. Reproducir sonidos</h3>
            <ul>
              <li>Haz clic en los iconos de sonido para reproducirlos.</li>
              <li>La "Música Ambiental" se reproducirá en bucle y con un volumen más bajo.</li>
              <li>Los "Efectos de Sonido" se reproducirán una vez.</li>
              <li>Si un sonido no tiene icono, se mostrará un icono de "play" por defecto.</li>
            </ul>

            <h3>4. Controles adicionales</h3>
            <ul>
              <li>**"Parar Todo"**: Detiene todos los sonidos que se estén reproduciendo.</li>
            </ul>

            <h3>Consideraciones Importantes:</h3>
            <ul>
              <li>**Temporalidad:** Los archivos se cargan directamente desde tu navegador. Si refrescas la página o cierras la aplicación, la lista de sonidos se perderá. Tendrás que volver a cargar la carpeta.</li>
              <li>**Compatibilidad:** Asegúrate de que los formatos de audio (`.mp3`) y imagen (`.jpg`, `.jpeg`) sean compatibles con tu navegador.</li>
            </ul>
          </div>
        )}
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
        <button className="load-folder-btn" onClick={() => folderInputRef.current.click()}>Cargar Carpeta Local</button>
        <button className="stop-btn" onClick={stopAllSounds}>Parar Todo</button>
      </div>


    </div>
  );
}

export default App;
