import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { ProjectModule } from './project/project.module';

@Module({
  imports: [DbModule, ProjectModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
