export class Task {
  /** Identificador numérico (use number se for autoincrement SQLite/Prisma) */
  id!: number;

  /** Título principal da task */
  title!: string;

  /** Se a task já foi concluída */
  isCompleted: boolean = false;

  /** Data de criação */
  createdAt!: Date;

}
