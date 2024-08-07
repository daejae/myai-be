import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';

export const getLongArt = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);

  const draft = await openai.createChat({
    userPrompt: `인터넷에서 흔히 볼 수 있는 문화와 예술에 대한 재미있는 썰을 매우 길게 작성해줘. title과 story로 JSON 객체로 반환해줘.`,
    model: 'gpt-4o',
    isJson: true,
  });

  const result: { title: string; story: string } = JSON.parse(
    draft.message.content,
  );

  if (result.story.length < 1000)
    throw new Error(
      '롱폼(예술) 생성된 텍스트가 너무 짧음 : ' + result.story.length,
    );

  return result;

  // const modifyDraft = draft.message.content;
  // if (modifyDraft.length < 1000) {
  //   throw new Error('롱폼 생성된 텍스트가 너무 짧음 : ' + modifyDraft.length);
  // }

  // const title = await openai.createChat({
  //   userPrompt: `${prompt.pipelines.title} \n${draft.message.content}`,
  // });

  // const resultString = await openai.createChat({
  //   userPrompt: `${prompt.pipelines.json} \n${title.message.content}\n${draft.message.content}`,
  //   isJson: true,
  // });

  // return JSON.parse(resultString.message.content);
};

export const getShortArt = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);

  const draft = await openai.createChat({
    userPrompt: `인터넷에서 흔히 볼 수 있는 문화와 예술에 대한 재미있는 썰을 작성해줘. title과 story로 JSON 객체로 반환해줘.`,
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

  // let modifyDraft = draft.message.content;

  // while (modifyDraft.length > +prompt.pipelines.lengthGoal) {
  //   const resizeResult = await openai.createChat({
  //     userPrompt: `${prompt.pipelines.length} \n ${modifyDraft}`,
  //   });

  //   modifyDraft = resizeResult.message.content;
  // }

  // const title = await openai.createChat({
  //   userPrompt: `${prompt.pipelines.title} \n${draft.message.content}`,
  // });

  // const resultString = await openai.createChat({
  //   userPrompt: `${prompt.pipelines.json} \n${title.message.content}\n${modifyDraft}`,
  //   isJson: true,
  // });

  // return JSON.parse(resultString.message.content);
};
