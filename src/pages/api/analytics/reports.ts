// Google Analytics Reporting API 端点
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// 这是一个服务端API端点，用于安全地调用Google Analytics Reporting API
// 避免在前端暴露认证信息

// 验证Google Analytics Property ID格式，防止SSRF攻击
function validatePropertyId(propertyId: string): boolean {
  if (!propertyId || typeof propertyId !== 'string') {
    return false;
  }
  
  // 长度限制防止超长输入
  if (propertyId.length > 50) {
    return false;
  }
  
  // 清理输入，移除潜在危险字符
  const cleanPropertyId = propertyId.trim().replace(/[^\w-]/g, '');
  if (cleanPropertyId !== propertyId.trim()) {
    return false;
  }
  
  // GA4 Property ID格式: 纯数字，长度8-15位（如: "123456789"）
  // GA Universal Analytics Property ID格式: "G-" + 字母数字，总长度10-15位（如: "G-XXXXXXXXX"）
  // GA Universal Analytics View ID格式: 纯数字，长度8-15位（如: "123456789"）
  const ga4PropertyIdPattern = /^\d{8,15}$/;
  const gaUniversalPropertyIdPattern = /^G-[A-Z0-9]{8,12}$/i;
  const gaViewIdPattern = /^\d{8,15}$/;
  
  return ga4PropertyIdPattern.test(propertyId) || 
         gaUniversalPropertyIdPattern.test(propertyId) || 
         gaViewIdPattern.test(propertyId);
}

// 验证日期格式，防止注入攻击
function validateDateParameter(date: string): boolean {
  if (!date || typeof date !== 'string') {
    return false;
  }
  
  // 支持的日期格式：
  // - 相对日期: "today", "yesterday", "7daysAgo", "30daysAgo" 等
  // - 绝对日期: "YYYY-MM-DD" 格式
  const relativeDatePattern = /^(today|yesterday|\d+daysAgo)$/i;
  const absoluteDatePattern = /^\d{4}-\d{2}-\d{2}$/;
  
  if (relativeDatePattern.test(date) || absoluteDatePattern.test(date)) {
    // 对于绝对日期，额外验证日期是否有效
    if (absoluteDatePattern.test(date)) {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate.toISOString().startsWith(date);
    }
    return true;
  }
  
  return false;
}

