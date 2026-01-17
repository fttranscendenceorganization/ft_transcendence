import { registerAs } from '@nestjs/config';

export default registerAs('intra42OAuth', () => ({
  googleClientId: process.env.INTRA_42_CLIENT_ID,
  googleClientSecret: process.env.INTRA_42_CLIENT_SECRET,
  googleCallBackUrl: process.env.INTRA_42_CALL_BACK_URL,
}));