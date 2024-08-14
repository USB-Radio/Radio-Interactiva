export const RadioData = (data) => {
  const listenUrl = data.station.listen_url || "";
  const totalListeners = data.station.mounts[0].listeners.total || 0;
  const songDuration = data.now_playing.duration || 0;
  const songElapsed = data.now_playing.elapsed || 0;
  const songTitle = data.now_playing.song.title || "Unknown Title";
  const songArtist = data.now_playing.song.artist || "Unknown Artist";
  const songAlbum = data.now_playing.song.album || "Unknown Album";
  const songGenre = data.now_playing.song.genre || "Unknown Genre";
  const songCover = data.now_playing.song.art || "";
  const playlist = data.now_playing.playlist || "Unknown Playlist";
  const nextSong = data.playing_next.song.text || "Unknown Next Song";
  const nextSongCover = data.playing_next.song.art || "";

  const songHistory = data.song_history || [];
  const songHistoryNum = songHistory.length || 0;

  const songHistoryObj = {};
  for (let i = 0; i < songHistoryNum; i++) {
    songHistoryObj[`song${i + 1}`] = {
      title: songHistory[i].song?.title || "Unknown Title",
      artist: songHistory[i].song?.artist || "Unknown Artist",
      album: songHistory[i].song?.album || "Unknown album",
      duration: songHistory[i].duration || "00:00",
      art: songHistory[i].song?.art || "",
    };
  }
  // Crear el objeto final con todos los datos organizados
  const formattedData = {
    listenUrl,
    totalListeners,
    currentPlaying: {
      duration: songDuration,
      elapsed: songElapsed,
      song: {
        title: songTitle,
        artist: songArtist,
        album: songAlbum,
        genre: songGenre,
        art: songCover,
      },
      playlist,
    },
    nextPlaying: {
      text: nextSong,
      art: nextSongCover,
    },
    songHistory: songHistoryObj,
  };
  // Retornar el objeto con los datos organizados
  return formattedData;
};
