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
              { text: '规范总览', link: '/specs/' },
              { text: '00 工程基座', link: '/specs/00-foundation/spec' },
              { text: '01 租户与身份', link: '/specs/01-tenant-auth/spec' },
              // 其余功能域：域开工 propose 后由同步脚本生成副本，届时在此追加
            ],
          },
          {
            text: '技术方案',
            collapsed: true,
            items: [
              { text: '方案总览', link: '/plans/' },
              { text: '00 工程基座', link: '/plans/00-foundation/plan' },
              { text: '01 租户与身份', link: '/plans/01-tenant-auth/plan' },
            ],
          },
          {
            text: '工程',
            collapsed: true,
            items: [
              { text: '任务清单', link: '/tasks/' },
              { text: '00 基座任务（T-00-xxx）', link: '/tasks/00-foundation/tasks' },
              { text: '01 租户身份任务（T-01-xxx）', link: '/tasks/01-tenant-auth/tasks' },
              { text: '变更提案', link: '/changes/' },
              { text: '架构决策', link: '/architecture/' },
            ],
          },
          {
            text: '参考资料',
            collapsed: true,
            items: [
              { text: 'OpenSpec × TDD 指南', link: '/references/openspec-tdd-guide' },
              { text: 'frp-farm 项目经验', link: '/references/frp-farm-项目经验总结' },
              { text: '桃子系统项目经验', link: '/references/taoziguanli-项目经验总结' },
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