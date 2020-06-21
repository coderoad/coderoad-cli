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

  let current = { level: -1, step: 0 };
  // Identify each part of the content
  parts.forEach((section: string) => {
    // match level
    const levelRegex = /^(#{2}\s(?<levelId>L?\d+\.?)\s(?<levelTitle>.*)[\n\r]*(>\s(?<levelSummary>.*))?[\n\r]+(?<levelContent>[^]*))/;
    const levelMatch: RegExpMatchArray | null = section.match(levelRegex);

    if (levelMatch && levelMatch.groups) {
      current = { level: current.level + 1, step: 0 };
      const { levelTitle, levelSummary, levelContent } = levelMatch.groups;

      // @ts-ignore
      mdContent.levels[current.level] = {
        id: (current.level + 1).toString(),
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
      const stepRegex = /^(#{3}\s\(?<stepTitle>.*)[\n\r]+(?<stepContent>[^]*)/;
      const stepMatch: RegExpMatchArray | null = section.match(stepRegex);
      if (stepMatch && stepMatch.groups) {
        const { stepId, stepContent } = stepMatch.groups;
        mdContent.levels[current.level].steps[current.step] = {
          id: stepId,
          content: stepContent.trim(),
          setup: {},
          solution: {},
        };
        current = { ...current, step: current.step + 1 };
      } else {
        // parse hints from stepContent
        const hintDetectRegex = /^(#{4}\sHINTS[\n\r]+(\*\s(?<hintContent>[^]*))[\n\r]+)+/;
        const hintMatch = section.match(hintDetectRegex);
        if (!!hintMatch) {
          const hintItemRegex = /[\n\r]+\*\s/;
          const hints = section
            .split(hintItemRegex)
            .slice(1) // remove #### HINTS
            .map((h) => h.trim());
          if (hints.length) {
            mdContent.levels[current.level].steps[current.step].hints = hints;
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

  parsed.levels = mdContent.levels.map((level: T.Level, levelIndex: number) => {
    // add level setup commits
    const levelId = level.id;
    if (params.commits[levelId]) {
      if (!level.setup) {
        level.setup = {};
      }
      level.setup.commits = params.commits[levelId];
    }

    // get yaml for level
    const configLevel = params.skeleton.levels.find(
      (l: Partial<T.Level>) => l.id === levelId
    );

    let configSteps = {};
    if (configLevel) {
      const { steps, ...configLevelProps } = configLevel;
      level = { ...configLevelProps, ...level };
      if (steps) {
        steps.forEach((s: T.Step) => {
          configSteps[s.id] = s;
        });
      }
    }

    // add level step commits
    // try {
    //   level.steps = (level.steps || []).map(
    //     (step: T.Step, stepIndex: number) => {
    //       const stepKey = `${levelId}S${stepIndex + 1}`;
    //       const stepSetupKey = `${stepKey}Q`;
    //       if (params.commits[stepSetupKey]) {
    //         if (!step.setup) {
    //           step.setup = {
    //             commits: [],
    //           };
    //         }
    //         step.setup.commits = params.commits[stepSetupKey];
    //       }

    //       const stepSolutionKey = `${stepKey}A`;
    //       if (params.commits[stepSolutionKey]) {
    //         if (!step.solution) {
    //           step.solution = {
    //             commits: [],
    //           };
    //         }
    //         step.solution.commits = params.commits[stepSolutionKey];
    //       }

    //       // add markdown
    //       const stepMarkdown: Partial<T.Step> =
    //         mdContent.levels[level.id].steps[step.id];
    //       if (stepMarkdown) {
    //         step = { ...step, ...stepMarkdown };
    //       }

    //       step.id = `${stepKey}`;
    //       return step;
    //     }
    //   );
    // } catch (error) {
    //   console.log(JSON.stringify(level.steps));
    //   console.error("Error parsing level steps");
    //   console.error(error.message);
    // }

    return level;
  });

  return parsed;
}
