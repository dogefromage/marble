

export type ConsoleMessageType = 'info' | 'warning' | 'error'

export interface ConsoleMessage {
    id: string;
    time: number;
    text: string;
    type?: ConsoleMessageType;
}