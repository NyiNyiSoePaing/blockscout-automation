const prisma = require('../lib/prisma');

class BlockscoutService {
  async getAllBlockscoutServers() {
    return await prisma.blockscoutServer.findMany({
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

  async getBlockscoutServerById(id) {
    const server = await prisma.blockscoutServer.findUnique({
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
      throw new Error('Blockscout server not found');
    }

    return server;
  }

  async getBlockscoutServersByProject(projectId) {
    return await prisma.blockscoutServer.findMany({
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
        networkType: 'asc'
      }
    });
  }

  async validateNetworkTypeConstraint(projectId, networkType, excludeId = null) {
    const existingServer = await prisma.blockscoutServer.findFirst({
      where: {
        projectId: parseInt(projectId),
        networkType: networkType,
        isActive: true,
        ...(excludeId && { id: { not: parseInt(excludeId) } })
      }
    });

    if (existingServer) {
      throw new Error(`Project already has a ${networkType} Blockscout server. Only one ${networkType} server is allowed per project.`);
    }
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

    // Validate network type constraint
    await this.validateNetworkTypeConstraint(data.projectId, data.networkType);

    return await prisma.blockscoutServer.create({
      data: {
        projectId: parseInt(data.projectId),
        networkType: data.networkType,
        serverUrl: data.serverUrl,
        ipAddress: data.ipAddress,
        chainId: data.chainId,
        currency: data.currency,
        logo_url: data.logo_url,
        rpc_url: data.rpc_url,
        network_link: data.network_link,
        footer_link: data.footer_link,
        status:  'provisioning',
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
    const existingServer = await this.getBlockscoutServerById(id);

    // If networkType is being changed, validate constraint
    if (data.networkType && data.networkType !== existingServer.networkType) {
      await this.validateNetworkTypeConstraint(existingServer.projectId, data.networkType, id);
    }

    return await prisma.blockscoutServer.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...(data.networkType && { networkType: data.networkType }),
        ...(data.serverUrl && { serverUrl: data.serverUrl }),
        ...(data.ipAddress && { ipAddress: data.ipAddress }),
        ...(data.chainId !== undefined && { chainId: data.chainId }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.logo_url !== undefined && { logo_url: data.logo_url }),
        ...(data.rpc_url !== undefined && { rpc_url: data.rpc_url }),
        ...(data.network_link !== undefined && { network_link: data.network_link }),
        ...(data.footer_link !== undefined && { footer_link: data.footer_link }),
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

  async deleteBlockscoutServer(id) {
    // Check if server exists
    await this.getBlockscoutServerById(id);

    // Soft delete by setting isActive to false
    return await prisma.blockscoutServer.update({
      where: {
        id: parseInt(id)
      },
      data: {
        isActive: false
      }
    });
  }

  async hardDeleteBlockscoutServer(id) {
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