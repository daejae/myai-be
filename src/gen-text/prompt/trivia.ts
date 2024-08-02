import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';

export const getLongTrivia = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);

  const draft = await openai.createChat({
    userPrompt: `인터넷에서 흔히 볼 수 있는 쓸모없지만 알아두면 재미있는 상식 썰을 매우매우 길게 작성해줘. title과 story로 JSON 객체로 반환해줘.`,
    model: 'gpt-4o',
    isJson: true,
  });

  const result: { title: string; story: string } = JSON.parse(
    draft.message.content,
  );

  if (result.story.length < 1000)
    throw new Error(
      '롱폼(잡학) 생성된 텍스트가 너무 짧음 : ' + result.story.length,
    );

  return result;
};

export const getShortTrivia = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);

  const draft = await openai.createChat({
    userPrompt: `인터넷에서 흔히 볼 수 있는 쓸모없지만 알아두면 재미있는 상식 썰을 매우매우 길게 작성해줘. title과 story로 JSON 객체로 반환해줘.`,
    model: 'gpt-4o',
    isJson: true,
  });

  const result: { title: string; story: string } = JSON.parse(
    draft.message.content,
  );

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

  return modifyDraft;
};
