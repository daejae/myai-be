export default function (strings: string[]): string {
  const length = strings.length;
  const randomIndex = Math.floor(Math.random() * length);
  return strings[randomIndex];
}
