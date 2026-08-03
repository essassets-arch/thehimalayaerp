import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  roleName: string;
  companyId: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface ElevationTokenPayload {
  sub: string;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  sub: string;
  email: string;
  roleId: string;
  roleName: string;
  companyId: string;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  requestId?: string;
}

export interface PrismaErrorResponse {
  code?: string;
  meta?: {
    field_name?: string;
    target?: string[];
  };
  message?: string;
}

export interface RequestMetadata {
  requestId: string;
  timestamp: string;
}

export interface PermissionCollection {
  [key: string]: boolean;
}
