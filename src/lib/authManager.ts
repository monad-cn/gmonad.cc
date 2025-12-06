// 认证管理器 - 防止重复登录请求
class AuthManager {
  private static instance: AuthManager;
  private isLoggingIn = false;
  private loginPromise: Promise<any> | null = null;
  private lastSuccessMessageTime = 0;

  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public async ensureLogin(signInFn: () => Promise<any>): Promise<any> {
    // 如果正在登录中，等待当前的登录完成
    if (this.isLoggingIn && this.loginPromise) {
      return this.loginPromise;
    }

    // 开始新的登录过程
    this.isLoggingIn = true;
    this.loginPromise = this.performLogin(signInFn);

    try {
      const result = await this.loginPromise;
      return result;
    } finally {
      this.isLoggingIn = false;
      this.loginPromise = null;
    }
  }

  private async performLogin(signInFn: () => Promise<any>): Promise<any> {
    try {
      return await signInFn();
    } catch (error) {
      throw error;
    }
  }

  public isLoginInProgress(): boolean {
    return this.isLoggingIn;
  }

  // 防止重复显示成功消息
  public shouldShowSuccessMessage(): boolean {
    const now = Date.now();
    if (now - this.lastSuccessMessageTime < 1000) { // 1秒内不重复显示
      return false;
    }
    this.lastSuccessMessageTime = now;
    return true;
  }

  // 用于测试的重置方法
  public reset(): void {
    this.isLoggingIn = false;
    this.loginPromise = null;
    this.lastSuccessMessageTime = 0;
  }
}

export default AuthManager;