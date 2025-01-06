import { format, isToday, isYesterday } from 'date-fns';

export const formatDateAndTimeNew=(date: Date | number)=>{
  const inputDate = new Date(date??Date.now());
  
  if (isToday(inputDate)) {
    return `Today · ${format(inputDate, 'h:mm a')}`;
  }
  
  if (isYesterday(inputDate)) {
    return `Yesterday · ${format(inputDate, 'h:mm a')}`;
  }

  return format(inputDate, 'MMM d · h:mm a');
}

export const formatDate = (date = Date.now(),dateFirst=true,short=false) => {
  const dateToFormat = new Date(date);
  const day = dateToFormat.toLocaleDateString("en-US", { day: "2-digit" });
  const month = dateToFormat.toLocaleDateString("en-US", { month:short?"short": "long" });
  return dateFirst?`${day} ${month}`:`${month} ${day}`;
};

export const formatDateTime = (date = Date.now()) => {
  const dateToFormat = new Date(date);
  const time = dateToFormat.toLocaleTimeString("en-US", { timeStyle: 'short' });
  const day = dateToFormat.toLocaleDateString("en-US", { day: "2-digit" });
  const month = dateToFormat.toLocaleDateString("en-US", { month:"short" });
  const year = dateToFormat.toLocaleDateString("en-US", { year:'numeric' });
  return `${time} \u00B7 ${month} ${day}, ${year}`;
};

export const formatDate2 = (date = Date.now()) => {
  const dateToFormat = new Date(date);
  const day = dateToFormat.toLocaleDateString("en-US", { day: "2-digit" });
  const month = dateToFormat.toLocaleDateString("en-US", { month:"long" });
  const year = dateToFormat.toLocaleDateString("en-US", { year:'numeric' });
  return `${month} ${day}, ${year}`;
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

export  const isSameDay = (d1:any, d2:any) => {
  if(!!d1&&!!d2){
    const date1 = new Date(d1);
    const date2 = new Date(d2);
  return (
    date1?.getFullYear() === date2?.getFullYear() &&
    date1?.getMonth() === date2?.getMonth() &&
    date1?.getDate() === date2?.getDate()
  );
}else return false;
};