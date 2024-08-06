import * as fs from 'fs';
import * as path from 'path';

const foods = [
  '초콜릿',
  '포도',
  '양파',
  '마늘',
  '부추',
  '알코올',
  '카페인',
  '아보카도',
  '견과류',
  '자일리톨',
  '닭고기',
  '소고기',
  '연어',
  '당근',
  '고구마',
  '호박',
  '블루베리',
  '오이',
  '사과',
  '브로콜리',
  '계란',
  '오트밀',
];

const indexFilePath = path.join(__dirname, 'currentIndex.txt');

function loadIndex(): number {
  if (fs.existsSync(indexFilePath)) {
    const savedIndex = fs.readFileSync(indexFilePath, 'utf-8');
    return parseInt(savedIndex, 10);
  }
  return 0;
}

function saveIndex(index: number): void {
  fs.writeFileSync(indexFilePath, index.toString());
}

export function getNextFood(): string {
  let currentIndex = loadIndex();
  const food = foods[currentIndex];
  currentIndex = (currentIndex + 1) % foods.length;
  saveIndex(currentIndex);
  return food;
}
