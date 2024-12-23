import { IsArray, IsIn, IsNotEmpty, IsString, MinLength } from "class-validator"
import { IsNameUnique } from "src/validators/IsUniqueNameProject.validator"

export class StoreDTO {
    @IsNotEmpty()
    @IsString()
    @IsNameUnique()
    name:string

    @IsArray()
    @MinLength(1)
    @IsString({each:true})
    tasks:string[]
}