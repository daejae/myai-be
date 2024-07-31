const promptMap = {
  horror: {
    ko: '한국 인터넷에서 흔히 볼수 있는 공포 썰을 매우 매우 길게 작성해줘.',
    en: 'Please write a scary story similar to those commonly found on the internet.',
    jp: '日本のインターネットでよく見かける怖い話のようなエピソードを書いてください。',
  },
  philosophy: {
    ko: '한국 인터넷에서 흔히 볼수 있는 소크라테스 썰 작성해줘.',
    en: 'Write a philosophy story.',
    jp: '哲学の話を書いてください。',
  },
  pipeline: {
    title: {
      ko: '해당 이야기를 바탕으로 업로드 되어질 영상의 제목을 추천해줘, 유튜브 영상의 제목으로 가장 적절한 제목 1개만 알려줘.',
      en: 'Please recommend a title for the video to be uploaded based on this story. Provide the most appropriate title for a YouTube video.',
      jp: 'この話をもとにアップロードされる動画のタイトルを推薦してください。YouTube動画のタイトルとして最も適切なタイトルを1つ教えてください。',
    },
    length: {
      ko: '이야기 줄여줘.',
      en: 'Please shorten the story.',
      jp: '物語を短くしてください。',
    },
    lengthGoal: {
      ko: '400',
      en: '800',
      jp: '500',
    },
    json: {
      ko: '이야기를 JSON 포맷으로 변경, JSON은 반드시 "title"과 "story"롤 가진다. "title"과 "story"는 반드시 string 타입.',
      en: 'Please convert the story to JSON format. The JSON must have "title" and "story". Both "title" and "story" must be of string type.',
      jp: '物語をJSON形式に変換してください。JSONは必ず"title"と"story"を持っている必要があります。"title"と"story"は必ず文字列型です。',
    },
  },
};

interface PromptResponse {
  categoryMessage: string;
  pipelines: {
    [key: string]: string;
  };
}

export default function (category: string, language: string): PromptResponse {
  let categoryMessage = `${category} 썰 작성해줘.`;
  const pipelines: { [key: string]: string } = {};

  if (promptMap[category] && promptMap[category][language]) {
    categoryMessage = promptMap[category][language];
  }

  if (promptMap.pipeline) {
    for (const subcategory in promptMap.pipeline) {
      if (promptMap.pipeline[subcategory][language]) {
        pipelines[subcategory] = promptMap.pipeline[subcategory][language];
      }
    }
  }

  return {
    categoryMessage,
    pipelines,
  };
}
