export type Maybe<T> = T | null

export type ConfigReset = {
  command?: string
}

export type TutorialConfig = {
  appVersions?: TutorialAppVersions
  testRunner: TestRunnerConfig
  repo: TutorialRepo
  dependencies?: TutorialDependency[]
  reset?: ConfigReset
  setup?: StepActions
}

/** Logical groupings of tasks */
export type Level = {
  id: string
  title: string
  /** A summary of the level */
  summary: string
  /** The lesson content of the level, parsed as markdown */
  content: string
  /** Actions run on level start up for configuring setup */
  setup?: Maybe<StepActions>
  /** A set of tasks for users linked to unit tests */
  steps: Array<Step>
}

/** A level task */
export type Step = {
  id: string
  content: string
  setup?: StepActions
  solution?: Maybe<StepActions>
  subtasks?: string[]
  hints?: string[]
}

/** A tutorial for use in VSCode CodeRoad */
export type Tutorial = {
  id: string
  version: string
  summary: TutorialSummary
  config: TutorialConfig
  levels: Array<Level>
}

/** Summary of tutorial used when selecting tutorial */
export type TutorialSummary = {
  title: string
  description: string
}

export type StepActions = {
  commands?: string[]
  commits?: string[]
  files?: string[]
  watchers?: string[]
  filter?: string
  subtasks?: string[]
}

export interface TestRunnerArgs {
  filter?: string
  tap: string
}

export interface TestRunnerConfig {
  command: string
  args: TestRunnerArgs
  directory?: string
}

export interface TutorialRepo {
  uri: string
  branch: string
}

export interface TutorialDependency {
  name: string
  version: string
  message?: string
}

export interface TutorialAppVersions {
  vscode: string
}

export interface TutorialSkeleton {
  config: TutorialConfig
  levels: Level[]
}