// 验证API URL是否为可信任的Google Analytics端点
function validateApiUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // 只允许Google Analytics官方API端点
  const allowedHosts = [
    'analyticsdata.googleapis.com',
    'analyticsreporting.googleapis.com',
    'oauth2.googleapis.com'
  ];
  
  try {
    const urlObj = new URL(url);
    return allowedHosts.includes(urlObj.hostname) && urlObj.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

interface AnalyticsRequest {
  propertyId: string;
  startDate?: string;
  endDate?: string;
  metrics?: string[];
  dimensions?: string[];
}

interface AnalyticsApiResponse {
  success: boolean;
  data?: AnalyticsData;
  error?: string;
  source?: 'ga4' | 'ua';
}

interface AnalyticsData {
  overview: {
    pageViews: number;
    users: number;
    sessions: number;
    bounceRate: number;
    avgSessionDuration: number;
    newUsers: number;
    returningUsers: number;
    events: number;
  };
  trend: Array<{
    date: string;
    pageViews: number;
    users: number;
    sessions: number;
    events: number;
  }>;
  topPages?: Array<{
    page: string;
    pageViews: number;
  }>;
  demographics?: {
    countries: Array<{ country: string; users: number }>;
    devices: Array<{ device: string; sessions: number }>;
  };
}

// 验证请求体大小和深度，防止DoS攻击
function validateRequestBody(body: any): boolean {
  if (!body || typeof body !== 'object') {
    return false;
  }
  
  // 请求体字符串化后的大小限制(10KB)
  const bodyString = JSON.stringify(body);
  if (bodyString.length > 10 * 1024) {
    return false;
  }
  
  // 检查对象嵌套深度，防止深度过深的对象
  function getMaxDepth(obj: any, currentDepth = 0): number {
    if (currentDepth > 10) return currentDepth; // 最大深度限制
    if (obj === null || typeof obj !== 'object') return currentDepth;
    
    let maxDepth = currentDepth;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const depth = getMaxDepth(obj[key], currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }
    return maxDepth;
  }
  
  const maxDepth = getMaxDepth(body);
  if (maxDepth > 5) {
    return false;
  }
  
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // 验证请求体大小和结构
  if (!validateRequestBody(req.body)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request body size or structure'
    });
  }

  try {
    const { 
      propertyId, 
      startDate = '7daysAgo', 
      endDate = 'today',
      metrics,
      dimensions 
    }: AnalyticsRequest = req.body;

    // 验证和清理metrics参数
    if (metrics && Array.isArray(metrics)) {
      if (metrics.length > 20) { // 限制metrics数量
        return res.status(400).json({
          success: false,
          error: 'Too many metrics requested'
        });
      }
      
      const validMetricPattern = /^[a-zA-Z0-9_]+$/;
      for (const metric of metrics) {
        if (!metric || typeof metric !== 'string' || 
            metric.length > 50 || !validMetricPattern.test(metric)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid metric name format'
          });
        }
      }
    }

    // 验证和清理dimensions参数
    if (dimensions && Array.isArray(dimensions)) {
      if (dimensions.length > 10) { // 限制dimensions数量
        return res.status(400).json({
          success: false,
          error: 'Too many dimensions requested'
        });
      }
      
      const validDimensionPattern = /^[a-zA-Z0-9_]+$/;
      for (const dimension of dimensions) {
        if (!dimension || typeof dimension !== 'string' || 
            dimension.length > 50 || !validDimensionPattern.test(dimension)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid dimension name format'
          });
        }
      }
    }

    // 如果没有提供propertyId，尝试从环境变量获取
    let finalPropertyId = propertyId || process.env.NEXT_PUBLIC_GA_ID;
    
    // 验证propertyId格式，防止SSRF攻击
    if (finalPropertyId && !validatePropertyId(finalPropertyId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid property ID format'
      });
    }
    
    // 验证日期参数，防止注入攻击
    if (!validateDateParameter(startDate) || !validateDateParameter(endDate)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }
    
    if (!finalPropertyId) {
      return res.status(400).json({
        success: false,
        error: 'No property ID provided and NEXT_PUBLIC_GA_ID not configured'
      });
    }

    // GA4 Data API需要数字格式的Property ID，不是G-XXXXXXXXX格式
    // 如果提供的是G-开头的格式，需要转换为数字ID
    if (finalPropertyId.startsWith('G-')) {
      const numericPropertyId = process.env.GA4_PROPERTY_ID;
      if (numericPropertyId) {
        finalPropertyId = numericPropertyId;
        console.log(`Using GA4 numeric property ID: ${numericPropertyId}`);
      } else {
        // 如果没有配置GA4_PROPERTY_ID，尝试使用Universal Analytics的View ID
        const viewId = process.env.GA_VIEW_ID;
        if (viewId) {
          finalPropertyId = viewId;
          console.log(`GA4_PROPERTY_ID not configured, falling back to GA_VIEW_ID: ${viewId}`);
        } else {
          return res.status(400).json({
            success: false,
            error: 'GA4 format detected but neither GA4_PROPERTY_ID nor GA_VIEW_ID configured'
          });
        }
      }
    }

    // 验证环境变量配置
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      return res.status(500).json({
        success: false,
        error: 'Google service account key not configured'
      });
    }

    // 获取真实的Google Analytics数据
    const analyticsData = await fetchAnalyticsData(
      finalPropertyId, 
      startDate, 
      endDate, 
      metrics, 
      dimensions
    );

    return res.status(200).json({
      success: true,
      data: analyticsData.data,
      source: analyticsData.source
    });

  } catch (error: any) {
    // 记录详细错误信息到服务器日志，但不暴露给客户端
    console.error('Analytics API Error:', {
      message: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    });
    
    // 清理敏感错误信息
    const sanitizeError = (err: any) => {
      if (!err) return 'Unknown error';
      
      const message = typeof err === 'string' ? err : err.message || 'Unknown error';
      
      // 移除可能包含敏感信息的路径和详细信息
      return message
        .replace(/\/[^\s]*/g, '[PATH_REMOVED]')
        .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REMOVED]')
        .replace(/[a-f0-9]{32,}/gi, '[TOKEN_REMOVED]');
    };
    
    // 如果是认证错误或API限制，返回错误
    if (error?.status === 403 || error?.status === 401) {
      return res.status(error.status).json({
        success: false,
        error: 'Authentication failed or access denied'
      });
    }
    
    // 生产环境中不暴露具体错误信息
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? sanitizeError(error)
      : 'Analytics service temporarily unavailable';
    
    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}

