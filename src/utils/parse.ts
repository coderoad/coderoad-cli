import * as _ from "lodash";
import { CommitLogObject } from "./commits";
import * as T from "../../typings/tutorial";

type TutorialFrame = {
  summary: T.TutorialSummary;
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

  const sections = {};

  // Identify and remove the header
  const summaryMatch = parts
    .shift()
    .match(/^#\s(?<tutorialTitle>.*)[\n\r]+(?<tutorialDescription>[^]*)/);

  if (!summaryMatch.groups.tutorialTitle) {
    throw new Error("Missing tutorial title");
  }

  if (!summaryMatch.groups.tutorialDescription) {
    throw new Error("Missing tutorial summary description");
  }

  sections["summary"] = {
    title: summaryMatch.groups.tutorialTitle.trim(),
    description: summaryMatch.groups.tutorialDescription.trim(),
  };

  // Identify each part of the content
  parts.forEach((section) => {
    const levelRegex = /^(##\s(?<levelId>L\d+)\s(?<levelTitle>.*)[\n\r]*(>\s*(?<levelSummary>.*))?[\n\r]+(?<levelContent>[^]*))/;
    const stepRegex = /^(###\s(?<stepId>(?<levelId>L\d+)S\d+)\s(?<stepTitle>.*)[\n\r]+(?<stepContent>[^]*))/;

    const levelMatch = section.match(levelRegex);
    const stepMatch = section.match(stepRegex);

    if (levelMatch) {
      const {
        levelId,
        levelTitle,
        levelSummary,
        levelContent,
      } = levelMatch.groups;
      const level = {
        [levelId]: {
          id: levelId,
          title: levelTitle,
          summary: levelSummary
            ? levelSummary.trim()
            : _.truncate(levelContent, { length: 80, omission: "..." }),
          content: levelContent.trim(),
        },
      };

      _.merge(sections, level);
    } else if (stepMatch) {
      const step = {
        [stepMatch.groups.levelId]: {
          steps: {
            [stepMatch.groups.stepId]: {
              id: stepMatch.groups.stepId,
              // title: stepMatch.groups.stepTitle, //Not using at this momemnt
              content: stepMatch.groups.stepContent.trim(),
            },
          },
        },
      };

      _.merge(sections, step);
    }
  });

  // @ts-ignore
  return sections;
}

type ParseParams = {
  text: string;
  config: Partial<T.Tutorial | any>;
  commits: CommitLogObject;
};

export function parse(params: ParseParams): any {
  const parsed = { ...params.config };

  const mdContent: TutorialFrame = parseMdContent(params.text);

  // Add the summary to the tutorial file
  parsed["summary"] = mdContent.summary;

  // merge content and tutorial
  if (parsed.levels) {
    parsed.levels.forEach((level: T.Level, levelIndex: number) => {
      const levelContent = mdContent[level.id];
      console.log(levelContent);
      if (!levelContent) {
        console.log(`Markdown content not found for ${level.id}`);
        return;
      }

      // add level setup commits
      const levelSetupKey = `L${levelIndex + 1}S`;
      if (params.commits[levelSetupKey]) {
        if (!level.setup) {
          level.setup = {
            commits: [],
          };
        }
        level.setup.commits = params.commits[levelSetupKey];
      }

      // add level step commits
      if (levelContent.steps) {
        levelContent.steps.forEach((step: T.Step, stepIndex: number) => {
          const stepSetupKey = `${levelSetupKey}S${stepIndex + `1`}Q`;
          if (params.commits[stepSetupKey]) {
            if (!step.setup) {
              step.setup = {
                commits: [],
              };
            }
            step.setup.commits = params.commits[stepSetupKey];
          }

          const stepSolutionKey = `${levelSetupKey}S${stepIndex + `1`}A`;
          if (params.commits[stepSolutionKey]) {
            if (!step.solution) {
              step.solution = {
                commits: [],
              };
            }
            step.solution.commits = params.commits[stepSolutionKey];
          }

          return _.merge(step, levelContent.steps[step.id]);
        });
      }

      _.merge(level);
    });
  }

  return parsed;
}
