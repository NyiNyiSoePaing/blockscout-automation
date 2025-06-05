const prisma = require('../lib/prisma');
class BlockscoutService {
  async getAllblockscout_servers() {
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
        created_at: 'desc'
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

  async getblockscout_serversByProject(project_id) {
    return await prisma.blockscoutServer.findMany({
      where: {
        project_id: parseInt(project_id)
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
        created_at: 'desc'
      }
    });
  }

  async createBlockscoutServer(data) {
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: {
        id: parseInt(data.project_id),
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return await prisma.blockscoutServer.create({
      data: {
        project_id: parseInt(data.project_id),
        network_type: data.network_type,
        chain_id: data.chain_id,
        currency: data.currency,
        logo_url: data.logo_url,
        rpc_url: data.rpc_url,
        network_link: data.network_link,
        footer_link: data.footer_link,
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
        ...(data.network_type && { network_type: data.network_type }),
        ...(data.server_url && { server_url: data.server_url }),
        // ...(data.droplet_id && { droplet_id: data.droplet_id }),
        ...(data.ip_address && { ip_address: data.ip_address }),
        ...(data.chain_id !== undefined && { chain_id: data.chain_id }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.logo_url !== undefined && { logo_url: data.logo_url }),
        ...(data.rpc_url !== undefined && { rpc_url: data.rpc_url }),
        ...(data.network_link !== undefined && { network_link: data.network_link }),
        ...(data.footer_link !== undefined && { footer_link: data.footer_link }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
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