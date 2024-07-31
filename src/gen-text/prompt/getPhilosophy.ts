import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';

const philosopherList = [
  '이마누엘 칸트',
  '아리스토텔레스 ',
  '존 스튜어트 밀',
  '플라톤 ',
  '소크라테스',
  '프리드리히 니체',
  '존 롤스 ',
  '마이클 샌델',
  '제레미 벤담',
  '데이비드 흄',
  '토마스 아퀴나스',
  '토마스 홉스',
  '장자크 루소',
  '피터 싱어',
  '앨리자베스 앤스콤',
  '버나드 윌리엄스',
  '에픽테토스',
  '에피쿠로스',
  '스피노자',
  '존 로크',
  '알랭 바디우',
  '길버트 하먼',
  '맥스 셸러',
  '이삭 아시모프',
  '공자',
  '맹자',
  '노자 ',
  '퇴계이황 ',
  '율곡 ',
];

const getRandomPhilosopher = (philosophers: string[]) => {
  const randomIndex = Math.floor(Math.random() * philosophers.length);
  return philosophers[randomIndex];
};

export const getLongPhilosophy = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);
  const philosopher = getRandomPhilosopher(philosopherList);

  const theory = await openai.createChat({
    userPrompt: `철학자 ${philosopher}의 모든 이론 중 랜덤으로 한개만 골라서 간단하게 설명해줘.`,
    model: 'gpt-4o',
  });

  const draft = await openai.createChat({
    userPrompt: `해당 이론을 바탕으로 사람들에게 메시지를 전달하는 재미있는 썰을 1개만 매우 길게 작성해줘.  \n${theory.message.content}`,
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
  const philosopher = getRandomPhilosopher(philosopherList);

  const theory = await openai.createChat({
    userPrompt: `철학자 ${philosopher}의 모든 이론 중 랜덤으로 한개만 골라서 간단하게 설명해줘.`,
    model: 'gpt-4o',
  });

  const draft = await openai.createChat({
    userPrompt: `해당 이론을 바탕으로 사람들에게 메시지를 전달하는 재미있는 썰을 1개만 매우 길게 작성해줘.  \n${theory.message.content}`,
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
