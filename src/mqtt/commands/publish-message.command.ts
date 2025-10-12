export class PublishMessageCommand {
  constructor(
    public readonly topic: string,
    public readonly message: string,
    public readonly options: { qos?: number; retain?: boolean } = {},
  ) {}
}
