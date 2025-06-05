const prisma = require('../lib/prisma');

class RpcService {
  async getAllrpc_servers() {
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
        created_at: 'desc'
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

  async getrpc_serversByProject(project_id) {
    return await prisma.rpcServer.findMany({
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

  async createRpcServer(data) {
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: {
        id: parseInt(data.project_id),
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return await prisma.rpcServer.create({
      data: {
        project_id: parseInt(data.project_id),
        network_type: data.network_type,
        chain_id: data.chain_id,
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
        ...(data.network_type && { network_type: data.network_type }),
        ...(data.server_url && { server_url: data.server_url }),
        ...(data.ip_address && { ip_address: data.ip_address }),
        ...(data.chain_id !== undefined && { chain_id: data.chain_id }),
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