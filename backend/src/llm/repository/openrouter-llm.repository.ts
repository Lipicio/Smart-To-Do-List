import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LlmRepository, LlmTask } from './llm.repository';

@Injectable()
export class OpenRouterLlmRepository implements LlmRepository {
  constructor(private readonly config: ConfigService) {}

  private get serviceUrl(): string {
    return this.config.get<string>('OPENROUTER_URL')!;
  }

  private get model(): string {
    return this.config.get<string>('OPENROUTER_MODEL') ?? 'gpt-4o-mini';
  }

  private get timeoutMs(): number {
    return Number(this.config.get<number>('OPENROUTER_TIMEOUT_MS') ?? 20000);
  }

  async askForTasks(
    script: string,
    token: string,
  ): Promise<LlmTask[]> {
    const serviceUrl = this.serviceUrl;
    const model = this.model;
    const body = {
      model,
      messages: [
        {
          role: 'system',
          content:
            'Você é um gerador de tarefas. Quando solicitado, responda SOMENTE com um JSON válido que seja um array de objetos que contenham apenas o campo "title". Exemplo: [{"title":"..."}]',
        },
        { role: 'user', content: script },
      ],
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new HttpException(`OpenRouter erro: ${txt}`, res.status as HttpStatus);
      }

      const json = await res.json();

      let content: any = null;
      if (Array.isArray(json.choices) && json.choices.length > 0) {
        const first = json.choices[0];
        content = first.message?.content ?? first.text ?? first;
      } else if (json.output?.[0]?.content) {
        content = json.output.map((o: any) => o.content).join('\n');
      } else {
        content = json;
      }

      const textContent = typeof content === 'string' ? content : JSON.stringify(content);

      const tryParse = (txt: string): LlmTask[] | null => {
        const s = txt.trim();
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return parsed.map((p: any) => ({ title: String(p.title ?? p) }));
        } catch {}
        const a = s.indexOf('[');
        const b = s.lastIndexOf(']');
        if (a !== -1 && b !== -1 && b > a) {
          try {
            const parsed = JSON.parse(s.slice(a, b + 1));
            if (Array.isArray(parsed)) return parsed.map((p: any) => ({ title: String(p.title ?? p) }));
          } catch {}
        }
        const lines = s
          .split(/\r?\n/)
          .map(l => l.trim())
          .filter(Boolean)
          .map(l => l.replace(/^[\-\*\d\.\)\s]+/, '').trim());
        if (lines.length > 0) return lines.map(l => ({ title: l }));
        return null;
      };

      const parsed = tryParse(textContent);
      if (!parsed) {
        throw new HttpException(
          'Não foi possível extrair array JSON de tasks da resposta da LLM',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const normalized = parsed.map(t => ({ title: (t.title ?? '').trim() })).filter(t => t.title.length > 0);
      return normalized;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new HttpException('Timeout ao chamar OpenRouter', HttpStatus.GATEWAY_TIMEOUT);
      }
      if (err instanceof HttpException) throw err;
      throw new HttpException(err?.message ?? 'Erro no provider LLM', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      clearTimeout(timeout);
    }
  }
}