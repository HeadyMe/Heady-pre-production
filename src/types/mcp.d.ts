// MCP interfaces for Heady Sonic Workspace

export interface McpServer {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface McpConfig {
  mcpServers: Record<string, McpServer>;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: number; // Fibonacci number
  status: 'pending' | 'in-progress' | 'done';
  createdAt: string;
  updatedAt?: string;
}

export interface TrackNote {
  id: string;
  taskId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}
