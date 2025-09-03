import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Export the initialized AI instance for use in stateful components like the Chatbot
export { ai };

export const generateImage = async (prompt: string, numberOfImages: number, aspectRatio: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: numberOfImages,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
        } else {
            throw new Error("Sorry, I couldn't generate an image for that prompt. Please try a different one.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("An error occurred while generating the image. The prompt may have been rejected. Please try again with a different prompt.");
    }
};

export const explainCode = async (code: string, language: string): Promise<string> => {
  const prompt = `You are an expert programmer and code reviewer.
  Your task is to provide a clear and concise explanation of the following code snippet written in ${language}.
  
  Explain:
  - What the code does.
  - How it works, step-by-step.
  - Any potential improvements or best practices related to the code.
  
  Format your response in Markdown for readability, using code blocks for snippets.
  
  Code Snippet (${language}):
  ---
  ${code}
  ---
  
  Explanation:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error explaining code:", error);
    throw new Error("Sorry, I couldn't explain the code. The AI may have been unable to process the request. Please try again.");
  }
};

export const generateRecipe = async (ingredients: string, diet: string): Promise<string> => {
  const dietRequirement = diet ? `The recipe should adhere to the following dietary restrictions: ${diet}.` : "There are no specific dietary restrictions.";

  const prompt = `You are an expert chef. Create a delicious recipe based on the ingredients provided.
  
  Your response should be formatted in Markdown and include:
  - A creative recipe title.
  - A brief, enticing description of the dish.
  - A list of ingredients (including the ones provided and any others needed).
  - Step-by-step instructions for preparation and cooking.
  - Estimated prep time, cook time, and total time.
  - Number of servings.

  Ingredients provided:
  ${ingredients}
  
  Dietary restrictions:
  ${dietRequirement}
  
  Please generate the recipe now.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Sorry, I couldn't create a recipe at the moment. Please try again later.");
  }
};

export const generateWebsite = async (prompt: string): Promise<{ html: string; css: string; js: string; }> => {
  const systemInstruction = `You are an expert web developer. Your task is to generate a complete, single-page website based on the user's prompt.
  - You must return a single JSON object with three keys: "html", "css", and "js".
  - The "html" key should contain the body content of the page. Do NOT include <html>, <head>, or <body> tags.
  - The "css" key should contain all the necessary styles to make the page look modern, professional, and responsive.
  - The "js" key should contain any necessary JavaScript for interactivity. If no JS is needed, return an empty string.
  - Use placeholder images from a service like picsum.photos if images are requested.
  - Ensure the final result is visually appealing and adheres to modern design principles.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            html: { type: Type.STRING },
            css: { type: Type.STRING },
            js: { type: Type.STRING },
          },
          required: ["html", "css", "js"],
        },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error("Error generating website:", error);
    throw new Error("Sorry, I couldn't generate the website. The prompt may have been rejected or an unexpected error occurred. Please try again.");
  }
};

export interface UIComponent {
  type: 'container' | 'header' | 'text' | 'image' | 'button' | 'input';
  properties: {
    title?: string;
    content?: string;
    src?: string;
    alt?: string;
    label?: string;
    placeholder?: string;
    [key: string]: any;
  };
  children?: UIComponent[];
}

export const generateMobileAppUI = async (prompt: string): Promise<{ components: UIComponent[] }> => {
  const systemInstruction = `You are an expert mobile UI designer. Your task is to generate a UI layout for a mobile app screen based on the user's prompt.
  - You must return a single JSON object with a "components" key.
  - The "components" key should contain an array of component objects.
  - Each component object must have a "type" and a "properties" object.
  - A component can optionally have a "children" array for nested components. This is primarily for the 'container' type.
  - Supported component types are: 'container', 'header', 'text', 'image', 'button', 'input'.
  - For each type, use the appropriate properties:
    - 'header': { "title": "Your Header Text" }
    - 'text': { "content": "Your paragraph text." }
    - 'image': { "src": "https://picsum.photos/seed/picsum/400/200", "alt": "A descriptive alt text" }
    - 'button': { "label": "Click Me" }
    - 'input': { "placeholder": "Enter text here..." }
  - 'container' type is used for grouping other components. Its 'properties' object can be empty. Its children will be rendered in a column.
  - Structure the components logically to represent the requested app screen. Make it look like a real app screen.`;
  
  const componentSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, description: "e.g., container, header, text, image, button, input" },
        properties: { type: Type.OBJECT, description: "e.g., { title: '...' } or { content: '...' }" },
        children: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT }
        }
    },
    required: ["type", "properties"]
  };
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            components: {
              type: Type.ARRAY,
              items: componentSchema
            }
          },
          required: ["components"]
        },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error("Error generating mobile app UI:", error);
    throw new Error("Sorry, I couldn't generate the mobile UI. The prompt may have been rejected or an unexpected error occurred. Please try again.");
  }
};

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }[];
  };
  options?: any;
}

export const generateChartData = async (prompt: string): Promise<ChartData> => {
    const systemInstruction = `You are an expert data visualization AI. Your task is to transform a user's natural language prompt into a structured JSON object compatible with Chart.js.
- You must return a single JSON object.
- The root object must have a "type" property (e.g., 'bar', 'line', 'pie') and a "data" property.
- The "data" property must contain "labels" (an array of strings) and "datasets" (an array of objects).
- Each object in "datasets" must have a "label" (string) and "data" (an array of numbers corresponding to the labels).
- You can optionally include Chart.js-compatible styling properties like "backgroundColor" or "borderColor" in the dataset objects to make the chart visually appealing. Use arrays of hex color codes for these if you do.
- Do not invent data if the prompt doesn't provide it. If data is implicit (e.g., "top 5 programming languages"), use your knowledge to provide it.
- Ensure the length of the 'data' array in each dataset matches the length of the 'labels' array.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: "The type of chart, e.g., 'bar', 'line', 'pie'." },
            data: {
              type: Type.OBJECT,
              properties: {
                labels: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                datasets: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      data: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                      backgroundColor: { type: Type.ARRAY, items: { type: Type.STRING } },
                      borderColor: { type: Type.ARRAY, items: { type: Type.STRING } },
                      borderWidth: { type: Type.NUMBER }
                    },
                    required: ["label", "data"]
                  }
                }
              },
              required: ["labels", "datasets"]
            },
            options: { type: Type.OBJECT, description: "Optional Chart.js options object." }
          },
          required: ["type", "data"]
        },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error("Error generating chart data:", error);
    throw new Error("Sorry, I couldn't generate the chart. The prompt may have been unclear or an unexpected error occurred. Please try again.");
  }
};

