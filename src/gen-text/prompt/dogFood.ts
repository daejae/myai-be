import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';
import getRandomElement from 'src/common/utils/getRandomElement';

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

export const getShortDogFood = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);
  const food = getRandomElement(foods);

  const draft = await openai.createChat({
    userPrompt: `${food}를 강아지가 먹어도 되는지? 에 대해서 전문가의 입장에서 답변을 작성해줘.`,
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
