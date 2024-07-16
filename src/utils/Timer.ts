export const formatTime = (duration: number) => {
  let formattedDuration;
  if (duration >= 3600000) {
    // If duration is greater than or equal to an hour
    formattedDuration = new Date(duration).toISOString().substr(11, 8);
  } else {
    formattedDuration = new Date(duration).toISOString().substr(14, 5);
  }
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
