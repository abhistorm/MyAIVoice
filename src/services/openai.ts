
// Simulated assistant responses without OpenAI API
interface ChatCompletionRequest {
  messages: { role: string; content: string }[];
}

// Predefined responses for the specific questions
const PREDEFINED_RESPONSES: Record<string, string> = {
  "life story": "I grew up in a small coastal town where I developed a passion for marine biology. After completing my studies, I traveled extensively, documenting marine ecosystems across three continents. Now I balance research work with teaching at a local university, hoping to inspire the next generation of ocean advocates.",
  
  "superpower": "My #1 superpower is making complex concepts accessible to anyone. I have an innate ability to break down complicated ideas into simple, relatable explanations that resonate with people from different backgrounds and knowledge levels. This skill has served me well in both my professional and personal life.",
  
  "areas to grow": "The top 3 areas I want to grow in are: 1) Public speaking - I want to become more comfortable addressing large audiences to share my research. 2) Technical writing - I aim to publish more peer-reviewed papers on marine conservation. 3) Work-life balance - I need to set better boundaries between my passion for work and personal time.",
  
  "misconception": "The biggest misconception my coworkers have about me is that I'm always serious and work-focused. While I am dedicated to my research, I actually have a playful side and love improvisational comedy. I participate in local improv shows monthly, something that surprises people who only know me from professional settings.",
  
  "boundaries": "I push my boundaries by deliberately seeking situations outside my comfort zone. Every year, I set a challenge that scares me - from learning to scuba dive despite my fear of deep water to presenting my research at international conferences despite public speaking anxiety. I believe growth happens at the edge of discomfort."
};

export const generateChatResponse = async (
  messages: { role: string; content: string }[]
): Promise<string> => {
  try {
    // Get the last user message
    const userMessage = messages.filter(msg => msg.role === "user").pop();
    
    if (!userMessage) {
      return "I couldn't understand your question. Could you please try again?";
    }
    
    const userQuestion = userMessage.content.toLowerCase();
    
    // Check if the user's question matches any of the predefined questions
    if (userQuestion.includes("life story")) {
      return PREDEFINED_RESPONSES["life story"];
    } else if (userQuestion.includes("superpower")) {
      return PREDEFINED_RESPONSES["superpower"];
    } else if (userQuestion.includes("areas") && userQuestion.includes("grow")) {
      return PREDEFINED_RESPONSES["areas to grow"];
    } else if (userQuestion.includes("misconception") || 
              (userQuestion.includes("coworkers") && userQuestion.includes("about you"))) {
      return PREDEFINED_RESPONSES["misconception"];
    } else if (userQuestion.includes("boundaries") || userQuestion.includes("limits")) {
      return PREDEFINED_RESPONSES["boundaries"];
    }
    
    // Default response for questions outside the predefined set
    return "I'm trained to answer only specific questions about the user. Please try asking one of these questions:\n\n1. What should we know about your life story in a few sentences?\n2. What's your #1 superpower?\n3. What are the top 3 areas you'd like to grow in?\n4. What misconception do your coworkers have about you?\n5. How do you push your boundaries and limits?";
  } catch (error) {
    console.error("Error generating response:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};
