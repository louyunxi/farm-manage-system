import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: 'farm-manage-system',
    description: '农场管理系统 — 需求规范与架构文档',
    lang: 'zh-CN',
    lastUpdated: true,
    cleanUrls: true,

    themeConfig: {
      nav: [
        { text: '宪法', link: '/constitution' },
        { text: '路线图', link: '/roadmap' },
        { text: '功能规范', link: '/specs/' },
      ],

      sidebar: {
        '/': [
          {
            text: '概述',
            items: [
              { text: '文档中心', link: '/' },
              { text: '项目宪法', link: '/constitution' },
              { text: '开发路线图', link: '/roadmap' },
            ],
          },
          {
            text: '功能规范',
            collapsed: false,
            items: [
              // 待各功能域 spec 落定后逐项取消注释
              // { text: '01-租户与身份', link: '/specs/01-租户身份/spec' },
              // { text: '02-农场资源',   link: '/specs/02-农场资源/spec' },
              // { text: '03-种植生产',   link: '/specs/03-种植生产/spec' },
              // { text: '04-采收与产后', link: '/specs/04-采收与产后/spec' },
              // { text: '05-投入品库存', link: '/specs/05-投入品库存/spec' },
              // { text: '06-质量安全',   link: '/specs/06-质量安全/spec' },
              // { text: '07-溯源展示',   link: '/specs/07-溯源展示/spec' },
              // { text: '08-基础数据',   link: '/specs/08-基础数据/spec' },
              // { text: '09-设备接入',   link: '/specs/09-设备接入/spec' },
              // { text: '10-AI智能体',   link: '/specs/10-AI智能体/spec' },
            ],
          },
          {
            text: '技术方案',
            collapsed: true,
            items: [
              // 待功能域确认后逐项补充
            ],
          },
          {
            text: '工程',
            collapsed: true,
            items: [
              { text: '变更提案', link: '/changes/' },
              { text: '架构决策', link: '/architecture/' },
            ],
          },
        ],
      },

      socialLinks: [
        { icon: 'github', link: 'https://github.com' },
      ],

      search: {
        provider: 'local',
      },
    },
  })
)