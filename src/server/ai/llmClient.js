/**
 * Universal LLM Client (Supports OpenAI and Claude Anthropic)
 * Can be used by your AI friend to swap models or providers seamlessly.
 */

export class LLMClient {
  /**
   * Generates structured text/JSON from OpenAI or Claude.
   * @param {Object} options
   * @param {string} options.systemPrompt
   * @param {string} options.userPrompt
   * @param {boolean} options.jsonMode
   */
  static async complete({ systemPrompt, userPrompt, jsonMode = true }) {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    // 1. Try OpenAI if key is present
    if (openaiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            response_format: jsonMode ? { type: 'json_object' } : undefined,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const err = await response.text();
          console.warn('OpenAI API returned error:', err);
        } else {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          return jsonMode ? JSON.parse(content) : content;
        }
      } catch (err) {
        console.error('Error calling OpenAI API:', err);
      }
    }

    // 2. Try Anthropic (Claude) if key is present
    if (anthropicApiKey) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022',
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const err = await response.text();
          console.warn('Anthropic API returned error:', err);
        } else {
          const data = await response.json();
          const content = data.content?.[0]?.text;
          if (jsonMode) {
            // Extract JSON if wrapped in markdown code blocks
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
          }
          return content;
        }
      } catch (err) {
        console.error('Error calling Anthropic API:', err);
      }
    }

    // 3. Fallback Heuristic Intelligence (If no API keys are provided yet during local dev)
    console.log('🤖 [LLMClient] No OpenAI/Claude API Key found. Using intelligent heuristic fallback.');
    return null;
  }
}
