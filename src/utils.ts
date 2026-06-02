export function buildEventDate(date: string, time: string) {
  return new Date(`${date}T${time || "00:00"}:00+03:00`);
}

export function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
    timeZone: "Europe/Istanbul"
  }).format(buildEventDate(date, "00:00"));
}

export function createCalendarUrl(params: {
  title: string;
  date: string;
  time: string;
  venueName: string;
  address: string;
  message: string;
}) {
  const start = buildEventDate(params.date, params.time);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const format = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", params.title);
  url.searchParams.set("dates", `${format(start)}/${format(end)}`);
  url.searchParams.set("location", `${params.venueName}, ${params.address}`);
  url.searchParams.set("details", params.message);
  return url.toString();
}
