import { defineConfig } from 'vitepress'
import { getOpenGraphImage } from '../utils/opengraph'
import type { TransformContext, HeadConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ignoreDeadLinks: true,
  lang: 'zh-CN',
  title: "Monad 中文社区",
  description: "GMonad, 欢迎一起建设 Monad！",
  head: [
    ["link", { rel: "icon", type: "image/png", href: "/icon.png" }],
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
	  '/develop/': [
        {
          text: '中文开发文档',
          children: [
            '/develop/index',
          ]
        },
      ],
	  '/event/': [
        {
          text: '活动',
          collapsed: false,
          link: '/event' ,
          items: [
            { text: 'Monad 201 深圳', link: '/event/monad201_sz' },
            { text: 'Monad AMA 开发者初体验', link: '/event/monad_testnet_firstexp_ama' },
            { text: 'Monad 101 Bootcamp', link: '/event/monad101_bootcamp' }, 
            { text: 'Monad 101 香港', link: '/event/monad101_hk' },
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
  }
})
