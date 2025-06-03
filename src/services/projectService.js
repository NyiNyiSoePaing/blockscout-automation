const prisma = require('../lib/prisma');

class ProjectService {
  async getAllProjects() {
    return await prisma.project.findMany({
      include: {
        blockscoutServers: true,
        rpcServers: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getProjectById(id) {
    const project = await prisma.project.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        blockscoutServers: true,
        rpcServers: true
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  async createProject(data) {
    try {
      return await prisma.project.create({
        data: {
          name: data.name,
          description: data.description
        },
        include: {
          blockscoutServers: true,
          rpcServers: true
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Project with this name already exists');
      }
      throw error;
    }
  }

  async updateProject(id, data) {
    try {
      // Check if project exists
      await this.getProjectById(id);

      return await prisma.project.update({
        where: {
          id: parseInt(id)
        },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description })
        },
        include: {
          blockscoutServers: true,
          rpcServers: true
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Project with this name already exists');
      }
      throw error;
    }
  }

  async deleteProject(id) {
    // Check if project exists
    await this.getProjectById(id);

    // Hard delete (will cascade to related records)
    return await prisma.project.delete({
      where: {
        id: parseInt(id)
      }
    });
  }
}

module.exports = new ProjectService();