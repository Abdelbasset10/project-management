import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    registerDecorator,
    ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsNameUniqueConstraint implements ValidatorConstraintInterface {
    constructor(private prisma: DbService) { }

    async validate(name: string): Promise<boolean> {
        const project = await this.prisma.project.findUnique({ where: { name } });
        return !project;
    }

    defaultMessage(args: ValidationArguments): string {
        return `The name "${args.value}" is already taken.`;
    }
}

export function IsNameUnique(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsNameUniqueConstraint,
        });
    };
}
