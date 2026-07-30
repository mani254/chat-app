export const REDIS_CLIENT = 'REDIS_CLIENT' as const;
export const REDIS_PUB_CLIENT = 'REDIS_PUB_CLIENT' as const;
export const REDIS_SUB_CLIENT = 'REDIS_SUB_CLIENT' as const;

export const REDIS_KEY_PREFIX = {
  ONLINE_USERS_SET: 'presence:online_users',
  USER_SOCKETS_PREFIX: 'presence:user:',
  HEARTBEAT_PREFIX: 'presence:heartbeat:',
} as const;
