export function main() {
  console.log(`
CodeRoad CLI
Usage: coderoad [options]

Options:
--help (-h)       display these help docs
--version (-v)    show coderoad cli version
create            start a new tutorial from a template
build             generate a coderoad.json file from markdown and yaml
validate          run a variety of tests to ensure a tutorial works as intended

More docs at https://github.com/coderoad/coderoad-cli`);
}

export function create() {
  console.log(`Create a new CodeRoad tutorial project from a template.

Usage: coderoad create [path] [options]

Options:
--help (-h)         display these help docs
--lang (-l)         programming language for template
--testRunner (-t)   test runner module for template

More docs at https://github.com/coderoad/coderoad-cli`);
}

export function build() {
  console.log(`Compile a coderoad.json file from markdown & yaml.

Usage: coderoad build [path] [options]

Options:
--help (-h)       display these help docs
--markdown (-m)   custom path to the tutorial markdown file (TUTORIAL.md)
--yaml (-y)       custom path to the tutorial yaml file (coderoad.yaml)
--output (-o)     custom path to tutorial json config file (coderoad.json)

More docs at https://github.com/coderoad/coderoad-cli`);
}

export function validate() {
  console.log(`Validates commits and tests across a tutorial.

Usage: coderoad validate [path] [options]

Options:
--help (-h)       display these help docs

More docs at https://github.com/coderoad/coderoad-cli`);
}
