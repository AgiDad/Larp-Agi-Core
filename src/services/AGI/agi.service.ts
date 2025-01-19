import { responses } from "./knowledge";

export class AgiService {
  getAgiResponse(message: string): string {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes("price")) {
      return this.getRandomResponse(responses.priceResponses);
    } else if (lowerCaseMessage.includes("gm")) {
      return this.getRandomResponse(responses.gmResponses);
    } else if (lowerCaseMessage.includes("meme")) {
      return this.getRandomResponse(responses.memeResponses);
    } else if (lowerCaseMessage.includes("ai")) {
      return this.getRandomResponse(responses.aiResponses);
    }
    return this.getRandomResponse(responses.degenResponses);
  }

  private getRandomResponse(responses: readonly string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
