import { registerAs } from '@nestjs/config';

export default registerAs('githubOAuth', () => ({
  googleClientId: process.env.GITHUB_CLIENT_ID,
  googleClientSecret: process.env.GITHUB_CLIENT_SECRET,
  googleCallBackUrl: process.env.GITHUB_CALL_BACK_URL,
}));