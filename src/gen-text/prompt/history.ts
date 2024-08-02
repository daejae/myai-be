import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';
import getRandomElement from 'src/common/utils/getRandomElement';

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

export const getLongHistory = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);
  const country = getRandomElement(countries);

  const draft = await openai.createChat({
    userPrompt: `인터넷에서 흔히 볼 수 있는 ${country} 역사적 사건에 대한 재미있는 썰을 길게 작성해줘. 썰만 출력.`,
    model: 'gpt-4o',
  });

  const modifyDraft = draft.message.content;
  if (modifyDraft.length < 1000) {
    throw new Error('롱폼 생성된 텍스트가 너무 짧음 : ' + modifyDraft.length);
  }

  const title = await openai.createChat({
    userPrompt: `${prompt.pipelines.title} \n${draft.message.content}`,
  });

  const resultString = await openai.createChat({
    userPrompt: `${prompt.pipelines.json} \n${title.message.content}\n${draft.message.content}`,
    isJson: true,
  });

  return JSON.parse(resultString.message.content);
};

export const getShortHistory = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);
  const country = '영국';

  const draft = await openai.createChat({
    userPrompt: `인터넷에서 흔히 볼 수 있는 ${country} 역사적 사건에 대한 재미있는 썰을 작성해줘. 썰만 출력.`,
    model: 'gpt-4o',
  });

  let modifyDraft = draft.message.content;

  while (modifyDraft.length > +prompt.pipelines.lengthGoal) {
    const resizeResult = await openai.createChat({
      userPrompt: `${prompt.pipelines.length} \n ${modifyDraft}`,
    });

    modifyDraft = resizeResult.message.content;
  }

  const title = await openai.createChat({
    userPrompt: `${prompt.pipelines.title} \n${draft.message.content}`,
  });

  const resultString = await openai.createChat({
    userPrompt: `${prompt.pipelines.json} \n${title.message.content}\n${modifyDraft}`,
    isJson: true,
  });

  return JSON.parse(resultString.message.content);
};
