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
  config: T.Tutorial;
  commits: CommitLogObject;
};

export function parse(params: ParseParams): T.Tutorial {
  const parsed = { ...params.config };

  const mdContent: TutorialFrame = parseMdContent(params.text);

  // Add the summary to the tutorial file
  parsed["summary"] = mdContent.summary;

  // merge content and tutorial
  if (parsed.levels) {
    parsed.levels.forEach((level: T.Level, levelIndex: number) => {
      const levelContent = mdContent[level.id];
      if (!levelContent) {
        console.log(`Markdown content not found for ${level.id}`);
        return;
      }
      const { steps, ...content } = levelContent;

      if (steps) {
        steps.forEach((step: T.Step, stepIndex: number) => {
          return _.merge(step, steps[step.id]);
        });
      }

      _.merge(level, content);
    });
  }

  return parsed;
}

/*
// Add the content and git hash to the tutorial
      if (matches.groups.stepId) {
        // If it's a step: add the content and the setup/solution hashes depending on the type
        const level: T.Level | null =
          tutorial.levels.find(
            (level: T.Level) => level.id === matches.groups.levelId
          ) || null;
        if (!level) {
          console.log(`Level ${matches.groups.levelId} not found`);
        } else {
          const theStep: T.Step | null =
            level.steps.find(
              (step: T.Step) => step.id === matches.groups.stepId
            ) || null;

          if (!theStep) {
            console.log(`Step ${matches.groups.stepId} not found`);
          } else {
            if (matches.groups.stepType === "Q") {
              theStep.setup.commits.push(commit.hash.substr(0, 7));
            } else if (
              matches.groups.stepType === "A" &&
              theStep.solution &&
              theStep.solution.commits
            ) {
              theStep.solution.commits.push(commit.hash.substr(0, 7));
            }
          }
        }
      } else {
        // If it's level: add the commit hash (if the level has the commit key) and the content to the tutorial
        const theLevel: T.Level | null =
          tutorial.levels.find(
            (level: T.Level) => level.id === matches.groups.levelId
          ) || null;

        if (!theLevel) {
          console.log(`Level ${matches.groups.levelId} not found`);
        } else {
          if (_.has(theLevel, "tutorial.commits")) {
            if (theLevel.setup) {
              theLevel.setup.commits.push(commit.hash.substr(0, 7));
            }
          }
        }
      }
    }
*/
