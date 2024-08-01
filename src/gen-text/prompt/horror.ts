import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';

export const getLongHorror = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);

  const draft = await openai.createChat({
    userPrompt: prompt.categoryMessage,
    model: 'gpt-4o',
  });

  const modifyDraft = draft.message.content;
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

export const getShortHorror = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);

  const draft = await openai.createChat({
    userPrompt: prompt.categoryMessage,
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