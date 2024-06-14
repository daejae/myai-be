export function extractJsonFromString(str: string) {
  const startIndex = str.indexOf('{'); // JSON 시작 지점 찾기
  if (startIndex === -1) return null; // 시작 괄호가 없으면 null 반환

  let counter = 1; // 중괄호 카운터 시작
  for (let i = startIndex + 1; i < str.length; i++) {
    if (str[i] === '{') {
      counter++;
    } else if (str[i] === '}') {
      counter--;
      if (counter === 0) {
        // JSON 종료 지점 찾기
        return str.substring(startIndex, i + 1);
      }
    }
  }
  // 완전한 JSON 구조가 아니면 null 반환
  return '';
}
