import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Game } from "./entities/game.entity";
import { UserModule } from "src/user/user.module";
import { GameService } from "./game.service";
import { GameGateway } from "./game.gateway";
import { ConfigModule } from "@nestjs/config";
import { GameController } from "./game.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Game]),
        UserModule,
        ConfigModule,
    ],
    controllers: [GameController],
    providers: [GameService, GameGateway],
})
export class GameModule {}