// 使用HTTP请求获取Google Analytics数据 (支持GA4)
async function fetchAnalyticsData(
  propertyId: string, 
  startDate: string, 
  endDate: string,
  customMetrics?: string[],
  customDimensions?: string[]
): Promise<{ data: AnalyticsData; source: 'ga4' | 'ua' }> {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('Google service account key not configured');
  }

  try {
    // 获取访问令牌
    const accessToken = await getAccessToken(serviceAccountKey);
    
    // 优先尝试GA4 API (Google Analytics Data API)
    try {
      const ga4Data = await fetchGA4Data(propertyId, startDate, endDate, accessToken, customMetrics, customDimensions);
      if (ga4Data) {
        return { data: ga4Data, source: 'ga4' };
      }
    } catch (ga4Error) {
      console.warn('GA4 API failed:', ga4Error);
    }
    
    // 如果GA4失败，尝试Universal Analytics API (作为备用)
    try {
      const uaData = await fetchUniversalAnalyticsData(propertyId, startDate, endDate, accessToken);
      if (uaData) {
        return { data: uaData, source: 'ua' };
      }
    } catch (uaError) {
      console.warn('UA API failed:', uaError);
    }
    
    // 如果都失败，抛出错误
    throw new Error('Both GA4 and UA API failed');
    
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    throw error;
  }
}

// 获取GA4数据
async function fetchGA4Data(
  propertyId: string, 
  startDate: string, 
  endDate: string, 
  accessToken: string,
  customMetrics?: string[],
  customDimensions?: string[]
): Promise<AnalyticsData | null> {
  try {
    // 验证propertyId防止SSRF攻击
    if (!validatePropertyId(propertyId)) {
      console.error('Invalid propertyId in fetchGA4Data:', propertyId);
      throw new Error('Invalid property ID format');
    }
    
    // 安全构建API URL - 使用URL对象和encodeURIComponent防止SSRF
    const baseUrl = 'https://analyticsdata.googleapis.com';
    const apiPath = `/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`;
    const apiUrl = new URL(apiPath, baseUrl).toString();
    
    // 二次验证构建的URL安全性
    if (!validateApiUrl(apiUrl)) {
      console.error('Invalid API URL in fetchGA4Data:', apiUrl);
      throw new Error('Invalid API URL');
    }
    
    // 默认指标
    const defaultMetrics = [
      { name: 'screenPageViews' }, // GA4中的页面浏览量
      { name: 'totalUsers' },      // GA4中的用户数
      { name: 'sessions' },        // GA4中的会话数
      { name: 'bounceRate' },      // GA4中的跳出率
      { name: 'averageSessionDuration' }, // GA4中的平均会话时长
      { name: 'newUsers' },        // GA4中的新用户
      { name: 'eventCount' },      // GA4中的事件数
    ];

    // 默认维度
    const defaultDimensions = [{ name: 'date' }];

    // 构建请求体
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: customMetrics ? customMetrics.map(name => ({ name })) : defaultMetrics,
      dimensions: customDimensions ? customDimensions.map(name => ({ name })) : defaultDimensions,
      // 添加排序和限制
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 1000
    };

    console.log('Fetching GA4 data for property:', propertyId);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GA4 API error: ${response.status} - ${errorText}`);
      throw new Error(`GA4 API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('GA4 API response received, transforming data...');
    
    // 并行获取额外的数据
    const [basicData, topPages, demographics] = await Promise.allSettled([
      Promise.resolve(transformGA4Data(data)),
      fetchGA4TopPages(propertyId, startDate, endDate, accessToken),
      fetchGA4Demographics(propertyId, startDate, endDate, accessToken)
    ]);

    if (basicData.status !== 'fulfilled') {
      throw new Error('Failed to transform GA4 data');
    }
    
    const result = basicData.value;
    
    // 合并额外数据
    if (topPages.status === 'fulfilled' && topPages.value) {
      result.topPages = topPages.value;
    }
    if (demographics.status === 'fulfilled' && demographics.value) {
      result.demographics = demographics.value;
    }

    return result;
  } catch (error) {
    console.error('GA4 API call failed:', error);
    throw error;
  }
}

