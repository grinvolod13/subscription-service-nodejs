import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "test.db",
    logging: false,
    entities: [User],
    migrations: ['src/migration/**/*{.ts,.js}']
})
