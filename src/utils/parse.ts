import { truncate } from "lodash";
import { CommitLogObject } from "./commits";
import * as T from "../../typings/tutorial";

type TutorialFrame = {
  summary: T.TutorialSummary;
  levels: {
    [levelKey: string]: T.Level;
  };
  steps: { [stepKey: string]: Partial<T.Step> };
};

export function parseMdContent(md: string): TutorialFrame | never {
  let start: number = -1;
  const parts: any[] = [];

  const lines = md.split("\n");

  // Split the multiple parts - This way enables the creator to use 4/5 level headers inside the content.
  lines.forEach((line, index) => {
    if (line.match(/#{1,3}\s/) || index === lines.length - 1) {
      if (start !== -1) {
        parts.push(lines.slice(start, index).join("\n"));
        start = index;
      } else {
        start = index;
      }
    }
  });

  const mdContent: TutorialFrame = {
    summary: {
      title: "",
      description: "",
    },
    levels: {},
    steps: {},
  };

  // Capture summary
  const summaryMatch = parts
    .shift()
    .match(/^#\s(?<tutorialTitle>.*)[\n\r]+(?<tutorialDescription>[^]*)/);
  if (summaryMatch.groups.tutorialTitle) {
    mdContent.summary.title = summaryMatch.groups.tutorialTitle.trim();
  }

  if (summaryMatch.groups.tutorialDescription) {
    mdContent.summary.description = summaryMatch.groups.tutorialDescription.trim();
  }

  // Identify each part of the content
  parts.forEach((section: string) => {
    // match level
    const levelRegex = /^(##\s(?<levelId>L\d+)\s(?<levelTitle>.*)[\n\r]*(>\s*(?<levelSummary>.*))?[\n\r]+(?<levelContent>[^]*))/;
    const levelMatch: RegExpMatchArray | null = section.match(levelRegex);
    if (levelMatch && levelMatch.groups) {
      const {
        levelId,
        levelTitle,
        levelSummary,
        levelContent,
      } = levelMatch.groups;

      // @ts-ignore
      mdContent.levels[levelId] = {
        id: levelId,
        title: levelTitle.trim(),
        summary: levelSummary
          ? levelSummary.trim()
          : truncate(levelContent.trim(), { length: 80, omission: "..." }),
        content: levelContent.trim(),
      };
    } else {
      // match step
      const stepRegex = /^(###\s(?<stepId>(?<levelId>L\d+)S\d+)\s(?<stepTitle>.*)[\n\r]+(?<stepContent>[^]*))/;
      const stepMatch: RegExpMatchArray | null = section.match(stepRegex);
      if (stepMatch && stepMatch.groups) {
        const { stepId, stepContent } = stepMatch.groups;
        mdContent.steps[stepId] = {
          id: stepId,
          content: stepContent.trim(),
        };
      }
    }
  });

  return mdContent;
}

type ParseParams = {
  text: string;
  skeleton: Partial<T.Tutorial | any>;
  commits: CommitLogObject;
};

export function parse(params: ParseParams): any {
  const mdContent: TutorialFrame = parseMdContent(params.text);

  const parsed: Partial<T.Tutorial> = {
    version: params.skeleton.version,
    summary: mdContent.summary,
    config: params.skeleton.config || {},
    levels: [],
  };

  // add init commits
  if (params.commits.INIT && params.commits.INIT.length) {
    // @ts-ignore
    parsed.config.testRunner.setup = {
      ...(parsed.config?.testRunner?.setup || {}),
      commits: params.commits.INIT,
    };
  }

  // merge content and tutorial
  if (params.skeleton.levels && params.skeleton.levels.length) {
    parsed.levels = params.skeleton.levels
      .map((level: T.Level, levelIndex: number) => {
        const levelContent = mdContent.levels[level.id];

        if (!levelContent) {
          return null;
        }

        level = { ...level, ...levelContent };

        // add level setup commits
        const levelSetupKey = level.id;
        if (params.commits[levelSetupKey]) {
          level.setup = {
            ...(level.setup || {}),
            commits: params.commits[levelSetupKey],
          };
        }

        // add level step commits
        level.steps = (level.steps || []).map(
          (step: T.Step, stepIndex: number) => {
            const stepKey = `${levelSetupKey}S${stepIndex + 1}`;
            const stepSetupKey = `${stepKey}Q`;
            if (params.commits[stepSetupKey]) {
              if (!step.setup) {
                step.setup = {
                  commits: [],
                };
              }
              step.setup.commits = params.commits[stepSetupKey];
            }

            const stepSolutionKey = `${stepKey}A`;
            if (params.commits[stepSolutionKey]) {
              if (!step.solution) {
                step.solution = {
                  commits: [],
                };
              }
              step.solution.commits = params.commits[stepSolutionKey];
            }

            // add markdown
            const stepMarkdown: Partial<T.Step> = mdContent.steps[step.id];
            if (stepMarkdown) {
              step = { ...step, ...stepMarkdown };
            }

            step.id = `${stepKey}`;
            return step;
          }
        );

        return level;
      })
      .filter((l: T.Level | null) => !!l);
  }

  return parsed;
}
