import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';

@Pipe({
  name: 'formatResponse',
  standalone: true
})
export class FormatResponsePipe implements PipeTransform {

  async transform(response: string): Promise<string> {
    if (!response) return '';

    try {
      // Check if response is JSON (for structured data)
      const jsonData = JSON.parse(response);
      return this.formatJson(jsonData);
    } catch (e) {}

    // ✅ Convert Markdown to HTML with Table Support
    marked.setOptions({
      gfm: true, // Enable GitHub Flavored Markdown (which supports tables)
      breaks: true // Enable line breaks
    });

    return await marked.parse(response);
  }

  private formatJson(json: any): string {
    return `<pre>${JSON.stringify(json, null, 2)}</pre>`;
  }
}
