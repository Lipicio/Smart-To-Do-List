export type LlmTask = { title: string };

export interface LlmRepository {
  askForTasks(script: string, token: string): Promise<LlmTask[]>;
}