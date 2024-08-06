import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';

const getRandomYear = (min = 100, max = 2000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getLongScience = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);

  const draft = await openai.createChat({
    userPrompt: `Tell me one interesting story about a scientific discovery from ${getRandomYear()}`,
    model: 'gpt-4o',
  });

  const tranlate = await openai.createChat({
    userPrompt: `해당 이야기를 한국 인터넷에서 흔히 볼 수 있는 재미있는 썰로 매우 길게 수정 또는 재작성해줘.\n${draft.message.content}`,
    model: 'gpt-4o',
  });

  const modifyDraft = tranlate.message.content;
  if (modifyDraft.length < 1000) {
    throw new Error('롱폼 생성된 텍스트가 너무 짧음 : ' + modifyDraft.length);
  }

  const title = await openai.createChat({
    userPrompt: `${prompt.pipelines.title} \n${modifyDraft}`,
  });

  const resultString = await openai.createChat({
    userPrompt: `${prompt.pipelines.json} \n${title.message.content}\n${modifyDraft}`,
    isJson: true,
  });

  return JSON.parse(resultString.message.content);
};

export const getShortScience = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);
  let draft = await openai.createChat({
    userPrompt: `Tell me one interesting story about a scientific discovery from ${getRandomYear()}`,
    model: 'gpt-4o',
  });

  draft = await openai.createChat({
    userPrompt: `해당 이야기를 한국 인터넷에서 흔히 볼 수 있는 재미있는 썰로 매우 길게 수정 또는 재작성해줘.\n${draft.message.content}`,
    model: 'gpt-4o',
  });

  const title = await openai.createChat({
    userPrompt: `${prompt.pipelines.title} \n${draft.message.content}`,
  });

  let modifyDraft = draft.message.content;

  while (modifyDraft.length > +prompt.pipelines.lengthGoal) {
    const resizeResult = await openai.createChat({
      userPrompt: `${prompt.pipelines.length} \n ${modifyDraft}`,
    });

    modifyDraft = resizeResult.message.content;
  }

  const resultString = await openai.createChat({
    userPrompt: `${prompt.pipelines.json} \n${title.message.content}. \n${modifyDraft}`,
    isJson: true,
  });

  return JSON.parse(resultString.message.content);
};
