import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';

export const getLongPhilosophy = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);

  const theory = await openai.createChat({
    userPrompt: `1. 세계 모든 철학자의 이름(최소20명)에서 무작위(중요)로 1명의 철학자를 선정한다.
2. 선정된 철학자의 모든 이론에서 무작위(중요)로 1개의 이론을 선정한다.
3. 선정된 철학자와 이론에 대해서 매우 간단하게 출력한다.`,
  });

  const draft = await openai.createChat({
    userPrompt: `해당 이론을 바탕으로 사람들에게 메세지를 전달하는 썰(이야기)를 매우 매우 길게 작성해줘. \n${theory.message.content}`,
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

export const getShortPhilosophy = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);

  const theory = await openai.createChat({
    userPrompt: `1. 세계 모든 철학자의 이름(최소20명)에서 무작위(중요)로 1명의 철학자를 선정한다.
2. 선정된 철학자의 모든 이론에서 무작위(중요)로 1개의 이론을 선정한다.
3. 선정된 철학자와 이론에 대해서 매우 간단하게 출력한다.`,
  });

  const draft = await openai.createChat({
    userPrompt: `해당 이론을 바탕으로 사람들에게 메세지를 전달하는 썰(이야기)를 작성해줘. \n${theory.message.content}`,
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
