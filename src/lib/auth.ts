export async function verifyUser({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  // 模拟用户名密码数据库校验
  const USER_DB = [
    { id: '1', name: 'admin', username: 'admin', password: '123456' },
    { id: '2', name: 'user', username: 'user', password: '654321' },
  ];

  const user = USER_DB.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) return null;
  return { id: user.id, name: user.name };
}
