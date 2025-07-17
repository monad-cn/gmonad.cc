// Quill 模块注册管理器 - 避免重复注册和循环引用
class QuillModuleRegistry {
  private static instance: QuillModuleRegistry;
  private isRegistering = false;
  private isRegistered = false;
  private registrationPromise: Promise<boolean> | null = null;

  private constructor() {}

  public static getInstance(): QuillModuleRegistry {
    if (!QuillModuleRegistry.instance) {
      QuillModuleRegistry.instance = new QuillModuleRegistry();
    }
    return QuillModuleRegistry.instance;
  }

  public async ensureModuleRegistered(): Promise<boolean> {
    // 如果已经注册完成，直接返回
    if (this.isRegistered) {
      return true;
    }

    // 如果正在注册中，等待当前的注册完成
    if (this.isRegistering && this.registrationPromise) {
      return this.registrationPromise;
    }

    // 开始新的注册过程
    this.isRegistering = true;
    this.registrationPromise = this.performRegistration();

    try {
      const result = await this.registrationPromise;
      this.isRegistered = result;
      return result;
    } finally {
      this.isRegistering = false;
    }
  }

  private async performRegistration(): Promise<boolean> {
    try {
      // 只在浏览器环境中执行
      if (typeof window === 'undefined') {
        return false;
      }

      // 动态导入 React Quill
      const ReactQuillModule = await import('react-quill-new');
      const Quill = ReactQuillModule.default?.Quill || (window as any).Quill;

      if (!Quill) {
        console.warn('Quill not found');
        return false;
      }

      // 检查模块是否已经注册
      if (Quill.imports?.['modules/cloudinaryUploader']) {
        console.log('CloudinaryUploader module already registered');
        return true;
      }

      // 动态导入 CloudinaryModule
      const CloudinaryModule = await import('./QuillCloudinaryModule');
      
      // 注册模块
      Quill.register('modules/cloudinaryUploader', CloudinaryModule.QuillCloudinaryModule);
      console.log('CloudinaryUploader module registered successfully');
      
      return true;
    } catch (error) {
      console.warn('Failed to register Quill CloudinaryUploader module:', error);
      return false;
    }
  }

  public isModuleRegistered(): boolean {
    return this.isRegistered;
  }

  // 用于测试的重置方法
  public reset(): void {
    this.isRegistered = false;
    this.isRegistering = false;
    this.registrationPromise = null;
  }
}

export default QuillModuleRegistry;