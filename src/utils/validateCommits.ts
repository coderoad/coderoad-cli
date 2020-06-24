// should flag commits that are out of order based on the previous commit
// position is a string like 'INIT', 'L1', 'L1S1'
export function validateCommitOrder(positions: string[]): boolean {
  // loop over positions
  const errors: number[] = [];
  let previous = { level: 0, step: 0 };
  let current = { level: 0, step: 0 };
  positions.forEach((position: string, index: number) => {
    if (position === "INIT") {
      if (previous.level !== 0 && previous.step !== 0) {
        errors.push(index);
      }
      current = { level: 0, step: 0 };
      return;
    } else {
      // @deprecate - remove L|Q
      const levelMatch = position.match(/^(?<level>[0-9]+)$/);
      // @deprecate - remove S|Q|A
      const stepMatch = position.match(
        /^(?<level>[0-9]+)\.(?<step>[0-9]+):[T|S]$/
      );
      if (levelMatch) {
        // allows next level or step
        const levelString = levelMatch?.groups?.level;
        if (!levelString) {
          console.warn(`No commit level match for ${position}`);
          return;
        }
        const level = Number(levelString);
        current = { level, step: 0 };
      } else if (stepMatch) {
        // allows next level or step
        if (!stepMatch?.groups?.level || !stepMatch?.groups.step) {
          console.warn(`No commit step match for ${position}`);
          return;
        }
        const { level: levelString, step: stepString } = stepMatch.groups;

        const level = Number(levelString);
        const step = Number(stepString);
        current = { level, step };
      } else {
        // error
        console.warn(`Invalid commit position: ${position}`);
        return;
      }
      if (
        current.level < previous.level ||
        (current.level === previous.level && current.step < previous.step)
      ) {
        errors.push(index);
      }
    }
    previous = current;
  });

  if (errors.length && process.env.NODE_ENV !== "test") {
    console.warn("Found commit positions out of order");
    positions.forEach((position, index) => {
      if (errors.includes(index)) {
        console.warn(`${position} <-`);
      } else {
        console.log(position);
      }
    });
  }
  return !errors.length;
}
