import { truncate } from "lodash";
import { CommitLogObject } from "./commits";
import * as T from "../../typings/tutorial";

type TutorialFrame = {
  summary: T.TutorialSummary;
  levels: T.Level[];
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
    levels: [],
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

  let current = { levelId: "", levelIndex: -1, stepIndex: -1 };
  // Identify each part of the content
  parts.forEach((section: string) => {
    // match level
    const levelRegex = /^(#{2}\s(?<levelId>L?\d+\.?)\s(?<levelTitle>.*)[\n\r]*(>\s(?<levelSummary>.*))?[\n\r]+(?<levelContent>[^]*))/;
    const levelMatch: RegExpMatchArray | null = section.match(levelRegex);

    if (levelMatch && levelMatch.groups) {
      const levelId = levelMatch.groups.levelId.replace(".", "");
      current = {
        levelId: levelId,
        levelIndex: current.levelIndex + 1,
        stepIndex: -1,
      };
      const { levelTitle, levelSummary, levelContent } = levelMatch.groups;

      // @ts-ignore
      mdContent.levels[current.levelIndex] = {
        id: levelId,
        title: levelTitle.trim(),
        summary:
          levelSummary && levelSummary.trim().length
            ? levelSummary.trim()
            : truncate(levelContent.split(/[\n\r]+/)[0].trim(), {
                length: 80,
                omission: "...",
              }),
        content: levelContent.trim(),
        steps: [],
      };
    } else {
      // match step
      const stepRegex = /^(#{3}\s(?<stepTitle>.*)[\n\r]+(?<stepContent>[^]*))/;
      const stepMatch: RegExpMatchArray | null = section.match(stepRegex);
      if (stepMatch && stepMatch.groups) {
        current = {
          levelId: current.levelId,
          levelIndex: current.levelIndex,
          stepIndex: current.stepIndex + 1,
        };
        const { stepId, stepContent } = stepMatch.groups;
        mdContent.levels[current.levelIndex].steps[current.stepIndex] = {
          id: `${current.levelId}.${current.stepIndex + 1}`,
          content: stepContent.trim(),
        };
      } else {
        // parse hints from stepContent
        const hintDetectRegex = /^(#{4}\sHINTS[\n\r]+([\*|\-]\s(?<hintContent>[^]*))[\n\r]+)+/;
        const hintMatch = section.match(hintDetectRegex);
        if (!!hintMatch) {
          const hintItemRegex = /[\n\r]+[\*|\-]\s/;
          const hints = section
            .split(hintItemRegex)
            .slice(1) // remove #### HINTS
            .map((h) => h.trim());
          if (hints.length) {
            mdContent.levels[current.levelIndex].steps[
              current.stepIndex
            ].hints = hints;
          }
        }
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

  // merge content levels and tutorial

  parsed.levels = mdContent.levels.map(
    (mdLevel: T.Level, mdLevelIndex: number) => {
      // add level setup commits
      let level: T.Level = { ...mdLevel };

      const configLevel = params.skeleton.levels[mdLevelIndex];

      if (configLevel) {
        // add level step commits
        const { steps, ...configLevelProps } = configLevel;
        level = { ...configLevelProps, ...level };

        if (steps) {
          steps.forEach((step: T.Step, index: number) => {
            try {
              const mdStep = level.steps[index];

              step = {
                ...step,
                ...mdStep,
              };

              const stepSetupKey = `${step.id}:T`;

              if (!step?.setup) {
                step.setup = {};
              }
              if (!step.setup.commits) {
                step.setup.commits = [];
              }
              if (params.commits[stepSetupKey]) {
                step.setup.commits = params.commits[stepSetupKey];
              }

              const stepSolutionKey = `${step.id}:S`;
              if (params.commits[stepSolutionKey]) {
                if (!step.solution) {
                  step.solution = {
                    commits: [],
                  };
                }
                step.solution.commits = params.commits[stepSolutionKey];
              }
            } catch (error) {
              console.error("Error parsing level steps");
              console.warn(JSON.stringify(level.steps));
              console.error(error.message);
            }
            // update level step
            level.steps[index] = step;
          });
        }
      }

      if (params.commits[level.id]) {
        if (!level.setup) {
          level.setup = {};
        }
        level.setup.commits = params.commits[level.id];
      }

      // @deprecated L1 system
      if (params.commits[`L${level.id}`]) {
        if (!level.setup) {
          level.setup = {};
        }
        level.setup.commits = params.commits[`L${level.id}`];
      }

      return level;
    }
  );

  return parsed;
}
