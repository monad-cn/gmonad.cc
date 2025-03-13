import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ignoreDeadLinks: true,
  lang: 'zh-CN',
  title: "Monad 中文社区",
  description: "GMonad, 欢迎一起建设 Monad！",
  head: [
    ["link", { rel: "icon", type: "image/png", href: "/icon.png" }],
    // OpenGraph 标签
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "Monad 中文社区" }],
    ["meta", { property: "og:description", content: "GMonad, 欢迎一起建设 Monad！" }],
    ["meta", { property: "og:image", content: "/opengraph/basic.png" }],
    ["meta", { property: "og:url", content: "https://gmonad.cc" }],
    // Twitter 卡片
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: "Monad 中文社区" }],
    ["meta", { name: "twitter:description", content: "GMonad, 欢迎一起建设 Monad！" }],
    ["meta", { name: "twitter:image", content: "/opengraph/basic.png" }],
  ],
  themeConfig: {
	search: {
      provider: 'local',
      options: {
        extractField: 'text',
        tokenize: true,
        locales: {
          zh: {
            button: '搜索文档',
            modal: {
              noResults: '无法找到相关结果',
              resetButtonTitle: '清除查询条件'
            },
            select: {
              text: '选择',
              navigate: '切换'
            }
          }
        }
      }
    },
    // https://vitepress.dev/reference/default-theme-config
	logo: 'https://avatars.githubusercontent.com/u/184135503',
    nav: [
      { text: '首页', link: '/index' },
      { text: '生态导航', link: '/ecosystem' },
      { text: '活动', link: '/event' },
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
          children: [
            '/event/index',
          ]
        },
        {
          text: 'Monad 101',
          collapsed: false,
          link: '/event/monad101' ,
          items: [
            { text: '巡回活动 —— 香港站', link: '/event/monad101/hk' },
            { text: 'Bootcamp', link: '/event/monad101/bootcamp' }, ]
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
    ]
  }
})
