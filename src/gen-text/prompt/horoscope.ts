import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';
import getCurrentDateFormatted from 'src/common/utils/getCurrentDateFormatted';

export const getShortHoroscope = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);

  const draft = await openai.createChat({
    userPrompt: `${getCurrentDateFormatted()}의 오행에 대한 정보를 썰로 짧게 작성해줘. title과 story로 JSON 객체로 반환해줘.`,
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
