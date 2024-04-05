export const formatDate = (date = Date.now()) => {
  const dateToFormat = new Date(date);
  const day = dateToFormat.toLocaleDateString("en-US", { day: "2-digit" });
  const month = dateToFormat.toLocaleDateString("en-US", { month: "long" });
  return `${day} ${month}`;
};