export const formatTime = (duration) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};
