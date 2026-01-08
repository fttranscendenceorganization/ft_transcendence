import { registerAs } from '@nestjs/config';


export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES,
}));
