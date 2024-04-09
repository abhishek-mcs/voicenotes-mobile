export const formatDate = (date = Date.now()) => {
  const dateToFormat = new Date(date);
  const day = dateToFormat.toLocaleDateString("en-US", { day: "2-digit" });
  const month = dateToFormat.toLocaleDateString("en-US", { month: "long" });
  return `${day} ${month}`;
};

export function getLastSixMonths() {
  const months = [];
  const currentDate = new Date();

  // Iterate for the last 7 months
  for (let i = 0; i < 7; i++) {
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = previousMonth.toLocaleDateString('en-US', { month: 'short' });
    months.unshift(monthName); // Add to the beginning of the array
  }

  return months;
}