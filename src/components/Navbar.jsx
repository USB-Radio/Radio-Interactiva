import {
  FaBroadcastTower,
  FaBullhorn,
  FaDeezer,
  FaEnvelope,
  FaExclamation,
  FaHeadset,
  FaHome,
  FaInstagram,
  FaMicrophone,
  FaSearch,
  FaSpotify,
  FaUser,
} from "react-icons/fa";
import { Marquee } from "./Marquee";
import LogoImg1 from "../img/Logo-radio.png";
import "../styles/Navbar.css";
export function Navbar() {
  return (
    <nav className="navbar">
      <div className="top-navbar">
        <div className="follow-box">
          <p className="bold">Siguenos en:</p>
          <div className="follow-icons">
            <i>{<FaInstagram />}</i>
            <i>{<FaSpotify />}</i>
            <i>{<FaDeezer />}</i>
            <i>{<FaMicrophone />}</i>
          </div>
        </div>
        <div className="info-box">
          <div className="info-box-section">
            <i>{<FaEnvelope />}</i>
            <div className="info-box-content">
              <p>Escribenos a:</p>
              <p className="bold">usbradio@usbbog.edu.co</p>
            </div>
          </div>
          <div className="info-box-section">
            <i>{<FaExclamation />}</i>
            <div className="info-box-content">
              <p>Ubicados en el primer piso:</p>
              <p className="bold">Edificio Guillermo de Ockham</p>
            </div>
          </div>
        </div>
      </div>
      <header className="navbar-header">
        <img src={LogoImg1} alt="USB RADIO - sitio oficial" />
        <nav className="navbar-links">
          <div className="navbar-cont">
            <i>{<FaHome />}</i>
            <a href="#">Inicio</a>
          </div>
          <div className="navbar-cont">
            <i>{<FaBroadcastTower />}</i>
            <a href="#">Nosotros</a>
          </div>
          <div className="navbar-cont">
            <i>{<FaBullhorn />}</i>
            <a href="#">Noticias</a>
          </div>
          <div className="navbar-cont">
            <i>{<FaHeadset />}</i>
            <a href="#">Programas</a>
          </div>
        </nav>
        <div className="navbar-login-search">
          <div className="navbar-cont">
            <i className="search">{<FaSearch />}</i>
          </div>
          <div className="login-button">
            <i>{<FaUser />}</i>
            <p className="bold">Ingresar</p>
          </div>
        </div>
      </header>
      <aside>
        <Marquee />
      </aside>
    </nav>
  );
}
