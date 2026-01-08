import { Expose, Type } from "class-transformer";
import { UserResponseDto } from "src/user/dto/user-response.dto";

export class AuthResponseDto
{
    @Expose()
    @Type(() => UserResponseDto)
    user: UserResponseDto;

    @Expose()
    tokens:{
        AccessToken: string,
        RefreshToken: string,
    }
}