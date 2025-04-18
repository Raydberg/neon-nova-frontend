export interface DecodedToken {
  nameid: string;
  email: string;
  name?: string;
  exp: number;
  isAdmin?: string;
  isUser?: string;
  provider?: 'google' | 'local'; 
}
