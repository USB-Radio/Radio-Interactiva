import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaCommentDots } from "react-icons/fa";
import "../styles/Programs.css";

export function Programs() {
  const totalImages = 13; // Número total de imágenes
  const basePath = "/src/img/Spreaker-Visuals/"; // Ruta base
  const programPhotos = Array.from(
    { length: totalImages },
    (_, index) => `${basePath}${index + 1}.jpg`
  );
  const galleryRef = useRef(null);
  const scrollLeft = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };
  const scrollRight = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };
  return (
    <div className="gallery-wrap">
      <div className="gallery-title">
        <p>Conoce nuestros programas</p>
        <i>{<FaCommentDots />}</i>
      </div>
      <div className="gallery" ref={galleryRef}>
        {programPhotos.map((photo, index) => (
          <div key={index}>
            <span>
              <img src={photo} alt={`Spreaker Visuals ${index + 1}`} />
            </span>
          </div>
        ))}
      </div>
      <div className="gallery-buttons">
        <div className="back-btn" onClick={scrollLeft}>
          <i>{<FaChevronLeft />}</i>
        </div>
        <div className="next-btn" onClick={scrollRight}>
          <i>{<FaChevronRight />}</i>
        </div>
      </div>
    </div>
  );
}
