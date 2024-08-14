import "../styles/Marquee.css";
export function Marquee() {
  return (
    <div className="marquee-wrapper-background">
      <div className="marquee-wrapper">
        <ul>
          <li> Universidad de San Buenaventura </li>
          <li>Ponle play y disfruta la U</li>
          <li>Horarios de Programacion:</li>
          <li>Lunes a jueves: 7:00 a.m - 9:00 p.m </li>
          <li>Viernes: 7:00 a.m - 10:00 p.m </li>
          <li>Sabados y domingos: 9:00 a.m - 5:00 p.m </li>
          <li>¡Siguenos en Instagram!</li>
        </ul>
        <ul aria-hidden="true">
          <li> Universidad de San Buenaventura </li>
          <li>Ponle play y disfruta la U</li>
          <li>Horarios de Programacion:</li>
          <li>Lunes a jueves: 7:00 a.m - 9:00 p.m </li>
          <li>Viernes: 7:00 a.m - 10:00 p.m </li>
          <li>Sabados y domingos: 9:00 a.m - 5:00 p.m </li>
          <li>¡Siguenos en Instagram!</li>
        </ul>
      </div>
    </div>
  );
}
