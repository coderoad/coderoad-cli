export function main () {
  console.log(`
CodeRoad CLI
Usage: coderoad [options]

Options:
--help (-h)       display these help docs
--version (-v)    show coderoad cli version
create            start a new tutorial from a template
build             generate a coderoad.json file from markdown and yaml
validate          run a variety of tests to ensure a tutorial works as intended

More docs at https://github.com/coderoad/coderoad-cli`)
}

export function create () {
  console.log(`Create a new CodeRoad tutorial project from a template.

Usage: coderoad create [path] [options]

Options:
--help (-h)         display these help docs
--lang (-l)         programming language for template
--testRunner (-t)   test runner module for template

More docs at https://github.com/coderoad/coderoad-cli`)
}

export function build () {
  console.log(`Compile a coderoad.json file from markdown & yaml.

Usage: coderoad build [path] [options]

Options:
--help (-h)                         display these help docs
--markdown (-m)   (TUTORIAL.md)     custom path to the tutorial markdown file 
--yaml (-y)       (coderoad.yaml)   custom path to the tutorial yaml file 
--output (-o)     (coderoad.json)   custom path to tutorial json config file 

More docs at https://github.com/coderoad/coderoad-cli`)
}

export function validate () {
  console.log(`Validates commits and tests across a tutorial.

Usage: coderoad validate [path] [options]

Options:
--help (-h)               display these help docs
--validate (-v)   (true)  run tutorial schema validation. Set to false to block validation.
--clean (-c)      (false) set to false to preserve .tmp folder. Helpful for debugging

More docs at https://github.com/coderoad/coderoad-cli`)
}
