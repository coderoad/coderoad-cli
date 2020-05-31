import { red, yellow, blue } from "kleur";

const _error = console.error;
const _warn = console.warn;
const _info = console.info;
// const log = console.log;

console.error = function () {
  // @ts-ignore
  _error(red.apply(console, arguments));
};

console.warn = function () {
  // @ts-ignore
  _warn(yellow.apply(console, arguments));
};

console.info = function () {
  // @ts-ignore
  _info(blue.apply(console, arguments));
};
