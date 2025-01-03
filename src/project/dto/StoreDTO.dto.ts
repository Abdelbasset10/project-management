import { IsArray, IsIn, IsNotEmpty, IsString, MinLength } from "class-validator"
import { IsNameUnique } from "src/validators/IsUniqueNameProject.validator"

export class StoreDTO {
    @IsNotEmpty()
    @IsString()
    name:string

    @IsArray()
    @IsString({each:true})
    tasks:string[]
}