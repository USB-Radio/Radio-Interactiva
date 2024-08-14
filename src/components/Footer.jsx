import { FaComment, FaCopyright } from "react-icons/fa";
import { useEffect, useState } from "react";
import Img from "../img/Footer-image.png";
import "../styles/Footer.css";
export function Footer({ radioData }) {
  const [currentSong, setCurrentSong] = useState("offline");
  const [nextSong, setNextSong] = useState("offline");
  useEffect(() => {
    async function fetchData() {
      try {
        const {
          currentPlaying: { song },
          nextPlaying: { text: nextSongText, art: nextSongArt },
        } = await radioData;
        setCurrentSong(` ${song.title} - ${song.artist}`);
        setNextSong(` ${nextSongText} `);
      } catch (error) {
        console.log("Error de procesamiento");
      }
    }
    fetchData();
  }, [radioData]);
  return (
    <div className="footer">
      <div className="footer-img">
        <img src={Img} alt="USB RADIO - sitio oficial" />
      </div>
      <div className="footer-data">
        <div className="container-footer">
          <div className="container-footer-specs">
            <i>
              <FaComment />
            </i>
            <p>
              En estos momentos estas escuchando:
              <span> {currentSong}</span>
            </p>
            <p>
              A continuación...
              <span> {nextSong}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="footer-copyright">
        <span>
          <FaCopyright />
        </span>
        <p>2024 USB Radio. Todos los derechos reservados</p>
      </div>
    </div>
  );
}
