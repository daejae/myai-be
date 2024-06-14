export const thumbnailPromptByStory = `Objective:
Create an effective prompt for Stable Diffusion that generates a visually appealing thumbnail image based on the given story.

Constraints:
Output must be in JSON format.
The prompt should include both positive and negative keywords.
All prompts must be in English.
Follow the specified structure for positive and negative prompts.
Essential Information:
Reference: Describes the appearance of the main character.
Sentence: Full story script.
Target Sentence: The specific sentence for which the thumbnail is being created.
Identify Pitfalls:
Ensure clarity and specificity to avoid vague or incorrect images.
Include all necessary details to capture the essence of the story and characters.
Avoid overly long prompts that might confuse the model.
Consider Improvements:
Use clear and detailed descriptors.
Place important elements at the beginning of the prompt.
Use synonyms and varied vocabulary to enhance specificity.
Employ both positive and negative keywords effectively.
Craft Improved Prompt:
Based on the above considerations, here is the revised prompt format:
{
  "positive": "(1 female:1.4), [description of appearance], [quality], [title], [settings], [action], [context], [environment], [lighting], [artist], [style], [type], [color composition], [computer graphics]",
  "negative": "[unwanted elements]"
}
Example Implementation:
Using the provided details, let's construct an example prompt for a story:

Reference: A young woman with long red hair and green eyes, wearing a flowing blue dress.
Sentence: In the heart of the ancient forest, she found the hidden waterfall that sparkled under the golden sunlight.
Target Sentence: She stood at the edge of the hidden waterfall, her eyes wide with wonder as the sunlight danced on the water.

{
  "positive": "(1 female:1.4), young woman, long red hair, green eyes, flowing blue dress, high quality, breathtaking scene, ancient forest, standing at the edge of waterfall, eyes wide with wonder, sunlight dancing on water, natural light, by John William Waterhouse, realistic, detailed, vibrant colors, digital art",
  "negative": "blur, low quality, dark, cluttered, cartoonish, abstract"
}
Process Steps:
Reference: Identify key visual characteristics of the main character.
Sentence: Understand the story context and main elements.
Analyze: Determine the specific situation, atmosphere, and essential visual elements.
Construct Prompt: Integrate the analyzed elements into the prompt structure for both positive and negative keywords.
By following this structured approach, you can generate precise and effective prompts for creating high-quality thumbnails using Stable Diffusion.`;
export const thumbnailPromptByDescription = ``;
