import { Card } from "@deyloom/react";
import { demoGroups, demoBySlug } from "../demos";
import { ComponentDemos, PageHeader, PropsTable, Section } from "../ui/blocks";

export function ComponentsIndexPage() {
  return (
    <>
      <PageHeader
        kicker="Components"
        title="组件"
        summary="每个组件都遵守同一套交互契约：统一按压弹簧、统一聚焦光圈、统一进出场编排。"
      />
      {demoGroups.map((group) =>
        group.demos.length === 0 ? null : (
          <Section key={group.id} title={group.label}>
            <div className="component-grid">
              {group.demos.map((demo) => (
                <a className="component-card" key={demo.slug} href={`#/components/${demo.slug}`}>
                  <Card interactive className="component-card__surface">
                    <span className="component-card__title">{demo.title}</span>
                    <span className="component-card__summary">{demo.summary}</span>
                  </Card>
                </a>
              ))}
            </div>
          </Section>
        ),
      )}
    </>
  );
}

export function ComponentPage({ slug }: { slug: string }) {
  const demo = demoBySlug.get(slug);

  if (!demo) {
    return (
      <div className="empty-state">
        没有这个组件：<code>{slug}</code>。<a href="#/components">返回组件列表</a>
      </div>
    );
  }

  const groupLabel =
    demoGroups.find((group) => group.id === demo.group)?.label ?? demo.group;

  return (
    <>
      <PageHeader kicker={groupLabel} title={demo.title} summary={demo.summary} />
      <ComponentDemos demo={demo} />

      {demo.props && demo.props.length > 0 ? (
        <Section title="API">
          <PropsTable rows={demo.props} />
        </Section>
      ) : null}

      {demo.notes && demo.notes.length > 0 ? (
        <ul className="notes">
          {demo.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
