export const formatDate = (date = Date.now()) => {
  const dateToFormat = new Date(date);
  const formattedDate = dateToFormat.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  });
  return formattedDate;
};
