export interface SocketRes {
  ok: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}
