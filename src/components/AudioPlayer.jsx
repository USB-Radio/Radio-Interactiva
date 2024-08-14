import { useState, useEffect, useRef } from "react";
import { FaHeadphones, FaVolumeUp } from "react-icons/fa";
import { formatTime } from "../utils/formatTime";
import DiskImg from "../img/favicon.png";
import "../styles/AudioPlayer.css";
export function AudioPlayer({ radioData }) {
  // --------------------------------------------------
  const [isPaused, setIsPaused] = useState(true);
  const [songTitle, setSongTitle] = useState("USB Radio");
  const [songArtist, setSongArtist] = useState("Ponle Play. Disfruta la U");
  const [songAlbum, setSongAlbum] = useState("N.A");
  const [listeners, setListeners] = useState("0");
  const [playlist, setPlaylist] = useState("N.A");
  const [sliderVal, setSliderVal] = useState("0");
  const [sliderMax, setSliderMax] = useState("1");
  const [endTime, setEndTime] = useState("00:00");
  const [startTime, setStartTime] = useState("00:00");
  const [coverImage, setCoverImage] = useState(DiskImg);
  const [volume, setVolume] = useState(1);
  const [listenUrl, setListenUrl] = useState("");
  const audioRef = useRef(null);
  // --------------------------------------------------
  // Acceder a los datos extraidos del servidor.
  useEffect(() => {
    async function fetchData() {
      try {
        const {
          listenUrl,
          totalListeners,
          currentPlaying: {
            duration,
            elapsed,
            song: { title, artist, album, art },
            playlist,
          },
          nextPlaying: { text: nextSongText, art: nextSongArt },
        } = radioData;
        // Actualiza el estado con los datos obtenidos
        const endTime = formatTime(duration);
        const startTime = formatTime(elapsed);
        setStartTime(startTime);
        setEndTime(endTime);
        setCoverImage(art);
        setSongTitle(title);
        setSongArtist(artist);
        setSongAlbum(album);
        setListeners(totalListeners);
        setPlaylist(playlist);
        setListenUrl(listenUrl);
        setSliderMax(duration);
        setSliderVal(elapsed);
      } catch (error) {
        // Debido a que fetch se ejecuta despues de ejecutar el codigo los valores al inicio van a ser undefined.
        console.log("Error en el procesamiento de los datos");
      }
    }
    fetchData();
  }, [radioData]); // <-- Actualiza el estado unicamente cuando radioData cambie.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
  };
  const handleButtonClick = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPaused) {
        audio.play();
        audio.muted = false;
      } else {
        audio.muted = true;
      }
    }
    setIsPaused(!isPaused);
  };
  //-----------------------------------------------------------
  return (
    <section className="muplayer">
      <audio ref={audioRef} src={listenUrl}></audio>
      <div className="muplayer-container">
        <div className="muplayer-title">
          <div className="muplayer-playlist">
            <p>Estas escuchando la franja:</p>
            <span className="muplayer-program">{playlist}</span>
          </div>
          <div className="muplayer-listeners">
            <i>
              <FaHeadphones />
            </i>
            <p>Numero de oyentes:</p>
            <span className="muplayer-listeners-number">{listeners}</span>
          </div>
        </div>
        <div className="muplayer-content">
          <div className="songcover-field">
            <div
              className={`songcover ${!isPaused ? "play" : ""}`}
              onClick={handleButtonClick}
              style={{
                backgroundImage: `url(${coverImage})`,
              }}
            ></div>
          </div>
          <div className="muplayer-items">
            <p className="song-title">{songTitle}</p>
            <p className="song-artist">{songArtist}</p>
            <div className="muplayer-playitems">
              <p className="muplayer-genre">
                Album: <span className="muplayer-genretype">{songAlbum}</span>
              </p>
              <button
                className={`muplayer-play-btn ${!isPaused ? "pause" : ""}`}
                onClick={handleButtonClick}
              >
                <span></span>
                <span></span>
              </button>
              <div className="volume-slider">
                <div className="volume-icon">
                  <FaVolumeUp />
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  onChange={handleVolumeChange}
                  className="seek-bar volume"
                />
              </div>
            </div>
            <div className="song-slider">
              <input
                type="range"
                min="0"
                max={sliderMax}
                value={sliderVal}
                className="seek-bar music"
              />
              <div className="muplayer-timers">
                <span className="current-time">{startTime}</span>
                <span className="live-status">En vivo </span>
                <span className="song-duration">{endTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
