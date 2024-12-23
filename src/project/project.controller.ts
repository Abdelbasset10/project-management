import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ProjectService } from './project.service';
import { StoreDTO } from './dto/StoreDTO.dto';

@Controller('project')
export class ProjectController {
    constructor(private service: ProjectService) { }

    @Post()
    createProject(@Body() bodyData: StoreDTO) {
        return this.service.createProject(bodyData);
    }

    @Get()
    getProjects() {
        return this.service.getAllProjects();
    }

    @Get(":id")
    getProjectDetails(@Param() id: { id: string }) {
        return this.service.getProjectDetails(Number(id));
    }

    @Patch(":id")
    updateProject(@Param() id: { id: string }, @Body() bodyData: StoreDTO) {
        return this.service.updateProject(Number(id), bodyData);
    }

    @Delete("id")
    deleteProject(@Param() id: { id: string }) {
        return this.service.deleteProject(Number(id));
    }
}
