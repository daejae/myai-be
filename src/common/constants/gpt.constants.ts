export const thumbnailPromptByStory = `Objective:
Create a structured approach for generating effective prompts for text-to-image models based on user inputs. The prompts should consider character appearance, the story context, and specific keywords, ensuring the generated images align with the user’s vision.

Constraints:
All prompts must be in English.
The output must include both positive and negative prompts.
The prompt must be formatted as a JSON object with positive and negative keys.
If the includePerson value is true, the generated image must include a person.
Essential Information:
Reference: Describes the appearance of the main character.
Sentence: Provides a full story script to understand characters, situations, atmosphere, and content.
Target_sentence: Specifies the key element that should be visualized.
IncludePerson: Indicates whether the image should include a person.
Pitfalls:
Ambiguous or vague descriptions may lead to irrelevant or incorrect image generation.
Overly complex prompts can confuse the model, leading to suboptimal results.
Improvements:
Use clear and concise language.
Ensure the structure of the prompt is consistent.
Place the most important details at the beginning of the prompt.
Utilize both positive and negative prompts effectively.

Crafted Improved Prompt:
{
  "input": {
    "includePerson": true,
    "story": "In a bustling city, a lone figure stands at the edge of a rooftop, looking out over the horizon as the sun sets, casting a golden hue over the skyline."
  },
  "output": {
    "positive": "(1 male:1.4), lone figure, edge of rooftop, looking out over the horizon, sunset, golden hue, bustling city skyline, cinematic lighting, by Greg Rutkowski",
    "negative": "blurry, dark, low quality, grainy, cartoonish"
  }
}

Process Explanation:
Reference: Not provided in this example, but would typically describe the lone figure's appearance.
Sentence: "In a bustling city, a lone figure stands at the edge of a rooftop, looking out over the horizon as the sun sets, casting a golden hue over the skyline."
Target_sentence: The key scene to visualize is the figure standing at the rooftop during sunset in a bustling city.
IncludePerson: true, so the prompt includes a person.
Generated Prompt Breakdown:
Positive:
(1 male:1.4): Indicates one male figure.
lone figure, edge of rooftop, looking out over the horizon, sunset, golden hue, bustling city skyline, cinematic lighting, by Greg Rutkowski: Describes the scene and aesthetic elements.
Negative:
blurry, dark, low quality, grainy, cartoonish: Specifies undesirable attributes.
By following this structured approach, the prompt effectively guides the model to generate an image that aligns with the user’s vision, ensuring clarity and relevance.`;

export const thumbnailPromptByDescription = `Objective:
Generate an image prompt based on the user's input.

Constraints:
The output must be in JSON format.
The prompt must include positive and negative terms as described.
Use English for all outputs.
Translate non-English keywords if present.

Essential Information:
IncludePerson: Whether the image should include people or not.
Description: The detailed scene or subject for the image.

Pitfalls:
Overly generic descriptions.
Missing important context or details.
Incorrect use of positive and negative prompt structures.
Process:
Analyze the content of the 'description' to fully understand the characters, situations, atmosphere, and content as a whole.
Construct the positive prompt with detailed and specific terms.
List the negative prompt terms without modifiers.
Ensure the prompt structure adheres to the required format.

Example Input and Output:
Input:
{
    "includePerson": true,
    "description": "A futuristic cityscape with flying cars and neon lights"
}
Output:
{
    "positive": "(1 male:1.4), futuristic cityscape, flying cars, neon lights, high detail, dynamic lighting, cyberpunk style",
    "negative": "blurry, low detail, dark, outdated"
}
Improved Prompt Based on User's Instructions:
IncludePerson: Check if people should be included.
Description: Use this to describe the scene.

Craft Improved Prompt:
Let's create a prompt for the given example:
{
    "includePerson": true,
    "description": "A serene forest landscape with a small waterfall and a rainbow"
}

Output:
{
    "positive": "(1 female:1.4), serene forest landscape, small waterfall, rainbow, natural lighting, high detail, vibrant colors, peaceful atmosphere, photorealistic",
    "negative": "artificial, dark, blurry, crowded, monochrome"
}
By following this structure, we ensure the prompt is clear, detailed, and suitable for generating high-quality images with the specified models.`;
