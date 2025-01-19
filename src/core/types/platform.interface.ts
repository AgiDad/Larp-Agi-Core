export interface IPlatform {
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}
