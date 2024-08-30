import { OpenaiService } from 'src/openai/openai.service';

export const getStoryTitle = async (
  openai: OpenaiService,
  titlePrompt: string,
  input: string,
  outputLenght = 20,
) => {
  let title: string;

  while (true) {
    const reuslt = await openai.createChat({
      userPrompt: `${titlePrompt} \n${input}`,
    });

    title = reuslt.message.content;
    console.log(title.length);
    console.log(title);

    if (title.length <= outputLenght) break;
  }

  return title;
};
