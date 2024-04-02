export const formatDate = (date = Date.now()) => {
  const dateToFormat = new Date(date);
  const formattedDate = dateToFormat.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
  return formattedDate;
};
