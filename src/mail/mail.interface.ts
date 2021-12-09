export interface MailModuleOption {
  apiKey: string;
  domain: string;
  fromEmail: string; //email where our emails come from
}
export type EmailVar = { [key: string]: string };
