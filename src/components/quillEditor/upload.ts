export function base64toFile(base64String: string): File {
  // 去掉 base64 字符串的前缀（如 "data:image/png;base64,"）
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  // 将 base64 字符串解码为二进制数据
  const byteCharacters = atob(base64Data);
  // 将二进制数据转换为字节数组
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  // 创建一个 Uint8Array
  const uint8Array = new Uint8Array(byteNumbers);
  // 创建 Blob 对象
  const blob = new Blob([uint8Array], { type: 'image/png' });
  // 生成唯一的文件名
  const filename = `image_${Date.now()}.png`;
  // 创建 File 对象
  const file = new File([blob], filename, { type: 'image/png' });

  return file;
}
