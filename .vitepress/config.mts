import { defineConfig } from 'vitepress'
import { getOpenGraphImage } from '../utils/opengraph'
import { getBlogPosts } from '../utils/getBlogPosts'
import type { TransformContext, HeadConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ignoreDeadLinks: true,
  lang: 'zh-CN',
  title: "Monad 中文社区",
  description: "GMonad, 欢迎一起建设 Monad！",
  head: [
    ["link", { rel: "icon", type: "image/png", href: "/icon.png" }],
    [
      'script',
      { async: '', src: `https://www.googletagmanager.com/gtag/js?id=${process.env.VITE_GOOGLE_ANALYTICS_TAG_ID}` }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${process.env.VITE_GOOGLE_ANALYTICS_TAG_ID}');`
    ]
  ],
  transformHead: (context: TransformContext) => {    
    if (!context.pageData) {
      return []
    }

    const ogImage = getOpenGraphImage(context.pageData)
    const pageTitle = context.pageData.title || "Monad 中文社区"
    const pageDesc = context.pageData.description || "GMonad, 欢迎一起建设 Monad！"
    const pageUrl = `https://gmonad.cc${context.pageData.relativePath?.replace(/\.md$/, '') || ''}`

    const head: HeadConfig[] = [
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:title", content: pageTitle }],
      ["meta", { property: "og:description", content: pageDesc }],
      ["meta", { property: "og:image", content: ogImage }],
      ["meta", { property: "og:url", content: pageUrl }],
      ["meta", { name: "twitter:card", content: "summary_large_image" }],
      ["meta", { name: "twitter:title", content: pageTitle }],
      ["meta", { name: "twitter:description", content: pageDesc }],
      ["meta", { name: "twitter:image", content: ogImage }],
    ]

    return head
  },
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/monad-cn/gmonad.cc/edit/main/:path',
      text: '在 GitHub 上编辑此页'
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                },
                displayDetails: '显示详情',
                backButtonTitle: '返回',
              }
            }
          }
        }
      }
    },
    // https://vitepress.dev/reference/default-theme-config
	logo: 'https://avatars.githubusercontent.com/u/184135503',
    nav: [
      { text: '首页', link: '/' },
      { text: '生态导航', link: '/ecosystem/' },
      { text: '活动', link: '/event/' },
      { text: '博客', link: '/blog/' },
      { text: '贡献者', link: '/contributors/' },
      { text: 'FAQ', link: '/FAQ/' },
      { text: '水龙头', link: 'https://faucet.openbuild.xyz/' },
      { text: '官网', link: 'https://www.monad.xyz/' },
    ],
	sidebar: {
	  '/guide/': [
        {
          text: '中文开发文档',
          collapsed: false,
          link: '/guide' ,
          items: [
            { text: '如何开发你的第一个 Web3 项目', link: '/guide/pixel_grid_guide' },
          ]
        },
      ],
	  '/event/': [
        {
          text: '活动',
          collapsed: false,
          link: '/event' ,
          items: [
            { text: 'MCP 入门及 MCP 在 Monad 上的实战', link: '/event/monad_mcp_abc' },
            { text: 'Monad Bootcamp AMA(4.23)', link: '/event/monad_bootcamp_ama_423' },
            { text: 'Monad Bootcamp AMA(4.7)', link: '/event/monad_bootcamp_ama' },
            { text: '四月 Flash Mop（香港）', link: '/event/monad_flash_mop_april' },
            { text: 'Monad 201 深圳', link: '/event/monad201_sz' },
            { text: 'Testnet AMA：开发者初体验', link: '/event/monad_testnet_firstexp_ama' },
            { text: 'Monad 101 Bootcamp 🔥', link: '/event/monad101_bootcamp' }, 
            { text: 'Monad 101 香港', link: '/event/monad101_hk' },
            { text: 'Monad Madness 香港 AMA(4.24)', link: '/event/monad_madness_hk_ama_424' },
            { text: 'Madness 香港获奖项目AMA(4.23)', link: '/event/monad_madness_hk_ama' },
            { text: 'Break Monad v2：Farcaster 版！', link: '/event/break_monad_v2' },
          ]
        },
	  ],
	  '/blog/': [
        {
          text: '博客',
          collapsed: false,
          link: '/blog' ,
          items: [
            { text: 'Monad vs Rollups', link: '/blog/monad_vs_rollups' },
            { text: 'Monad 的安全优势', link: '/blog/security_benefits_of_monad' },
            { text: '浅析 MonadBFT', link: '/blog/monadbft_intro' },
            { text: '认识 Monad：4W1H', link: '/blog/who_what_how_why_when' },
            { text: '一文梳理 Monad 工作原理', link: '/blog/how_monad_work' },
            { text: 'Monad 测试网首日表现', link: '/blog/testnet_data_first_day' },
            { text: 'Monad Games密码挑战赛深度探讨', link: 'blog/monad_games_cipher_challenge'},
            { text: 'Madness Hong Kong 项目回顾', link: '/blog/monad_madness_hk'},
            { text: '联创 Keone Hon 访谈', link: '/blog/keonehon_interview'},
            { text: 'Hyperliquid、Monad 和 Sonic 共识模型的演变', link: '/blog/hyperliquid_monad_sonic'},
            { text: 'MonadBFT 解析（上）：如何解决尾部分叉问题', link: '/blog/monadbft_deep_dive_p1'},
            { text: '我为何如此钟爱Monad', link: '/blog/why_i_love_monad_so_much'},
            { text: 'Monad测试网你应该关注的项目', link: '/blog/monad_testnet_important_projects'},
            { text: 'MonadBFT 解析（下）：对开发者的影响', link: '/blog/monadbft_deep_dive_p2'},
            { text: 'Multisynq × Monad：构建实时去中心化应用层的底层基础设施', link: '/blog/multisynq_monad'},
            { text: 'Web3 实战：解锁 Monad MCP，轻松查询 MON 余额', link: '/blog/web3_monad_mcp'},
          ]
        },
	  ],
	  '/ecosystem/': [
        {
          text: '生态导航',
          children: [
            '/ecosystem/index',
          ]
        },
	  ],
	  '/FAQ/': [
        {
          text: 'FAQ',
          children: [
            '/FAQ/index',
          ]
        },
	  ],
	  '/contributors/': [
        {
          text: '如何参与 Monad 社区？',
          children: [
            '/contributors/index',
          ]
        },
        {
          text: '社区贡献者',
          collapsed: false,
          link: '/contributors/contributors' ,
          items: [
            { text: '社区贡献者们', link: '/contributors/contributors' },
            { text: '社区贡献者计划', link: '/contributors/contributor_intro' },
          ]
        },
        {
          text: '社区大使',
          collapsed: false,
          link: '/contributors/ambassador',
          items: [
            { text: '社区大使们', link: '/contributors/ambassador' },
            { text: 'Monad 社区大使计划', link: '/contributors/ambassador_intro' },
          ]
        },
	  ],
	},

    socialLinks: [
      { icon: 'github', link: 'https://github.com/monad-cn/gmonad.cc' },
      { icon: 'twitter', link: 'https://x.com/monad_zw' },
      { icon: 'discord', link: 'https://discord.gg/monad' }
    ],

    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    
    outline: {
      label: '页面导航',
      level: 'deep'
    },
    
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    
    // 博客文章数据
    blogPosts: getBlogPosts()
  }
})
