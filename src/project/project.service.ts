import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { StoreDTO } from './dto/StoreDTO.dto';

@Injectable()
export class ProjectService {
    constructor(private prisma: DbService) { };

    async createProject(bodyData: StoreDTO) {
        try {
            const { name, tasks } = bodyData;

            const new_project = await this.prisma.project.create({
                data: {
                    name,
                    status: "NOT_DONE",
                    tasks: {
                        createMany: ({
                            data: tasks.map((task) => ({
                                name: task,
                                status: "NOT_STARTED"
                            }))
                        })
                    }
                }
            });

            return { message: "Project has been created succesffully", data: new_project };
        } catch (error) {
            throw new InternalServerErrorException("Something went wrong");
        }
    }

    async getAllProjects() {
        try {
            const projects = await this.prisma.project.findMany({});

            return { message: "All projects", data: projects };
        } catch (error) {
            throw new InternalServerErrorException("Something went wrong");
        }
    }

    async getProjectDetails(id: number) {
        try {
            const project = await this.prisma.project.findUnique({
                where: {
                    id
                }
            });

            if (!project) {
                throw new BadRequestException("Project does not exists");
            }

            return { message: "Project details", data: project };

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("Something went wrong");
        }
    }

    async updateProject(id: number, bodyData: StoreDTO) {
        try {
            const { name, tasks: bodyTasks } = bodyData;
            const project = await this.prisma.project.findUnique({
                where: {
                    id
                },
                include: {
                    tasks: true
                }
            });

            if (!project) {
                throw new BadRequestException("Project does not exists");
            };

            const project_tasks = await project.tasks.map((tasks) => tasks.name);

            const added_tasks = bodyTasks.filter((task) => !project_tasks.includes(task));
            const removed_tasks = project_tasks.filter((task) => !bodyTasks.includes(task));

            await this.prisma.$transaction(async (prisma) => {
                // Add the new tasks to the project;
                await prisma.project.update({
                    where: {
                        id
                    }, data: {
                        tasks: {
                            createMany: {
                                data: added_tasks.map((task) => ({
                                    name: task,
                                    status: "NOT_STARTED"
                                }))
                            }
                        }
                    }
                })


                // Remove tasks from the project
                await prisma.project.update({
                    where: {
                        id
                    },
                    data: {
                        tasks: {
                            deleteMany: removed_tasks.map((task) => ({
                                name: task
                            }))
                        }
                    }
                });

                // Remove the tasks
                for (const task of removed_tasks) {
                    await prisma.task.deleteMany({
                        where: {
                            project_id: id,
                            name: task
                        }
                    })
                };

                if (project.name !== name) {
                    await prisma.project.update({
                        where: {
                            id
                        },
                        data: {
                            name
                        }
                    })
                }
            });

            const updated_project = await this.prisma.project.findUnique({
                where: {
                    id
                }
            });

            return { message: "Project has been updated succesfully", data: updated_project };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("Something went wrong");
        }
    }

    async deleteProject(id: number) {
        try {
            const project = await this.prisma.project.findUnique({
                where: {
                    id
                },
                include: {
                    tasks: true
                }
            });

            if (!project) {
                throw new BadRequestException("Project does not exists");
            };

            await this.prisma.project.delete({
                where: {
                    id
                }
            });

            return { message: "Project has been deleted succesfully" };

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("Something went wrong");
        }
    }

}
