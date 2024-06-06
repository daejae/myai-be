export default () => ({
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
