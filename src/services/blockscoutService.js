const prisma = require('../lib/prisma');
class BlockscoutService {
  async getAllBlockscoutServers() {
    return await prisma.blockscoutServer.findMany({
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

  async getBlockscoutServerById(id) {
    const server = await prisma.blockscoutServer.findUnique({
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
      throw new Error('Blockscout server not found');
    }

    return server;
  }

  async getBlockscoutServersByProject(projectId) {
    return await prisma.blockscoutServer.findMany({
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

  async createBlockscoutServer(data) {
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: {
        id: parseInt(data.projectId),
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return await prisma.blockscoutServer.create({
      data: {
        projectId: parseInt(data.projectId),
        networkType: data.networkType,
        chainId: data.chainId,
        currency: data.currency,
        logoUrl: data.logoUrl,
        rpcUrl: data.rpcUrl,
        networkLink: data.networkLink,
        footerLink: data.footerLink,
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

  async updateBlockscoutServer(id, data) {
    // Check if server exists
    await this.getBlockscoutServerById(id);

    return await prisma.blockscoutServer.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...(data.networkType && { networkType: data.networkType }),
        ...(data.serverUrl && { serverUrl: data.serverUrl }),
        // ...(data.dropletId && { dropletId: data.dropletId }),
        ...(data.ipAddress && { ipAddress: data.ipAddress }),
        ...(data.chainId !== undefined && { chainId: data.chainId }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.rpcUrl !== undefined && { rpcUrl: data.rpcUrl }),
        ...(data.networkLink !== undefined && { networkLink: data.networkLink }),
        ...(data.footerLink !== undefined && { footerLink: data.footerLink }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
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

  async deleteBlockscoutServer(id) {
    // Check if server exists
    await this.getBlockscoutServerById(id);

    // Hard delete
    return await prisma.blockscoutServer.delete({
      where: {
        id: parseInt(id)
      }
    });
  }
}

module.exports = new BlockscoutService();