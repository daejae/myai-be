import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';
import getRandomElement from 'src/common/utils/getRandomElement';
import { getStoryTitle } from './title';

const countries = [
  '독일',
  '프랑스',
  '러시아',
  '덴마크',
  '중국',
  '일본',
  '한국',
  '그리스',
  '이탈리아',
  '인도',
  '터키',
  '이집트',
  '아일랜드',
  '노르웨이',
  '핀란드',
  '브라질',
  '나이지리아',
  '멕시코',
  '태국',
  '필리핀',
];

// 국가 코드를 국가 이름으로 매핑하는 객체
const countryMap: { [key: string]: string } = {
  Folktale_KR: '한국',
  Folktale_CN: '중국',
  Folktale_JP: '일본',
  Folktale_DK: '덴마크',
  Folktale_DE: '독일',
  Folktale_FR: '프랑스',
};

// 국가 코드를 받아 국가 이름을 반환하는 함수
function getCountryName(code: string) {
  // 코드가 맵핑되어 있지 않으면 "Unknown Country" 반환
  return countryMap[code] || null;
}

export const getLongFolktale = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);
  const country = getCountryName(category)
    ? getCountryName(category)
    : getRandomElement(countries);

  const draft = await openai.createChat({
    userPrompt: `${country}의 동화를 썰로 매우매우 길게 작성해줘. title과 story로 JSON 객체로 반환해줘.`,
    model: 'gpt-4o',
    isJson: true,
  });

  const result: { title: string; story: string } = JSON.parse(
    draft.message.content,
  );

  const story = result.story;
  const title = await getStoryTitle(openai, prompt.pipelines.title, story);

  if (result.story.length < 1000)
    throw new Error(
      '롱폼(동화) 생성된 텍스트가 너무 짧음 : ' + result.story.length,
    );

  return { title, story };
};

export const getShortFolktale = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);
  const country = getCountryName(category)
    ? getCountryName(category)
    : getRandomElement(countries);

  const draft = await openai.createChat({
    userPrompt: `${country}의 동화를 썰로 매우매우 길게 작성해줘. title과 story로 JSON 객체로 반환해줘.`,
    model: 'gpt-4o',
    isJson: true,
  });

  const result: { title: string; story: string } = JSON.parse(
    draft.message.content,
  );

  const story = result.story;
  const title = await getStoryTitle(openai, prompt.pipelines.title, story);

  let modifyDraft = result;

  while (modifyDraft.story.length > +prompt.pipelines.lengthGoal) {
    const resizeResult = await openai.createChat({
      userPrompt: `JSON 포맷은 유지하고 story 줄여줘.\n${JSON.stringify(
        modifyDraft,
      )}`,
      isJson: true,
    });

    modifyDraft = JSON.parse(resizeResult.message.content);
  }

  return { title, story: modifyDraft.story };
};
