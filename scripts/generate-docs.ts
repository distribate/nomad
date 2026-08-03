import { Project } from "ts-morph";
import fs from "node:fs";

const project = new Project({
  tsConfigFilePath: "./tsconfig.app.json"
});

const result: string[] = [];
result.push("# Debug API\n");

for (const file of project.getSourceFiles("src/**/*.ts")) {
  for (const fn of file.getFunctions()) {
    const docs = fn.getJsDocs();

    if (!docs.length) continue;

    const tags = docs[0].getTags();

    const isDebug = tags.some(
      tag => [
        "featureFlag",
        "debugAction",
        "debugQuery"
      ].includes(tag.getTagName())
    );

    if (!isDebug) continue;

    const description = docs[0]
      .getDescription()
      .trim();

    result.push(
      `## ${fn.getName()}()\n`
    );

    result.push(
      `${description}\n`
    );

    for (const param of fn.getParameters()) {
      const tag = docs[0]
        .getTags()
        .find(
          t =>
            t.getTagName() === "param" &&
            t.getCommentText()
              ?.includes(param.getName())
        );

      result.push(
        `- **${param.getName()}**: ${param.getType().getText()}`
      );

      if (tag) {
        result.push(
          ` — ${tag.getCommentText()}`
        );
      }

      result.push("\n");
    }
  }
}

fs.writeFileSync(
  "docs/debug-api.md",
  result.join("\n")
);
