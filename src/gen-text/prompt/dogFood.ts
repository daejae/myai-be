import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';
import { getNextFood } from './dogFood.const';

export const getShortDogFood = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);
  const food = getNextFood();
  const draft = await openai.createChat({
    userPrompt: `${food}를 강아지가 먹어도 되는지? 에 대해서 전문가의 입장에서 답변을 작성해줘. title과 story로 JSON 객체로 반환해줘.`,
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
