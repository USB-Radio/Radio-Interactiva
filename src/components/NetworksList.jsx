import { FaDeezer, FaInstagram, FaMicrophone, FaSpotify } from "react-icons/fa";
import "../styles/NetworksList.css";
export function NetworksList() {
  return (
    <div className="socialnetwork-list">
      <div className="social-icons-list">
        <div className="icon-block">
          <a
            href="https://www.instagram.com/usb_radio?igsh=YW56ZGZzYTR6dG1k"
            target="_blank"
          >
            <i>{<FaInstagram />}</i>
          </a>
        </div>
        <div className="icon-block">
          <a
            href="https://open.spotify.com/show/6PXeoziWiDG7nDO9IqO4lg?si=d3812d8504474e6a"
            target="_blank"
          >
            <i>{<FaSpotify />}</i>
          </a>
        </div>
        <div className="icon-block">
          <a
            href="https://www.deezer.com/search/USB%20Radio/show"
            target="_blank"
          >
            <i>{<FaDeezer />}</i>
          </a>
        </div>
        <div className="icon-block">
          <a
            href="https://www.spreaker.com/user/usb-radio--8429931"
            target="_blank"
          >
            <i>{<FaMicrophone />}</i>
          </a>
        </div>
      </div>
    </div>
  );
}
