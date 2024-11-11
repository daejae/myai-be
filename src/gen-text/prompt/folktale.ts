import { OpenaiService } from 'src/openai/openai.service';
import getPrompt from './getPrompt';
import getRandomElement from 'src/common/utils/getRandomElement';
import { getStoryTitle } from './title';

const countries = [
  '독일',
  '프랑스',
  '러시아',
  '덴마크',
  '중국',
  '일본',
  '한국',
  '그리스',
  '이탈리아',
  '인도',
  '터키',
  '이집트',
  '아일랜드',
  '노르웨이',
  '핀란드',
  '브라질',
  '나이지리아',
  '멕시코',
  '태국',
  '필리핀',
];

const cities_KR = [
  '서울',
  '부산',
  '대구',
  '인천',
  '광주',
  '대전',
  '울산',
  '수원',
  '전주',
  '춘천',
  '강릉',
  '안동',
  '경주',
  '제주',
  '목포',
  '포항',
  '청주',
  '천안',
  '성남',
  '의정부',
  '김해',
  '마산',
  '진주',
  '여수',
  '순천',
  '군산',
  '익산',
  '정읍',
  '남원',
  '나주',
  '통영',
  '거제',
  '사천',
  '창원',
  '밀양',
  '양산',
  '충주',
  '제천',
  '속초',
  '동해',
  '삼척',
  '태백',
  '영주',
  '문경',
  '상주',
  '구미',
  '김천',
  '영천',
  '영덕',
  '의성',
  '울진',
  '보령',
  '서산',
  '태안',
  '공주',
  '부여',
  '논산',
  '아산',
  '예산',
  '홍성',
  '강진',
  '해남',
  '장흥',
  '진도',
  '완도',
  '고흥',
  '광양',
  '담양',
  '화순',
  '장성',
  '함평',
  '영암',
  '무안',
  '신안',
  '부안',
  '고창',
  '임실',
  '순창',
  '진안',
  '무주',
  '장수',
  '금산',
  '영동',
  '옥천',
  '괴산',
  '증평',
  '음성',
  '단양',
  '철원',
  '화천',
  '양구',
  '인제',
  '고성',
  '평창',
  '영월',
  '정선',
  '횡성',
  '홍천',
  '양평',
  '가평',
];

// 국가 코드를 국가 이름으로 매핑하는 객체
const countryMap: { [key: string]: string } = {
  Folktale_KR: '한국',
  Folktale_CN: '중국',
  Folktale_JP: '일본',
  Folktale_DK: '덴마크',
  Folktale_DE: '독일',
  Folktale_FR: '프랑스',
};

// 국가 코드를 받아 국가 이름을 반환하는 함수
function getCountryName(code: string) {
  // 코드가 맵핑되어 있지 않으면 "Unknown Country" 반환
  return countryMap[code] || null;
}

export const getLongFolktale = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);
  const country = getCountryName(category)
    ? getCountryName(category)
    : getRandomElement(countries);
  const userPrompt =
    category == 'Folktale_KR'
      ? `${country}의 ${getRandomElement(
          cities_KR,
        )}지역 동화를 썰로 매우매우 길게 작성해줘. title과 story로 JSON 객체로 반환해줘.`
      : `${country}의 동화를 썰로 매우매우 길게 작성해줘. title과 story로 JSON 객체로 반환해줘.`;

  const draft = await openai.createChat({
    userPrompt,
    model: 'gpt-4o',
    isJson: true,
  });

  const result: { title: string; story: string } = JSON.parse(
    draft.message.content,
  );

  const story = result.story;
  const title = await getStoryTitle(openai, prompt.pipelines.title, story);

  if (result.story.length < 1000)
    throw new Error(
      '롱폼(동화) 생성된 텍스트가 너무 짧음 : ' + result.story.length,
    );

  return { title, story };
};

export const getShortFolktale = async (
  openai: OpenaiService,
  category: string,
  language: string,
) => {
  const prompt = getPrompt(category, language);
  const country = getCountryName(category)
    ? getCountryName(category)
    : getRandomElement(countries);

  const userPrompt =
    category == 'Folktale_KR'
      ? `${country}의 ${getRandomElement(
          cities_KR,
        )}지역 동화를 썰로 매우매우 길게 작성해줘. title과 story로 JSON 객체로 반환해줘.`
      : `${country}의 동화를 썰로 매우매우 길게 작성해줘. title과 story로 JSON 객체로 반환해줘.`;

  const draft = await openai.createChat({
    userPrompt,
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