// 获取Universal Analytics数据 (备用)
async function fetchUniversalAnalyticsData(propertyId: string, startDate: string, endDate: string, accessToken: string) {
  try {
    const apiUrl = 'https://analyticsreporting.googleapis.com/v4/reports:batchGet';
    
    // 验证API URL安全性
    if (!validateApiUrl(apiUrl)) {
      console.error('Invalid API URL in fetchUniversalAnalyticsData:', apiUrl);
      return null;
    }
    
    const requestBody = {
      reportRequests: [
        {
          viewId: propertyId,
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { expression: 'ga:pageviews' },
            { expression: 'ga:uniquePageviews' },
            { expression: 'ga:users' },
            { expression: 'ga:sessions' },
            { expression: 'ga:bounceRate' },
            { expression: 'ga:avgSessionDuration' },
            { expression: 'ga:newUsers' },
          ],
          dimensions: [{ name: 'ga:date' }]
        }
      ]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error(`UA API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return transformUniversalAnalyticsData(data);
  } catch (error) {
    console.error('UA API call failed:', error);
    return null;
  }
}

// 验证访问令牌格式
function validateAccessToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Bearer token基本格式验证
  if (token.length < 10 || token.length > 2048) {
    return false;
  }
  
  // 确保token只包含安全字符
  const tokenPattern = /^[A-Za-z0-9._-]+$/;
  return tokenPattern.test(token);
}

// 获取Google服务账号访问令牌
async function getAccessToken(serviceAccountKey: string): Promise<string> {
  try {
    const credentials = JSON.parse(serviceAccountKey);
    
    if (!credentials.private_key || !credentials.client_email) {
      throw new Error('Invalid service account key format');
    }
    
    // 验证服务账号邮箱格式
    const emailPattern = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.iam\.gserviceaccount\.com$/;
    if (!emailPattern.test(credentials.client_email)) {
      throw new Error('Invalid service account email format');
    }
    
    // 创建JWT令牌
    const jwtToken = await createJWT(credentials);
    
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    // 验证OAuth端点URL安全性
    if (!validateApiUrl(tokenUrl)) {
      throw new Error('Invalid OAuth token URL');
    }
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token response error:', errorText);
      throw new Error(`Token request failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Token response:', tokenData);
      throw new Error('No access token in response');
    }
    
    // 验证获取的访问令牌格式
    if (!validateAccessToken(tokenData.access_token)) {
      throw new Error('Invalid access token format received');
    }
    
    console.log('Successfully obtained access token');
    return tokenData.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error);
    throw error;
  }
}

