// API Request Types
export interface ExecuteRequest {
  query?: string;
  inputs?: Record<string, any>;
  adapter?: string;
  executionId?: string;
  userInput?: Record<string, any>;
}

// API Response Types
export interface ExecuteResponse {
  status: 'COMPLETED' | 'WAITING_FOR_INPUT' | 'FAILED';
  skillId?: string;
  intent?: string;
  output?: DocumentSpec | any;
  executionId?: string;
  awaitMessage?: string;
  inputSchema?: Record<string, FieldSpec>;
  durationMs?: number;
  success: boolean;
  error?: string | null;
}

export interface FieldSpec {
  type: 'string' | 'boolean' | 'number';
  required: boolean;
  description?: string;
}

// Document Spec v1
export interface DocumentSpec {
  type: 'document';
  version: 'v1';
  blocks: Block[];
}

export type Block = ParagraphBlock | ChartBlock;

export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
}

export interface ChartBlock {
  type: 'chart';
  chart: ChartSpec;
}

export interface ChartSpec {
  type: 'bar' | 'line';
  title: string;
  x: string[];
  series: Series[];
}

export interface Series {
  name: string;
  data: number[];
}

// Application State Types
export interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content?: string | DocumentSpec;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
  // Specific for flow control
  isAwaitPrompt?: boolean;
  executionId?: string;
  inputSchema?: Record<string, FieldSpec>;
  hasSubmitted?: boolean;
}

export interface Session {
  id: string;
  title: string;
  updatedAt: number;
}