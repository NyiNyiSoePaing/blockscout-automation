const prisma = require('../lib/prisma');

class RpcService {
  async getAllRpcServers() {
    return await prisma.rpcServer.findMany({
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
        id: parseInt(id)
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
        projectId: parseInt(projectId)
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
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return await prisma.rpcServer.create({
      data: {
        projectId: parseInt(data.projectId),
        networkType: data.networkType,
        chainId: data.chainId,
        status: 'provisioning',
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
        ...(data.networkType && { networkType: data.networkType }),
        ...(data.serverUrl && { serverUrl: data.serverUrl }),
        ...(data.ipAddress && { ipAddress: data.ipAddress }),
        ...(data.chainId !== undefined && { chainId: data.chainId }),
        ...(data.status && { status: data.status }),
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

    // Hard delete
    return await prisma.rpcServer.delete({
      where: {
        id: parseInt(id)
      }
    });
  }
}

module.exports = new RpcService();