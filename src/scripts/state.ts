// Shared rail and scene state.
export let targets: number[] = [];
export let railCurrent = 0; // milestone under the reader, from the latest updateRail
export let readerIndex = 0; // last milestone settled by user scrolling (not by a resize)
export let restoreIndex = -1; // milestone to return to after a breakpoint rebuild
export const setTargets = (value: number[]) => {
  targets = value;
};
export const setRailCurrent = (value: number) => {
  railCurrent = value;
};
export const setReaderIndex = (value: number) => {
  readerIndex = value;
};
export const setRestoreIndex = (value: number) => {
  restoreIndex = value;
};
