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
    fearAssistantId: process.env.GPT_FEAR_ASSISTANT,
    fearThreadId: process.env.GPT_FEAR_THREAD,
  },
  app: {
    port: parseInt(process.env.APP_PORT, 10) || 3000,
    environment: process.env.NODE_ENV || 'development',
  },
});
