#!/usr/bin/env node
/**
 * sync-openspec-docs.mjs
 * 把 openspec 权威层产物同步为 docs 人类浏览层副本（宪法 5.5「双表达一致性」的自动化）。
 *
 * 同步规则：
 *   active change（openspec/changes/<NN-slug>/）
 *     - specs/<capability>/spec.md -> docs/specs/<NN-slug>/spec.md
 *     - design.md                  -> docs/plans/<NN-slug>/plan.md
 *     - tasks.md                   -> docs/tasks/<NN-slug>/tasks.md
 *   已归档规格（openspec/specs/<capability>/spec.md）优先于 active change 的 spec
 *     （归档后 specs 是权威最终版）。
 *
 * 使用时机：openspec propose 之后、apply 打勾进度更新后、archive 之后各跑一次。
 * 副本由脚本生成，禁止手改（AGENTS.md 3.1-3.3）。
 *
 * 运行：node scripts/sync-openspec-docs.mjs
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const CHANGES_DIR = join(ROOT, 'openspec', 'changes')
const SPECS_DIR = join(ROOT, 'openspec', 'specs')
const DOCS = {
  spec: join(ROOT, 'docs', 'specs'),
  plan: join(ROOT, 'docs', 'plans'),
  task: join(ROOT, 'docs', 'tasks'),
}

// 域编号 -> 中文显示名（新增功能域时在此登记，与 roadmap 功能域总览一致）
const DOMAIN_NAMES = {
  '00-foundation': '00 工程基座',
  '01-tenant-auth': '01 租户与身份',
  '02-farm-resource': '02 农场资源',
  '03-planting-production': '03 种植生产',
  '04-harvest': '04 采收与产后',
  '05-input-inventory': '05 投入品库存',
  '06-quality-safety': '06 质量安全',
  '07-traceability': '07 溯源展示',
  '08-base-data': '08 基础数据',
  '09-device-integration': '09 设备接入',
  '10-ai-agent': '10 AI 智能体',
}

const domainName = (slug) => DOMAIN_NAMES[slug] ?? slug
const withFrontmatter = (title, body) => `---\ntitle: ${title}\n---\n\n${body}`
const written = []

function writeCopy(targetPath, title, sourcePath) {
  const body = readFileSync(sourcePath, 'utf8')
  mkdirSync(dirname(targetPath), { recursive: true })
  writeFileSync(targetPath, withFrontmatter(title, body))
  written.push(targetPath.slice(ROOT.length + 1))
}

// 1) active change 三件套
if (existsSync(CHANGES_DIR)) {
  for (const slug of readdirSync(CHANGES_DIR)) {
    const changeDir = join(CHANGES_DIR, slug)
    if (slug === 'archive' || !existsSync(join(changeDir, '.openspec.yaml'))) continue

    // spec：可能有多 capability 子目录，取第一个
    const specsDir = join(changeDir, 'specs')
    if (existsSync(specsDir)) {
      for (const cap of readdirSync(specsDir)) {
        const specFile = join(specsDir, cap, 'spec.md')
        if (existsSync(specFile)) {
          writeCopy(
            join(DOCS.spec, slug, 'spec.md'),
            `${domainName(slug)} · 功能规范`,
            specFile,
          )
        }
      }
    }
    const design = join(changeDir, 'design.md')
    if (existsSync(design)) {
      writeCopy(join(DOCS.plan, slug, 'plan.md'), `${domainName(slug)} · 技术方案`, design)
    }
    const tasks = join(changeDir, 'tasks.md')
    if (existsSync(tasks)) {
      writeCopy(join(DOCS.task, slug, 'tasks.md'), `${domainName(slug)} · 任务清单`, tasks)
    }
  }
}

// 2) 已归档规格覆盖 spec 副本（归档后 openspec/specs 是权威最终版）
if (existsSync(SPECS_DIR)) {
  const specCopies = new Map() // capability -> docs 副本路径（来自 active change 的写入记录）
  if (existsSync(CHANGES_DIR)) {
    for (const slug of readdirSync(CHANGES_DIR)) {
      const specsDir = join(CHANGES_DIR, slug, 'specs')
      if (!existsSync(specsDir)) continue
      for (const cap of readdirSync(specsDir)) specCopies.set(cap, join(DOCS.spec, slug, 'spec.md'))
    }
  }
  for (const cap of readdirSync(SPECS_DIR)) {
    const specFile = join(SPECS_DIR, cap, 'spec.md')
    const target = specCopies.get(cap)
    if (existsSync(specFile) && target) {
      // 用归档版（去掉 delta 标记的最终规格）覆盖
      const body = readFileSync(specFile, 'utf8').replace(/^## ADDED Requirements/m, '## Requirements')
      writeFileSync(target, withFrontmatter(readFileSync(target, 'utf8').split('\n')[1].replace(/^title: /, ''), body))
      written.push(target.slice(ROOT.length + 1) + ' (archived)')
    }
  }
}

console.log(written.length ? written.map((w) => `  ✓ ${w}`).join('\n') : '  (nothing to sync)')
console.log(`\nsynced ${written.length} file(s).`)
if (written.length) {
  console.log('提醒：新增/移除域目录后，请同步更新 docs/.vitepress/config.ts 侧边栏与各 index.md。')
}
