import { registerAs } from '@nestjs/config';

export default registerAs('googleOAuth', () => ({
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallBackUrl: process.env.GOOGLE_CALL_BACK_URL,
}));