// 创建JWT令牌（使用Node.js内置crypto模块）
async function createJWT(credentials: any): Promise<string> {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    // JWT Header
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };
    
    // JWT Payload
    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, // 1小时后过期
      iat: now,
    };

    // Base64URL编码
    const encodeBase64URL = (obj: any) => {
      return Buffer.from(JSON.stringify(obj))
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    };

    const encodedHeader = encodeBase64URL(header);
    const encodedPayload = encodeBase64URL(payload);
    const message = `${encodedHeader}.${encodedPayload}`;

    // 使用私钥签名
    const privateKey = credentials.private_key.replace(/\\n/g, '\n');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(message);
    const signature = sign.sign(privateKey, 'base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${message}.${signature}`;
  } catch (error) {
    console.error('JWT creation failed:', error);
    throw new Error(`JWT signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// 获取GA4热门页面数据
async function fetchGA4TopPages(
  propertyId: string, 
  startDate: string, 
  endDate: string, 
  accessToken: string
): Promise<Array<{ page: string; pageViews: number }> | null> {
  try {
    // 验证propertyId防止SSRF攻击
    if (!validatePropertyId(propertyId)) {
      console.error('Invalid propertyId in fetchGA4TopPages:', propertyId);
      return null;
    }
    
    // 安全构建API URL - 使用URL对象和encodeURIComponent防止SSRF
    const baseUrl = 'https://analyticsdata.googleapis.com';
    const apiPath = `/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`;
    const apiUrl = new URL(apiPath, baseUrl).toString();
    
    // 二次验证构建的URL安全性
    if (!validateApiUrl(apiUrl)) {
      console.error('Invalid API URL in fetchGA4TopPages:', apiUrl);
      return null;
    }
    
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'screenPageViews' },
      ],
      dimensions: [
        { name: 'pagePath' }
      ],
      orderBys: [{ 
        metric: { metricName: 'screenPageViews' }, 
        desc: true 
      }],
      limit: 10
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.warn(`GA4 Top Pages API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.rows) return null;
    
    return data.rows.map((row: any) => ({
      page: row.dimensionValues[0].value,
      pageViews: parseInt(row.metricValues[0].value || '0'),
    }));
  } catch (error) {
    console.warn('Failed to fetch GA4 top pages:', error);
    return null;
  }
}

// 获取GA4人口统计数据
async function fetchGA4Demographics(
  propertyId: string, 
  startDate: string, 
  endDate: string, 
  accessToken: string
): Promise<{ countries: Array<{ country: string; users: number }>; devices: Array<{ device: string; sessions: number }> } | null> {
  try {
    // 验证propertyId防止SSRF攻击
    if (!validatePropertyId(propertyId)) {
      console.error('Invalid propertyId in fetchGA4Demographics:', propertyId);
      return null;
    }
    
    // 安全构建API URL，防止SSRF攻击
    const baseApiUrl = 'https://analyticsdata.googleapis.com/v1beta/properties';
    const endpoint = 'runReport';
    const countriesApiUrl = `${baseApiUrl}/${encodeURIComponent(propertyId)}:${endpoint}`;
    const devicesApiUrl = `${baseApiUrl}/${encodeURIComponent(propertyId)}:${endpoint}`;
    
    // 验证构建的URL安全性
    if (!validateApiUrl(countriesApiUrl) || !validateApiUrl(devicesApiUrl)) {
      console.error('Invalid API URLs in fetchGA4Demographics');
      return null;
    }
    
    const [countriesData, devicesData] = await Promise.all([
      // 获取国家数据
      fetch(countriesApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          metrics: [{ name: 'totalUsers' }],
          dimensions: [{ name: 'country' }],
          orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
          limit: 10
        })
      }),
      // 获取设备数据
      fetch(devicesApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          metrics: [{ name: 'sessions' }],
          dimensions: [{ name: 'deviceCategory' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
        })
      })
    ]);

    const countries = countriesData.ok ? await countriesData.json() : null;
    const devices = devicesData.ok ? await devicesData.json() : null;

    return {
      countries: countries?.rows ? countries.rows.map((row: any) => ({
        country: row.dimensionValues[0].value,
        users: parseInt(row.metricValues[0].value || '0')
      })) : [],
      devices: devices?.rows ? devices.rows.map((row: any) => ({
        device: row.dimensionValues[0].value,
        sessions: parseInt(row.metricValues[0].value || '0')
      })) : []
    };
  } catch (error) {
    console.warn('Failed to fetch GA4 demographics:', error);
    return null;
  }
}

