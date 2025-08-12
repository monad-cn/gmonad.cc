// Google Analytics Reporting API 端点
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// 这是一个服务端API端点，用于安全地调用Google Analytics Reporting API
// 避免在前端暴露认证信息

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
  source?: 'ga4' | 'ua' | 'mock';
}

interface AnalyticsData {
  overview: {
    pageViews: number;
    uniquePageViews: number;
    users: number;
    sessions: number;
    bounceRate: number;
    avgSessionDuration: number;
    newUsers: number;
    returningUsers: number;
  };
  trend: Array<{
    date: string;
    pageViews: number;
    uniquePageViews: number;
    users: number;
    sessions: number;
  }>;
  topPages?: Array<{
    page: string;
    pageViews: number;
    uniquePageViews: number;
  }>;
  demographics?: {
    countries: Array<{ country: string; users: number }>;
    devices: Array<{ device: string; sessions: number }>;
  };
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

  try {
    const { 
      propertyId, 
      startDate = '7daysAgo', 
      endDate = 'today',
      metrics,
      dimensions 
    }: AnalyticsRequest = req.body;

    // 如果没有提供propertyId，尝试从环境变量获取
    let finalPropertyId = propertyId || process.env.NEXT_PUBLIC_GA_ID;
    
    if (!finalPropertyId) {
      console.warn('No property ID provided and NEXT_PUBLIC_GA_ID not configured, using mock data');
      return res.status(200).json({
        success: true,
        data: generateMockData(),
        source: 'mock'
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
          console.warn('GA4 format detected but neither GA4_PROPERTY_ID nor GA_VIEW_ID configured, using mock data');
          return res.status(200).json({
            success: true,
            data: generateMockData(),
            source: 'mock'
          });
        }
      }
    }

    // 验证环境变量配置
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      console.warn('Google service account key not configured, using mock data');
      return res.status(200).json({
        success: true,
        data: generateMockData(),
        source: 'mock'
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
    console.error('Analytics API Error:', error);
    
    // 如果是认证错误或API限制，返回详细错误信息
    if (error.status === 403) {
      return res.status(200).json({
        success: true,
        data: generateMockData(),
        source: 'mock',
        error: 'API access denied, using mock data'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Analytics service temporarily unavailable'
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
): Promise<{ data: AnalyticsData; source: 'ga4' | 'ua' | 'mock' }> {
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
    
    // 如果都失败，返回模拟数据
    console.warn('Both GA4 and UA API failed, using mock data');
    return { data: generateMockData(), source: 'mock' };
    
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    return { data: generateMockData(), source: 'mock' };
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
    const apiUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
    
    // 默认指标
    const defaultMetrics = [
      { name: 'screenPageViews' }, // GA4中的页面浏览量
      { name: 'totalUsers' },      // GA4中的用户数
      { name: 'sessions' },        // GA4中的会话数
      { name: 'bounceRate' },      // GA4中的跳出率
      { name: 'averageSessionDuration' }, // GA4中的平均会话时长
      { name: 'newUsers' },        // GA4中的新用户
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

    const result = basicData.status === 'fulfilled' ? basicData.value : generateMockData();
    
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

// 获取Google服务账号访问令牌
async function getAccessToken(serviceAccountKey: string): Promise<string> {
  try {
    const credentials = JSON.parse(serviceAccountKey);
    
    if (!credentials.private_key || !credentials.client_email) {
      throw new Error('Invalid service account key format');
    }
    
    // 创建JWT令牌
    const jwtToken = await createJWT(credentials);
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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
): Promise<Array<{ page: string; pageViews: number; uniquePageViews: number }> | null> {
  try {
    const apiUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
    
    const requestBody = {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'totalUsers' }, // 作为uniquePageViews的近似值
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
      uniquePageViews: parseInt(row.metricValues[1].value || '0')
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
    const [countriesData, devicesData] = await Promise.all([
      // 获取国家数据
      fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
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
      fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
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
      uniquePageViews: 0, // GA4中没有直接对应，使用screenPageViews
      users: 0,
      sessions: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      newUsers: 0,
      returningUsers: 0,
    };

    const trend: Array<{
      date: string;
      pageViews: number;
      uniquePageViews: number;
      users: number;
      sessions: number;
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

      overview.pageViews += pageViews;
      overview.uniquePageViews += pageViews; // GA4中使用相同值
      overview.users += users;
      overview.sessions += sessions;
      overview.bounceRate += bounceRate;
      overview.avgSessionDuration += avgSessionDuration;
      overview.newUsers += newUsers;

      // 添加趋势数据
      trend.push({
        date: formatGA4Date(date),
        pageViews: pageViews,
        uniquePageViews: pageViews, // GA4中使用相同值
        users: users,
        sessions: sessions,
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
    return generateMockData();
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
      uniquePageViews: 0,
      users: 0,
      sessions: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      newUsers: 0,
      returningUsers: 0,
    };

    const trend: Array<{
      date: string;
      pageViews: number;
      uniquePageViews: number;
      users: number;
      sessions: number;
    }> = [];

    rows.forEach((row: any) => {
      const date = row.dimensions[0];
      const metrics = row.metrics[0].values;
      
      // 累加总览数据
      overview.pageViews += parseInt(metrics[0] || '0');
      overview.uniquePageViews += parseInt(metrics[1] || '0');
      overview.users += parseInt(metrics[2] || '0');
      overview.sessions += parseInt(metrics[3] || '0');
      overview.bounceRate += parseFloat(metrics[4] || '0');
      overview.avgSessionDuration += parseFloat(metrics[5] || '0');
      overview.newUsers += parseInt(metrics[6] || '0');

      // 添加趋势数据
      trend.push({
        date: formatDate(date),
        pageViews: parseInt(metrics[0] || '0'),
        uniquePageViews: parseInt(metrics[1] || '0'),
        users: parseInt(metrics[2] || '0'),
        sessions: parseInt(metrics[3] || '0'),
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
    return generateMockData();
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

// 生成模拟数据
function generateMockData(): AnalyticsData {
  const overview = {
    pageViews: Math.floor(Math.random() * 50000) + 20000,
    uniquePageViews: Math.floor(Math.random() * 30000) + 15000,
    users: Math.floor(Math.random() * 8000) + 3000,
    sessions: Math.floor(Math.random() * 12000) + 5000,
    bounceRate: Math.floor(Math.random() * 30) + 35,
    avgSessionDuration: Math.floor(Math.random() * 180) + 120,
    newUsers: Math.floor(Math.random() * 3000) + 1000,
    returningUsers: Math.floor(Math.random() * 5000) + 2000,
  };

  const trend = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    trend.push({
      date: date.toISOString().split('T')[0],
      pageViews: Math.floor(Math.random() * 8000) + 2000,
      uniquePageViews: Math.floor(Math.random() * 5000) + 1500,
      users: Math.floor(Math.random() * 1200) + 400,
      sessions: Math.floor(Math.random() * 1800) + 600,
    });
  }

  // 生成模拟的热门页面数据
  const topPages = [
    { page: '/', pageViews: Math.floor(Math.random() * 5000) + 2000, uniquePageViews: Math.floor(Math.random() * 3000) + 1500 },
    { page: '/blog', pageViews: Math.floor(Math.random() * 3000) + 1000, uniquePageViews: Math.floor(Math.random() * 2000) + 800 },
    { page: '/about', pageViews: Math.floor(Math.random() * 2000) + 500, uniquePageViews: Math.floor(Math.random() * 1500) + 400 },
    { page: '/contact', pageViews: Math.floor(Math.random() * 1500) + 300, uniquePageViews: Math.floor(Math.random() * 1000) + 250 },
    { page: '/products', pageViews: Math.floor(Math.random() * 2500) + 800, uniquePageViews: Math.floor(Math.random() * 1800) + 600 },
  ];

  // 生成模拟的人口统计数据
  const demographics = {
    countries: [
      { country: 'United States', users: Math.floor(Math.random() * 2000) + 1000 },
      { country: 'China', users: Math.floor(Math.random() * 1500) + 800 },
      { country: 'United Kingdom', users: Math.floor(Math.random() * 1000) + 500 },
      { country: 'Germany', users: Math.floor(Math.random() * 800) + 400 },
      { country: 'Japan', users: Math.floor(Math.random() * 600) + 300 },
    ],
    devices: [
      { device: 'desktop', sessions: Math.floor(Math.random() * 5000) + 3000 },
      { device: 'mobile', sessions: Math.floor(Math.random() * 7000) + 4000 },
      { device: 'tablet', sessions: Math.floor(Math.random() * 2000) + 800 },
    ]
  };

  console.log('Generated mock analytics data');
  return { overview, trend, topPages, demographics };
}