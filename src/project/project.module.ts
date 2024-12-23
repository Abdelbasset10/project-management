import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { IsNameUniqueConstraint } from 'src/validators/IsUniqueNameProject.validator';

@Module({
  providers: [ProjectService,IsNameUniqueConstraint],
  controllers: [ProjectController]
})
export class ProjectModule {}
