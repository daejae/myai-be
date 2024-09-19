import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';
import { getStoryTitle } from './title';

export const getLongPsychology_script = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);

  const draft = await openai.createChat({
    userPrompt: `심리학에 관한 유튜브 대본 길게 써줘. 출력 타입은 반드시 {"title":string, "story":string} JSON 포맷이다.`,
    model: 'gpt-4o',
    isJson: true,
  });

  const result: { title: string; story: string } = JSON.parse(
    draft.message.content,
  );

  const story = result.story;
  const title = await getStoryTitle(openai, prompt.pipelines.title, story);

  // if (story.length < 1000)
  //   throw new Error(
  //     '롱폼(심리학 대본) 생성된 텍스트가 너무 짧음 : ' + story.length,
  //   );

  return { title, story };
};