// 转换GA4 API响应数据
function transformGA4Data(apiResponse: any): AnalyticsData {
  try {
    const rows = apiResponse.rows || [];
    
    const overview = {
      pageViews: 0,
      users: 0,
      sessions: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      newUsers: 0,
      returningUsers: 0,
      events: 0,
    };

    const trend: Array<{
      date: string;
      pageViews: number;
      users: number;
      sessions: number;
      events: number;
    }> = [];

    rows.forEach((row: any) => {
      const date = row.dimensionValues[0].value;
      const metrics = row.metricValues;
      
      // 累加总览数据
      const pageViews = parseInt(metrics[0].value || '0');
      const users = parseInt(metrics[1].value || '0');
      const sessions = parseInt(metrics[2].value || '0');
      const bounceRate = parseFloat(metrics[3].value || '0');
      const avgSessionDuration = parseFloat(metrics[4].value || '0');
      const newUsers = parseInt(metrics[5].value || '0');
      const events = parseInt(metrics[6].value || '0');

      overview.pageViews += pageViews;
      overview.users += users;
      overview.sessions += sessions;
      overview.bounceRate += bounceRate;
      overview.avgSessionDuration += avgSessionDuration;
      overview.newUsers += newUsers;
      overview.events = (overview.events || 0) + events;

      // 添加趋势数据
      trend.push({
        date: formatGA4Date(date),
        pageViews: pageViews,
        users: users,
        sessions: sessions,
        events: events,
      });
    });

    // 计算平均值和回访用户
    const daysCount = rows.length || 1;
    overview.bounceRate = overview.bounceRate / daysCount;
    overview.avgSessionDuration = overview.avgSessionDuration / daysCount;
    overview.returningUsers = overview.users - overview.newUsers;

    console.log('GA4 data transformed successfully');
    return { 
      overview, 
      trend,
      // topPages 和 demographics 将在外部函数中设置
    };
  } catch (error) {
    console.error('Error transforming GA4 data:', error);
    throw error;
  }
}

// 转换Universal Analytics API响应数据
function transformUniversalAnalyticsData(apiResponse: any): AnalyticsData {
  // 解析Google Analytics API响应并转换为我们需要的格式
  try {
    const report = apiResponse.reports[0];
    const rows = report.data.rows || [];
    
    const overview = {
      pageViews: 0,
      users: 0,
      sessions: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      newUsers: 0,
      returningUsers: 0,
      events: 0,
    };

    const trend: Array<{
      date: string;
      pageViews: number;
      users: number;
      sessions: number;
      events: number;
    }> = [];

    rows.forEach((row: any) => {
      const date = row.dimensions[0];
      const metrics = row.metrics[0].values;
      
      // 累加总览数据
      overview.pageViews += parseInt(metrics[0] || '0');
      overview.users += parseInt(metrics[1] || '0');
      overview.sessions += parseInt(metrics[2] || '0');
      overview.bounceRate += parseFloat(metrics[3] || '0');
      overview.avgSessionDuration += parseFloat(metrics[4] || '0');
      overview.newUsers += parseInt(metrics[5] || '0');
      // UA 没有事件数据，设为0
      const events = 0;
      overview.events += events;

      // 添加趋势数据
      trend.push({
        date: formatDate(date),
        pageViews: parseInt(metrics[0] || '0'),
        users: parseInt(metrics[1] || '0'),
        sessions: parseInt(metrics[2] || '0'),
        events: events,
      });
    });

    // 计算平均值
    const daysCount = rows.length || 1;
    overview.bounceRate = overview.bounceRate / daysCount;
    overview.avgSessionDuration = overview.avgSessionDuration / daysCount;
    overview.returningUsers = overview.users - overview.newUsers;

    console.log('UA data transformed successfully');
    return { overview, trend };
  } catch (error) {
    console.error('Error transforming analytics data:', error);
    throw error;
  }
}

// 格式化GA4日期
function formatGA4Date(dateString: string): string {
  // GA4日期格式通常是 YYYYMMDD，转换为 YYYY-MM-DD
  if (dateString.length === 8) {
    return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
  }
  return dateString;
}

// 格式化Universal Analytics日期
function formatDate(dateString: string): string {
  // 将 YYYYMMDD 格式转换为 YYYY-MM-DD
  if (dateString.length === 8) {
    return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
  }
  return dateString;
}

