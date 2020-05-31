export default function help() {
  console.log(`
Usage: coderoad [options]

Options:
  help          display these help docs
  version       show coderoad cli version
  create        start a new tutorial from a template
  build         generate a coderoad.json file from markdown and yaml

More docs at https://github.com/coderoad/coderoad-cli
    `);
}
