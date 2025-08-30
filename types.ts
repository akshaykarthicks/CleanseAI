
export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface FileInfo {
  name: string;
  type: string;
  base64: string;
}

export interface RemovalResult {
    image: string | null;
    text: string | null;
}
