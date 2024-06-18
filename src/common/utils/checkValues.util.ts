import { HttpException, HttpStatus } from '@nestjs/common';

export function checkValues(
  story: string | undefined,
  description: string | undefined,
): boolean {
  const isEmpty = (value: string | undefined): boolean =>
    !value || value.trim() === '';

  if (!isEmpty(description)) {
    return true;
  }
  if (!isEmpty(story)) {
    return false;
  }

  throw new HttpException(
    'invalid body(story, description)',
    HttpStatus.BAD_REQUEST,
  );
}
