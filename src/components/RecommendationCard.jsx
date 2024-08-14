import { FaAssistiveListeningSystems } from "react-icons/fa";
import "../styles/RecommendationCard.css";
export function RecommendationCard() {
  return (
    <section className="Recommend-container">
      <div className="Recommend-Title">
        <div>
          <i>
            <FaAssistiveListeningSystems />
          </i>
          <p>Conoce mas sobre ...</p>
        </div>
      </div>
      <div className="Recommend-info">
        <div>
          <p>Informacion del artista actual ...</p>
          <p>Artistas similares al actual ...</p>
          <p>Enlaces de ( youtube, Spotify, Deezer etc ) ...</p>
        </div>
      </div>
    </section>
  );
}
