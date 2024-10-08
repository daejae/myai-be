import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';
import { getStoryTitle } from './title';

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
    throw new Error(
      '롱폼(공포) 생성된 텍스트가 너무 짧음 : ' + modifyDraft.length,
    );
  }

  const title = await getStoryTitle(
    openai,
    prompt.pipelines.title,
    draft.message.content,
  );

  const resultString = await openai.createChat({
    userPrompt: `${prompt.pipelines.json} \n${title}\n${modifyDraft}`,
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
    userPrompt: `400자 이내의 한국 인터넷에서 흔히 볼수 있는 공포 썰을 작성해줘.`,
    model: 'gpt-4o',
  });

  const title = await getStoryTitle(
    openai,
    prompt.pipelines.title,
    draft.message.content,
  );

  const modifyDraft = draft.message.content;
  const resultString = await openai.createChat({
    userPrompt: `${prompt.pipelines.json} \n${title}. \n${modifyDraft}`,
    isJson: true,
  });

  const result: { title: string; story: string } = JSON.parse(
    resultString.message.content,
  );

  if (result.story.length > 420)
    throw new Error(
      '숏폼(공포) 생성된 텍스트가 너무 짧음 : ' + modifyDraft.length,
    );

  return result;
};
