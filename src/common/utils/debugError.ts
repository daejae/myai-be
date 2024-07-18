export function debugError(error: any): string {
  const errorDetails: { [key: string]: any } = {};

  // 기본적인 에러 메시지와 스택 추적
  if (error instanceof Error) {
    errorDetails.message = error.message;
    errorDetails.stack = error.stack;
  }

  // 에러 객체에 포함된 다른 속성들 추가
  for (const key in error) {
    if (error.hasOwnProperty(key)) {
      errorDetails[key] = error[key];
    }
  }

  // 객체를 문자열로 변환
  return JSON.stringify(errorDetails, null, 2);
}
