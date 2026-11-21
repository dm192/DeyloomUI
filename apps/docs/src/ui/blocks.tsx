import type * as React from "react";
import type { DemoEntry, DemoExample, DemoProp } from "../demos/types";

export function PageHeader(props: {
  kicker?: string;
  title: string;
  summary?: string;
}) {
  return (
    <header className="page-head">
      {props.kicker ? <p className="page-head__kicker">{props.kicker}</p> : null}
      <h1 className="page-head__title">{props.title}</h1>
      {props.summary ? <p className="page-head__summary">{props.summary}</p> : null}
    </header>
  );
}

export function Section(props: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section__title">{props.title}</h2>
        {props.hint ? <p className="section__hint">{props.hint}</p> : null}
      </div>
      {props.children}
    </section>
  );
}

/** A live example on a surface, the only container demo code is rendered into. */
export function Canvas(props: { example: DemoExample }) {
  const { example } = props;
  return (
    <figure className="canvas">
      <figcaption className="canvas__caption">
        <span className="canvas__title">{example.title}</span>
        {example.description ? <span className="canvas__desc">{example.description}</span> : null}
      </figcaption>
      <div
        className={`canvas__stage canvas__stage--${example.layout ?? "start"}`}
        data-surface={example.surface ?? "surface"}
      >
        {example.render()}
      </div>
    </figure>
  );
}

export function ComponentDemos(props: { demo: DemoEntry }) {
  return (
    <div className="demos">
      {props.demo.examples.map((example) => (
        <Canvas key={example.title} example={example} />
      ))}
    </div>
  );
}

export function PropsTable(props: { rows: DemoProp[] }) {
  return (
    <div className="props-table-wrap dl-scrollbar">
      <table className="props-table">
        <thead>
          <tr>
            <th scope="col">属性</th>
            <th scope="col">类型</th>
            <th scope="col">默认值</th>
            <th scope="col">说明</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>
                <code className="props-table__type">{row.type}</code>
              </td>
              <td>{row.default ?? "—"}</td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
