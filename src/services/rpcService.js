const prisma = require('../lib/prisma');

class RpcService {
  async getAllRpcServers() {
    return await prisma.rpcServer.findMany({
      where: {
        isActive: true
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getRpcServerById(id) {
    const server = await prisma.rpcServer.findUnique({
      where: {
        id: parseInt(id),
        isActive: true
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    if (!server) {
      throw new Error('RPC server not found');
    }

    return server;
  }

  async getRpcServersByProject(projectId) {
    return await prisma.rpcServer.findMany({
      where: {
        projectId: parseInt(projectId),
        isActive: true
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async createRpcServer(data) {
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: {
        id: parseInt(data.projectId),
        deletedAt: null
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return await prisma.rpcServer.create({
      data: {
        projectId: parseInt(data.projectId),
        serverUrl: data.serverUrl,
        ipAddress: data.ipAddress,
        chainId: data.chainId,
        isActive: data.isActive !== undefined ? data.isActive : true,
        description: data.description
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });
  }

  async updateRpcServer(id, data) {
    // Check if server exists
    await this.getRpcServerById(id);

    return await prisma.rpcServer.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...(data.serverUrl && { serverUrl: data.serverUrl }),
        ...(data.ipAddress && { ipAddress: data.ipAddress }),
        ...(data.chainId !== undefined && { chainId: data.chainId }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.description !== undefined && { description: data.description })
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });
  }

  async deleteRpcServer(id) {
    // Check if server exists
    await this.getRpcServerById(id);

    // Soft delete by setting isActive to false
    return await prisma.rpcServer.update({
      where: {
        id: parseInt(id)
      },
      data: {
        isActive: false
      }
    });
  }

  async hardDeleteRpcServer(id) {
    // Check if server exists
    await this.getRpcServerById(id);

    // Hard delete
    return await prisma.rpcServer.delete({
      where: {
        id: parseInt(id)
      }
    });
  }
}

module.exports = new RpcService();