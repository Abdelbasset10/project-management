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
                },
                include: {
                    tasks: true
                }
            });

            const projects = await this.prisma.project.findMany({
                include: {
                    tasks: true
                }
            });

            let formatted_projects = [];

            for (const project of projects) {
                const finished_tasks = project.tasks.filter((task) => task.status === "FINISHED").length;
                const in_progress_tasks = project.tasks.filter((task) => task.status === "IN_PROGRESS").length;
                const not_started_tasks_tasks = project.tasks.filter((task) => task.status === "NOT_STARTED").length;
                formatted_projects.push({ ...project, finished_tasks, in_progress_tasks, not_started_tasks_tasks })
            }

            return { message: "Project has been created succesffully", data: formatted_projects };
        } catch (error) {
            console.log(error)
            console.log(error)
            throw new InternalServerErrorException("Something went wrong");
        }
    }

    async getAllProjects() {
        try {
            const projects = await this.prisma.project.findMany({
                include: {
                    tasks: true
                }
            });

            let formatted_projects = [];

            for (const project of projects) {
                const finished_tasks = project.tasks.filter((task) => task.status === "FINISHED").length;
                const in_progress_tasks = project.tasks.filter((task) => task.status === "IN_PROGRESS").length;
                const not_started_tasks_tasks = project.tasks.filter((task) => task.status === "NOT_STARTED").length;
                formatted_projects.push({ ...project, finished_tasks, in_progress_tasks, not_started_tasks_tasks })
            }

            return { message: "All projects", data: formatted_projects };
        } catch (error) {
            throw new InternalServerErrorException("Something went wrong");
        }
    }

    async getProjectDetails(id: number) {
        try {
            console.log(id)
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
            console.log("asfdasf")
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

            const projects = await this.prisma.project.findMany({
                include: {
                    tasks: true
                }
            });

            let formatted_projects = [];

            for (const project of projects) {
                const finished_tasks = project.tasks.filter((task) => task.status === "FINISHED").length;
                const in_progress_tasks = project.tasks.filter((task) => task.status === "IN_PROGRESS").length;
                const not_started_tasks_tasks = project.tasks.filter((task) => task.status === "NOT_STARTED").length;
                formatted_projects.push({ ...project, finished_tasks, in_progress_tasks, not_started_tasks_tasks })
            }

            return { message: "All projects", data: formatted_projects };
        } catch (error) {
            console.log(error)
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

            const projects = await this.prisma.project.findMany({
                include: {
                    tasks: true
                }
            });

            let formatted_projects = [];

            for (const project of projects) {
                const finished_tasks = project.tasks.filter((task) => task.status === "FINISHED").length;
                const in_progress_tasks = project.tasks.filter((task) => task.status === "IN_PROGRESS").length;
                const not_started_tasks_tasks = project.tasks.filter((task) => task.status === "NOT_STARTED").length;
                formatted_projects.push({ ...project, finished_tasks, in_progress_tasks, not_started_tasks_tasks })
            }

            return { message: "Project has been deleted succesffully", data: formatted_projects };

        } catch (error) {
            console.log(error)
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException("Something went wrong");
        }
    }

}
