/**
 * 轻量配置中心，模拟远程配置热更新能力。
 * 分享时可现场修改限流阈值，无需重启服务。
 */

export enum RateLimitType {
  Cip = 'Cip',
  Uid = 'Uid',
  Global = 'Global',
}

export interface RateLimitConfig {
  rateLimitInterval: number;
  rateLimitMax: number;
  rateLimitMessage: string;
  /** true = 观察模式：只记录日志，不真正拦截 */
  disable: boolean;
}

type RateLimitMap = Map<RateLimitType, RateLimitConfig>;

const defaultRateLimits: RateLimitMap = new Map([
  [
    RateLimitType.Cip,
    {
      rateLimitInterval: 5000,
      rateLimitMax: 5,
      rateLimitMessage: 'IP rate limit exceeded',
      disable: true,
    },
  ],
  [
    RateLimitType.Uid,
    {
      rateLimitInterval: 5000,
      rateLimitMax: 5,
      rateLimitMessage: 'User rate limit exceeded',
      disable: true,
    },
  ],
  [
    RateLimitType.Global,
    {
      rateLimitInterval: 5000,
      rateLimitMax: 10,
      rateLimitMessage: 'Global rate limit exceeded',
      disable: true,
    },
  ],
]);

class ConfigStore {
  private rateLimits: RateLimitMap = new Map(defaultRateLimits);

  getRateLimit(type: RateLimitType): RateLimitConfig {
    return { ...this.rateLimits.get(type)! };
  }

  getAllRateLimits(): Record<RateLimitType, RateLimitConfig> {
    return {
      [RateLimitType.Cip]: this.getRateLimit(RateLimitType.Cip),
      [RateLimitType.Uid]: this.getRateLimit(RateLimitType.Uid),
      [RateLimitType.Global]: this.getRateLimit(RateLimitType.Global),
    };
  }

  updateRateLimit(type: RateLimitType, patch: Partial<RateLimitConfig>): void {
    const current = this.rateLimits.get(type);
    if (!current) return;
    this.rateLimits.set(type, { ...current, ...patch });
  }
}

export const configStore = new ConfigStore();
