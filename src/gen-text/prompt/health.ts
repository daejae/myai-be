import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';
import { getStoryTitle } from './title';

function getRandomItem(data: { title: string[] }): string {
  const randomIndex = Math.floor(Math.random() * data.title.length);
  return data.title[randomIndex];
}

export const getLongHealth = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);
  const ai = openai.getClient();

  const response = await ai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '인터넷에서 흔히볼수 있는 건강정보에 대해 제목을 10개 뽑아줘.',
          },
        ],
      },
    ],
    temperature: 1,
    max_tokens: 4096,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'title_list',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            title: {
              type: 'array',
              description: 'A list of titles.',
              items: {
                type: 'string',
                description: 'A title represented as a string.',
              },
            },
          },
          required: ['title'],
          additionalProperties: false,
        },
      },
    },
  });

  const healthTitle: { title: string[] } = JSON.parse(
    response.choices[0].message.content as string,
  );

  const topic = getRandomItem(healthTitle);
  const draft = await openai.createChat({
    userPrompt: `${topic}에 관련된 이야기를 썰로 매우매우 길게 작성해줘. title과 story로 JSON 객체로 반환해줘.`,
    model: 'gpt-4o',
    isJson: true,
  });

  const modifyDraft = draft.message.content;
  if (modifyDraft.length < 1000) {
    throw new Error(
      '롱폼(건강) 생성된 텍스트가 너무 짧음 : ' + modifyDraft.length,
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

export const getShortHealth = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);
  const ai = openai.getClient();

  const response = await ai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '인터넷에서 흔히볼수 있는 건강정보에 대해 제목을 10개 뽑아줘.',
          },
        ],
      },
    ],
    temperature: 1,
    max_tokens: 4096,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'title_list',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            title: {
              type: 'array',
              description: 'A list of titles.',
              items: {
                type: 'string',
                description: 'A title represented as a string.',
              },
            },
          },
          required: ['title'],
          additionalProperties: false,
        },
      },
    },
  });

  const healthTitle: { title: string[] } = JSON.parse(
    response.choices[0].message.content as string,
  );

  const topic = getRandomItem(healthTitle);
  const draft = await openai.createChat({
    userPrompt: `${topic}에 관련된 이야기를 썰로 매우매우 길게 작성해줘. title과 story로 JSON 객체로 반환해줘.`,
    model: 'gpt-4o',
    isJson: true,
  });

  const result: { title: string; story: string } = JSON.parse(
    draft.message.content,
  );

  const story = result.story;
  const title = await getStoryTitle(openai, prompt.pipelines.title, story);

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

  return { title, story: modifyDraft.story };
};
