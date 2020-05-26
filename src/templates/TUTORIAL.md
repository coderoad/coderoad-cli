## Insert Tutorial's Title here

> Short description to be shown as a tutorial's subtitle


## L1 Put Level's title here

> Level's summary: a short description of the level's content in one line.

The level is identified and distributed following the regex: 

```js
/^(##\s(?<levelId>L\d+)\s(?<levelTitle>.*)\n*(>\s*(?<levelSummary>.*))?\n+(?<levelContent>[^]*))/
```

The Level can be split into steps or have no steps. Levels without steps are meant to be used as only informative content, for example: use a Level without steps at the end of the tutorial to congratulate the student and provide some additional related resources.

Tutorial's content. It can span through multiple paragraphs and use headers `####` and `#####`. 

Steps are identified and their content described using the following regex:

```js
/^(###\s(?<stepId>(?<levelId>L\d+)S\d+)\s(?<stepTitle>.*)\n+(?<stepContent>[^]*))/
```

The numbers identifying the levels and steps are irrelevant but keep in mind that they will be executed in order. A level with id `10` will be executed before another one with id `20` and so on. These `ids` should have a match in the configuration file (`coderoad.yaml`).


### L1S1 A step title (not being shown on the extension at this moment)

Short description of the step's purpose. Should be short and fit in one line

**Important**
1. Both level and step ids must have an entry with the same id on the configuration file;
2. Step Ids are based on its level id. Any step from level `L234` must start with `L234S`, followed by the sequential digits.


### L1S2 Another step

Step's short description.