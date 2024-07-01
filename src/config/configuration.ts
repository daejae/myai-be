export default () => ({
  aws: {
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  openai: {
    apiKey: process.env.GPT_API,
    test: {
      assistantId: process.env.TEST_ASSISTANT,
      threadId: process.env.TEST_THREAD,
    },
    fear: {
      assistantId: process.env.GPT_FEAR_ASSISTANT,
      threadId: process.env.GPT_FEAR_THREAD,
    },
    get horror() {
      return this.fear;
    },
    greek_mythology: {
      assistantId: process.env.GREEK_MYTHOLOGY_ASSISTANT_ID,
      threadId: process.env.GREEK_MYTHOLOGY_THREAD_ID,
    },
    socrates: {
      assistantId: process.env.SOCRATES_ASSISTANT_ID,
      threadId: process.env.SOCRATES_THREAD_ID,
    },
    nietzsche: {
      assistantId: process.env.NIETZSCHE_ASSISTANT_ID,
      threadId: process.env.NIETZSCHE_THREAD_ID,
    },
    fairytale: {
      assistantId: process.env.FAIRYTALE_ASSISTANT_ID,
      threadId: process.env.FAIRYTALE_THREAD_ID,
    },
  },
  app: {
    port: parseInt(process.env.APP_PORT, 10) || 3000,
    environment: process.env.NODE_ENV || 'development',
  },
});
