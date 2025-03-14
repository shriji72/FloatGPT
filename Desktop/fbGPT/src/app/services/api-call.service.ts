import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { OpenAI } from 'openai';
import { marked } from 'marked';

@Injectable({
  providedIn: 'root',
})
export class ApiCallService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: 'floatbot',  // Replace with actual API key
      baseURL: 'https://concrete-lynx-logically.ngrok-free.app/v1',  // API Base URL
      dangerouslyAllowBrowser: true,  // Allow browser-based requests
    });
  }

  /**
   * Sends user input to the AI and streams the response in real-time.
   * @param conversationHistory The conversation history including user messages.
   * @returns An Observable that emits formatted chunks of the AI response.
   */
  getResponse(
conversationHistory: { role: 'user' | 'assistant' | 'system'; content: string; }[], signal: AbortSignal  ): Observable<string> {
    const responseSubject = new Subject<string>(); // Emits streamed response chunks

    (async () => {
      let assistantResponse = ''; // Store accumulated AI response

      try {
        const stream = this.openai.beta.chat.completions.stream({
          model: 'floatgpt', // Ensure this model is available on your server
          messages: conversationHistory,
          stream: true, // Enable real-time response
          max_tokens:300
        });

        // Iterate over streamed chunks
        for await (const chunk of stream) {
          const content = chunk?.choices[0]?.delta?.content || '';
          if (content) {
            assistantResponse += content; // Append new content chunk

            // Convert the response to formatted HTML using Markdown
            const formattedContent = this.formatResponse(assistantResponse);

            // Emit the latest formatted content
            responseSubject.next(formattedContent);
          }
        }

        responseSubject.complete(); // Complete the Observable once response ends
      } catch (error) {
        console.error('Error in OpenAI streaming:', error);
        responseSubject.error('An error occurred while fetching the AI response.');
      }
    })();

    return responseSubject.asObservable();
  }

  /**
   * Converts Markdown to safe HTML using 'marked'.
   * @param text Raw AI response text.
   * @returns Formatted HTML string.
   */
  formatResponse(text: string): string {
    if (!text.trim()) return ''; // Avoid processing empty responses

    try {
      return marked.parse(text) as string; // Ensure it returns a string
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return text; // Fallback to plain text if Markdown parsing fails
    }
  }
}
