export function help() {
  console.log(`
Usage: coderoad [options]

Options:
--help (-h)       display these help docs
--version (-v)    show coderoad cli version
create            start a new tutorial from a template
build             generate a coderoad.json file from markdown and yaml

More docs at https://github.com/coderoad/coderoad-cli
    `);
}

export function create() {
  console.log(`
Usage: coderoad create [path] [options]

Options:
--help (-h)         display these help docs
--lang (-l)         programming language for template
--testRunner (-t)   test runner module for template

More docs at https://github.com/coderoad/coderoad-cli
`);
}

export function build() {
  console.log(`
Usage: coderoad build [path] [options]

Options:
--help (-h)       display these help docs
--markdown (-m)   custom path to the tutorial markdown file (TUTORIAL.md)
--yaml (-y)       custom path to the tutorial yaml file (coderoad.yaml)
--output (-o)     custom path to tutorial json config file (coderoad.json)

More docs at https://github.com/coderoad/coderoad-cli
`);
}
