import { AudioPlayer } from "./AudioPlayer";
import { Footer } from "./Footer";
import { LineSection } from "../components/LineSection";
import { Programs } from "./Programs";
import { RadioData } from "../utils/RadioData";
import { SongHistory } from "./SongHistory";
import { RecommendationCard } from "./RecommendationCard";

import Fetch from "../utils/Fetch";
import "../styles/LayoutContent.css";
import { useState, useEffect } from "react";
export function LayoutContent() {
  //----------------------------------------------------------------------
  const [radioData, setRadioData] = useState(null);
  // Llamado a la API de AzuraCast (Radio)
  const url = "https://a6.asurahosting.com/api/nowplaying/usb_radio";
  useEffect(() => {
    const fetchData = async () => {
      const data = await Fetch.getAll(url);
      const radio = RadioData(data);
      setRadioData(radio);
    };
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 10000); // <-- Llamado a AzuraCast cada 7 segundos.
    return () => clearInterval(intervalId);
  }, []);
  return (
    <section>
      <div className="layout-muplayer">
        <AudioPlayer radioData={radioData} />
      </div>
      <LineSection />
      <div className="layout-carrousel">
        <Programs />
      </div>
      <LineSection />
      <div className="layout-songhistory">
        <RecommendationCard />
        <SongHistory radioData={radioData} />
      </div>
      <div className="layout-footer">
        <Footer radioData={radioData} />
      </div>
      <LineSection />
    </section>
  );
}
