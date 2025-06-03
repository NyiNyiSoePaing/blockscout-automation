const rpcService = require('../services/rpcService');
const axios = require('axios');

class RpcController {
  async getAllRpcServers(req, res, next) {
    try {
      const servers = await rpcService.getAllRpcServers();
      res.json({
        success: true,
        message: 'RPC servers retrieved successfully',
        data: servers,
        count: servers.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getRpcServerById(req, res, next) {
    try {
      const { id } = req.params;
      const server = await rpcService.getRpcServerById(id);
      res.json({
        success: true,
        message: 'RPC server retrieved successfully',
        data: server
      });
    } catch (error) {
      if (error.message === 'RPC server not found') {
        return res.status(404).json({
          success: false,
          message: 'RPC server not found'
        });
      }
      next(error);
    }
  }

  async getRpcServersByProject(req, res, next) {
    try {
      const { projectId } = req.params;
      const servers = await rpcService.getRpcServersByProject(projectId);
      res.json({
        success: true,
        message: 'RPC servers retrieved successfully',
        data: servers,
        count: servers.length
      });
    } catch (error) {
      next(error);
    }
  }

  async createRpcServer(req, res, next) {
    try {
      // First create the RPC server record in database
      const server = await rpcService.createRpcServer(req.body);
      
      // Respond immediately to the client
      res.status(201).json({
        success: true,
        message: 'RPC server creation initiated. This process may take several minutes',
        data: server
      });

      // Create DigitalOcean droplet in the background
      const controller = this;
      setImmediate(async () => {
        try {
          await controller.createDigitalOceanDroplet(server);
        } catch (error) {
          console.error('Background droplet creation failed:', error);
        }
      });
      
    } catch (error) {
      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      next(error);
    }
  }

  async createDigitalOceanDroplet(server) {
    try {
      // Parse SSH keys from environment
      const sshKeys = process.env.DO_SSH_KEYS ? 
        process.env.DO_SSH_KEYS.split(',').map(key => parseInt(key.trim())).filter(key => !isNaN(key)) : 
        [];

      console.log('Using SSH keys:', sshKeys);

      const dropletConfig = {
        name: `rpc-server-${server.id}`,
        region: process.env.DO_REGION || 'nyc3',
        size: process.env.DO_RPC_SERVER_SIZE || 's-1vcpu-1gb',
        image: process.env.DO_RPC_SERVER_IMAGE || 'ubuntu-22-04-x64',
        backups: false,
        ipv6: true,
        monitoring: true,
        tags: [`project-${server.projectId}`, 'rpc-server', `server-id-${server.id}`],
      };

      // Only add ssh_keys if we have valid ones
      if (sshKeys.length > 0) {
        dropletConfig.ssh_keys = sshKeys;
      } else {
        console.warn('No SSH keys provided. Droplet will only be accessible via console.');
      }

      console.log('Creating droplet with config:', JSON.stringify(dropletConfig, null, 2));

      const response = await axios.post(
        'https://api.digitalocean.com/v2/droplets',
        dropletConfig,
        {
          headers: {
            'Authorization': `Bearer ${process.env.DO_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const droplet = response.data.droplet;
      console.log(`Droplet created: ${droplet.name} (ID: ${droplet.id})`);

      // Store droplet ID in database for later deletion
      await rpcService.updateRpcServer(server.id, { 
        dropletId: droplet.id,
        status: 'provisioning'
      });

      // Wait for droplet to be active and get IP address
      await this.waitForDropletActive(droplet.id, server.id);

    } catch (error) {
      console.error('Error creating DigitalOcean droplet:', error.response?.data || error.message);
      
      // Update server status to failed
      await rpcService.updateRpcServer(server.id, { status: 'failed' });
    }
  }

  async waitForDropletActive(dropletId, serverId) {
    const maxAttempts = 30; // 5 minutes max wait time
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `https://api.digitalocean.com/v2/droplets/${dropletId}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.DO_API_TOKEN}`
            }
          }
        );

        const droplet = response.data.droplet;
        
        if (droplet.status === 'active' && droplet.networks.v4.length > 0) {
          const publicIp = droplet.networks.v4.find(network => network.type === 'public')?.ip_address;
          
          if (publicIp) {
            // Update server with actual IP address
            await rpcService.updateRpcServer(serverId, { 
              ipAddress: publicIp,
              status: 'ready_to_domain_setup'
            });
            
            console.log(`Droplet ${dropletId} is active with IP: ${publicIp}`);
            
            // Run Ansible setup after droplet is ready
            this.runAnsibleSetupRpc(publicIp, serverId);
            return;
          }
        }

        // Wait 10 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 10000));
        attempts++;
        
      } catch (error) {
        console.error('Error checking droplet status:', error.response?.data || error.message);
        attempts++;
      }
    }

    // If we reach here, droplet creation failed or timed out
    await rpcService.updateRpcServer(serverId, { status: 'failed' });
    console.error(`Droplet ${dropletId} failed to become active within timeout period`);
  }

  async runAnsibleSetupRpc(ipAddress, serverId) {
    try {
      console.log(`Starting Ansible setup for server ${serverId} at IP: ${ipAddress}`);
      
      const { spawn } = require('child_process');
      const path = require('path');
      
      // Path to your Ansible playbook
      const playbookPath = path.join(__dirname, '../../ansible/RpcSetup.yml');
      
      // Run Ansible playbook
      const ansibleProcess = spawn('ansible-playbook', [
        playbookPath,
        '-i', `${ipAddress},`,  // Dynamic inventory
        '--private-key', process.env.ANSIBLE_PRIVATE_KEY_PATH || '~/.ssh/id_rsa',
        '--user', process.env.ANSIBLE_USER || 'root',
        '--extra-vars', `server_id=${serverId}`,
        '-v'  // Verbose output
      ]);

      ansibleProcess.stdout.on('data', (data) => {
        console.log(`Ansible stdout: ${data}`);
      });

      ansibleProcess.stderr.on('data', (data) => {
        console.error(`Ansible stderr: ${data}`);
      });

      ansibleProcess.on('close', async (code) => {
        if (code === 0) {
          console.log(`Ansible setup completed successfully for server ${serverId}`);
          await rpcService.updateRpcServer(serverId, { status: 'ready_to_domain_setup' });
        } else {
          console.error(`Ansible setup failed for server ${serverId} with exit code ${code}`);
          await rpcService.updateRpcServer(serverId, { status: 'failed' });
        }
      });

    } catch (error) {
      console.error('Error running Ansible setup:', error);
      await rpcService.updateRpcServer(serverId, { status: 'failed' });
    }
  }

  async findDropletByServerId(serverId) {
    try {
      // First try to get droplet ID from database
      const server = await rpcService.getRpcServerById(serverId);
      if (server.dropletId) {
        return server.dropletId;
      }

      // Fallback: search by tag if dropletId is not stored
      const response = await axios.get(
        `https://api.digitalocean.com/v2/droplets?tag_name=server-id-${serverId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.DO_API_TOKEN}`
          }
        }
      );

      const droplets = response.data.droplets;
      if (droplets.length > 0) {
        return droplets[0].id;
      }

      // Final fallback: search by name pattern
      const allDropletsResponse = await axios.get(
        'https://api.digitalocean.com/v2/droplets',
        {
          headers: {
            'Authorization': `Bearer ${process.env.DO_API_TOKEN}`
          }
        }
      );

      const matchingDroplet = allDropletsResponse.data.droplets.find(
        droplet => droplet.name === `rpc-server-${serverId}`
      );

      return matchingDroplet ? matchingDroplet.id : null;
    } catch (error) {
      console.error('Error finding droplet:', error.response?.data || error.message);
      return null;
    }
  }

  async deleteDigitalOceanDroplet(serverId) {
    try {
      const dropletId = await this.findDropletByServerId(serverId);
      
      if (!dropletId) {
        console.log(`No droplet found for server ${serverId}`);
        return true; // Consider it successful if no droplet exists
      }

      console.log(`Deleting droplet ${dropletId} for server ${serverId}`);

      await axios.delete(
        `https://api.digitalocean.com/v2/droplets/${dropletId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.DO_API_TOKEN}`
          }
        }
      );

      console.log(`Droplet ${dropletId} deleted successfully`);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`Droplet not found (already deleted?) for server ${serverId}`);
        return true; // Consider 404 as success since droplet doesn't exist
      }
      
      console.error('Error deleting DigitalOcean droplet:', error.response?.data || error.message);
      return false;
    }
  }

  async updateRpcServer(req, res, next) {
    try {
      const { id } = req.params;
      const server = await rpcService.updateRpcServer(id, req.body);
      res.json({
        success: true,
        message: 'RPC server updated successfully',
        data: server
      });
    } catch (error) {
      if (error.message === 'RPC server not found') {
        return res.status(404).json({
          success: false,
          message: 'RPC server not found'
        });
      }
      next(error);
    }
  }
  async handleCreateSslCertificate(req, res, next) {
    try {
      const { id } = req.params;
      const { domain } = req.body;
      
      // Get server info to get IP address
      const server = await rpcService.getRpcServerById(id);
      
      if (!server) {
        return res.status(404).json({
          success: false,
          message: 'RPC server not found'
        });
      }
      
      if (!server.ipAddress) {
        return res.status(400).json({
          success: false,
          message: 'Server IP address not available. Server may still be provisioning.'
        });
      }
      
      // Respond immediately to the client
      res.status(202).json({
        success: true,
        message: 'SSL certificate creation initiated. This process may take several minutes.',
        data: {
          serverId: id,
          domain: domain,
          status: 'ssl_setup_started'
        }
      });
      
      // Update server status
      await rpcService.updateRpcServer(id, { 
        status: 'ssl_setup_started',
        domain: domain
      });
      
      // Start SSL setup in the background
      const controller = this;
      setImmediate(async () => {
        try {
          await controller.createSslCertificate(server.ipAddress, id, domain);
        } catch (error) {
          console.error('Background SSL setup failed:', error);
          await rpcService.updateRpcServer(id, { status: 'ssl_failed' });
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  async createSslCertificate(ipAddress, serverId, domain) {
    try {
      console.log(`Starting SSL setup for server ${serverId} at IP: ${ipAddress} with domain: ${domain}`);
      
      const { spawn } = require('child_process');
      const path = require('path');
      
      // Path to your SSL Ansible playbook
      const playbookPath = path.join(__dirname, '../../ansible/RpcSslSetup.yml');
      
      // Run Ansible playbook for SSL setup
      const ansibleProcess = spawn('ansible-playbook', [
        playbookPath,
        '-i', `${ipAddress},`,  // Dynamic inventory
        '--private-key', process.env.ANSIBLE_PRIVATE_KEY_PATH || '~/.ssh/id_rsa',
        '--user', process.env.ANSIBLE_USER || 'root',
        '--extra-vars', `server_id=${serverId} domain=${domain}`,
        '-v'  // Verbose output
      ]);

      let stdout = '';
      let stderr = '';

      ansibleProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(`SSL Ansible stdout: ${output}`);
      });

      ansibleProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.error(`SSL Ansible stderr: ${output}`);
      });

      ansibleProcess.on('close', async (code) => {
        if (code === 0) {
          console.log(`SSL setup completed successfully for server ${serverId}`);
          await rpcService.updateRpcServer(serverId, { 
            status: 'running',
            sslEnabled: true,
            domain: domain
          });
        } else {
          console.error(`SSL setup failed for server ${serverId} with exit code ${code}`);
          console.error(`SSL setup stderr: ${stderr}`);
          await rpcService.updateRpcServer(serverId, { status: 'ssl_failed' });
        }
      });

      // Set a timeout for SSL setup (e.g., 10 minutes)
      setTimeout(() => {
        if (!ansibleProcess.killed) {
          console.error(`SSL setup timeout for server ${serverId}`);
          ansibleProcess.kill('SIGTERM');
          rpcService.updateRpcServer(serverId, { status: 'ssl_failed' });
        }
      }, 600000); // 10 minutes timeout

    } catch (error) {
      console.error('Error running SSL Ansible setup:', error);
      await rpcService.updateRpcServer(serverId, { status: 'ssl_failed' });
    }
  }
  async deleteRpcServer(req, res, next) {
    try {
      const { id } = req.params;
      
      // Get server info before deletion
      const server = await rpcService.getRpcServerById(id);
      
      // Respond immediately to the client
      res.json({
        success: true,
        message: 'RPC server deletion initiated. Cleaning up resources...'
      });

      // Delete DigitalOcean droplet in the background
      const controller = this;
      setImmediate(async () => {
        try {
          console.log(`Starting cleanup for RPC server ${id}`);
          
          // Delete the droplet first
          const dropletDeleted = await controller.deleteDigitalOceanDroplet(id);
          
          if (dropletDeleted) {
            console.log(`Droplet cleanup completed for server ${id}`);
          } else {
            console.warn(`Droplet cleanup failed for server ${id}, but continuing with database cleanup`);
          }
          
          // Delete from database regardless of droplet deletion result
          await rpcService.deleteRpcServer(id);
          console.log(`RPC server ${id} permanently deleted from database`);
        } catch (error) {
          console.error(`Error during RPC server ${id} cleanup:`, error);
          // Even if cleanup fails, we should try to delete from database
          try {
            await rpcService.deleteRpcServer(id);
            console.log(`RPC server ${id} deleted from database despite cleanup errors`);
          } catch (dbError) {
            console.error(`Failed to delete server ${id} from database:`, dbError);
          }
        }
      });
      
    } catch (error) {
      if (error.message === 'RPC server not found') {
        return res.status(404).json({
          success: false,
          message: 'RPC server not found'
        });
      }
      next(error);
    }
  }
}

const rpcController = new RpcController();

// Bind all methods to ensure proper 'this' context
const boundController = {
  getAllRpcServers: rpcController.getAllRpcServers.bind(rpcController),
  getRpcServerById: rpcController.getRpcServerById.bind(rpcController),
  getRpcServersByProject: rpcController.getRpcServersByProject.bind(rpcController),
  createRpcServer: rpcController.createRpcServer.bind(rpcController),
  updateRpcServer: rpcController.updateRpcServer.bind(rpcController),
  deleteRpcServer: rpcController.deleteRpcServer.bind(rpcController),
  createSslCertificate: rpcController.handleCreateSslCertificate.bind(rpcController)
};

module.exports = boundController;