export interface ContentAnalysis {
  classification: 'Likely AI-generated' | 'Likely Human-written' | 'Uncertain';
  confidence: number;
  reasoning: string;
}

export const analyzeContent = async (text: string): Promise<ContentAnalysis> => {
  const systemInstruction = `You are an expert content analyst. Your task is to analyze the provided text and determine if it was written by an AI or a human.
  - Return a single JSON object.
  - The object must have three keys: "classification", "confidence", and "reasoning".
  - "classification" must be one of three strings: 'Likely AI-generated', 'Likely Human-written', or 'Uncertain'.
  - "confidence" must be a number between 0 and 1, representing your confidence in the classification. 1 means 100% certain.
  - "reasoning" must be a string briefly explaining the factors that led to your conclusion (e.g., sentence structure, vocabulary, tone, presence of personal anecdotes).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Please analyze the following text:\n\n---\n\n${text}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
          },
          required: ["classification", "confidence", "reasoning"],
        },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error("Error analyzing content:", error);
    throw new Error("Sorry, I couldn't analyze the content. The AI may have been unable to process the request. Please try again.");
  }
};

export const humanizeContent = async (text: string): Promise<string> => {
  const prompt = `You are an expert copywriter specializing in making text sound more human and natural.
  Rewrite the following text to make it less robotic and more engaging.
  - Vary sentence length and structure.
  - Use more natural language and conversational tone.
  - Inject a bit of personality where appropriate.
  - Do not add new information, just rephrase the existing content.
  - Return only the rewritten text.
  
  Original Text:
  ---
  ${text}
  ---
  
  Humanized Version:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error humanizing content:", error);
    return "Sorry, I couldn't rewrite the text at the moment. Please try again later.";
  }
};

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
}

export const detectLanguage = async (code: string): Promise<LanguageDetectionResult> => {
  const systemInstruction = `You are an expert programmer with deep knowledge of hundreds of programming languages. Your task is to analyze a code snippet and identify the programming language it is written in.
  - Return a single JSON object.
  - The object must have two keys: "language" and "confidence".
  - "language" must be the name of the detected programming language (e.g., "JavaScript", "Python", "Unknown").
  - "confidence" must be a number between 0 and 1, representing your confidence in the detection. 1 means 100% certain.
  - If you cannot determine the language, return "Unknown" with a low confidence score.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Please analyze the following code snippet and identify its programming language:\n\n---\n\n${code}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            language: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: ["language", "confidence"],
        },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error("Error detecting language:", error);
    throw new Error("Sorry, I couldn't identify the language. The AI may have been unable to process the request. Please try again.");
  }
};