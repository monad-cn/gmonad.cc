import type { NextApiResponse } from 'next';

export function success<T>(
  res: NextApiResponse,
  message: string,
  data?: T,
  status = 200
) {
  return res.status(status).json({
    code: 200,
    message,
    data,
  });
}

export function failure(
  res: NextApiResponse,
  status: number,
  message: string,
  data: unknown = null
) {
  return res.status(status).json({
    code: status,
    message,
    data,
  });
}
