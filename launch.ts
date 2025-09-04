
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';

interface ServiceConfig {
  name: string;
  command: string;
  args: string[];
  cwd: string;
  color: string;
}

// Service configurations
const services: ServiceConfig[] = [
  {
    name: 'server',
    command: 'bun',
    args: ['--watch', 'server.ts'],
    cwd: join(process.cwd(), 'server'),
    color: '\x1b[32m' // Green
  },
  {
    name: 'client',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: join(process.cwd(), 'client'),
    color: '\x1b[34m' // Blue
  },
  {
    name: 'item-images',
    command: 'bun',
    args: ['run', 'dev'],
    cwd: join(process.cwd(), 'item-images'),
    color: '\x1b[35m' // Magenta
  }
];

// Helper to create a process with proper output handling
function spawnProcess(config: ServiceConfig): ChildProcess {
  console.log(`${config.color}[${config.name}] Starting: ${config.command} ${config.args.join(' ')}\x1b[0m`);
  
  const proc = spawn(config.command, config.args, {
    stdio: 'pipe',
    shell: true,
    cwd: config.cwd
  });

  // Prefix output with component name and color
  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line: string) => {
      if (line.trim()) {
        console.log(`${config.color}[${config.name}]\x1b[0m ${line}`);
      }
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line: string) => {
      if (line.trim()) {
        console.error(`${config.color}[${config.name}]\x1b[0m ${line}`);
      }
    });
  });

  proc.on('error', (error) => {
    console.error(`${config.color}[${config.name}]\x1b[0m Process error:`, error);
  });

  proc.on('exit', (code, signal) => {
    if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGINT') {
      console.error(`${config.color}[${config.name}]\x1b[0m Process exited with code ${code}`);
      cleanup(); // Kill all processes if one fails unexpectedly
    } else {
      console.log(`${config.color}[${config.name}]\x1b[0m Process stopped`);
    }
  });

  return proc;
}

// Array to track child processes
const processes: ChildProcess[] = [];

console.log('\x1b[36m🚀 Starting Spirit of Kiro development environment...\x1b[0m\n');

// Start all services
services.forEach(config => {
  const proc = spawnProcess(config);
  processes.push(proc);
});

// Handle graceful shutdown
function cleanup() {
  console.log('\n\x1b[33m⏹️  Shutting down all services...\x1b[0m');
  
  processes.forEach((proc, index) => {
    const serviceName = services[index].name;
    const color = services[index].color;
    
    if (!proc.killed) {
      console.log(`${color}[${serviceName}]\x1b[0m Stopping...`);
      proc.kill('SIGTERM');
      
      // Force kill after 5 seconds if process doesn't stop gracefully
      setTimeout(() => {
        if (!proc.killed) {
          console.log(`${color}[${serviceName}]\x1b[0m Force killing...`);
          proc.kill('SIGKILL');
        }
      }, 5000);
    }
  });
  
  // Exit after a short delay to allow processes to clean up
  setTimeout(() => {
    console.log('\x1b[36m✅ All services stopped\x1b[0m');
    process.exit(0);
  }, 1000);
}

// Handle termination signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\x1b[31m❌ Uncaught exception:\x1b[0m', error);
  cleanup();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\x1b[31m❌ Unhandled rejection at:\x1b[0m', promise, 'reason:', reason);
  cleanup();
});

console.log('\n\x1b[36m✅ All services started! Press Ctrl+C to stop all services.\x1b[0m');
console.log('\x1b[36mServices running:\x1b[0m');
services.forEach(service => {
  console.log(`  ${service.color}• ${service.name}\x1b[0m - ${service.command} ${service.args.join(' ')}`);
});
console.log('');
