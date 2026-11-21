import { Card } from "@deyloom/react";
import { PageHeader, Section } from "../ui/blocks";

const REPO = "https://github.com/dm192/DeyloomUI";

const THIRD_PARTY = [
  { name: "radix-ui", license: "MIT", usage: "无障碍、键盘与浮层基元" },
  { name: "motion (framer-motion)", license: "MIT", usage: "弹簧与进出场动画" },
  { name: "clsx", license: "MIT", usage: "className 合并" },
  { name: "@heroicons/react", license: "MIT", usage: "文档站图标（仅文档站）" },
  { name: "Inter（@fontsource）", license: "SIL OFL 1.1", usage: "文档站字体（仅文档站）" },
  { name: "React", license: "MIT", usage: "运行时依赖" },
];

const ALLOWED = [
  "在技术栈、README、官网、幻灯片或作品集中如实声明使用了 Deyloom。",
  "使用官方图标做署名，例如 Built with Deyloom、Design by Deyloom。",
  "教程、博客、评测中引用截图与 Logo，并注明来源。",
];

const FORBIDDEN = [
  "把 Deyloom 的名称、Logo 或图标当作自己的产品/公司品牌。",
  "修改、拉伸、改色、旋转或重绘品牌资产。",
  "用品牌资产暗示 Deyloom 官方认可或背书。",
  "把品牌资产当作图标库或素材包单独分发。",
];

export function LicensePage() {
  return (
    <>
      <PageHeader
        kicker="License"
        title="许可"
        summary="代码以 MIT 发布，个人与企业都可自由使用；但名称、Logo、图标与字标不在 MIT 范围内。"
      />

      <Section title="代码：MIT" hint="个人、企业、商业项目均可使用、修改、分发与再许可。">
        <p className="inline-note" style={{ marginTop: 0 }}>
          只需保留版权与许可声明。完整文本见仓库{" "}
          <a href={`${REPO}/blob/main/LICENSE`} target="_blank" rel="noreferrer">
            LICENSE
          </a>
          。
        </p>
        <pre className="codeblock dl-scrollbar">
          <code>{`MIT License · Copyright (c) 2026 Deyloom contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software ...`}</code>
        </pre>
      </Section>

      <Section
        title="品牌资产：保留权利"
        hint="brand/ 下的 SVG 与 Deyloom 名称不属于 MIT 许可范围。"
      >
        <div className="license-grid">
          <Card className="license-card">
            <h3 className="license-card__title">允许</h3>
            <ul className="notes license-card__list">
              {ALLOWED.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
          <Card className="license-card">
            <h3 className="license-card__title">不允许</h3>
            <ul className="notes license-card__list">
              {FORBIDDEN.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="attribution-example" aria-label="署名示例">
          <img src="/deyloom-icon.svg" alt="" width={18} height={18} />
          <span>
            Design by{" "}
            <a href={REPO} target="_blank" rel="noreferrer">
              Deyloom
            </a>
          </span>
        </div>
        <p className="inline-note">
          完整说明见{" "}
          <a href={`${REPO}/blob/main/TRADEMARK.md`} target="_blank" rel="noreferrer">
            TRADEMARK.md
          </a>
          ；商业发行版内嵌品牌资产请先在仓库 issue 说明用途。
        </p>
      </Section>

      <Section title="第三方依赖" hint="以下为运行时与文档站使用的主要开源依赖及其许可。">
        <div className="props-table-wrap dl-scrollbar">
          <table className="props-table">
            <thead>
              <tr>
                <th scope="col">依赖</th>
                <th scope="col">许可</th>
                <th scope="col">用途</th>
              </tr>
            </thead>
            <tbody>
              {THIRD_PARTY.map((item) => (
                <tr key={item.name}>
                  <td>
                    <code>{item.name}</code>
                  </td>
                  <td>{item.license}</td>
                  <td>{item.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
