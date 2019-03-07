# alternate-file

[![npm package](https://img.shields.io/npm/v/alternate-file.svg)](https://www.npmjs.com/package/alternate-file)
[![CircleCI](https://img.shields.io/circleci/project/github/alternate-file/alternate-file/master.svg)](https://circleci.com/gh/alternate-file/alternate-file)
[![codecov](https://img.shields.io/codecov/c/github/alternate-file/alternate-file.svg)](https://codecov.io/gh/alternate-file/alternate-file)
[![David Dependency Status](https://img.shields.io/david/alternate-file/alternate-file.svg)](https://david-dm.org/alternate-file/alternate-file)

In Vim, you can often go to the "alternate file" for the active buffer - usually the spec file for an implementation, or vice versa - by pressing `:A`. This extension adds exposes core functionality to build that behaviour into other editors, and also includes a CLI tool for broader integration.

`alternate-file` reads a config file based on the `.projections.json` file from [Tim Pope's Projectionist](https://github.com/tpope/vim-projectionist). This lets you specify where the spec files for different types of files in your project are set up. One you have a `.projections.json` in your file tree, you can use this library to find or create a spec for an implementation file, or vice versa.

## .projections.json

To describe your project's layout, create a `.projections.json` in the root of your project.

Each line should have the pattern for an implementation file as the key, and an object with the pattern for the alternate file (usually the spec file, but it can be whatever you want). Use a `*` in the main pattern and a `{}` in the alternate pattern to note the part of the path that should be the same between the two files. A `*` can stand in for an arbitrarily deep path.

### Split paths

If your test paths have an extra directly in the middle of them, like with `app/some/path/__test__/file.test.js` with Jest, you can use `{dirname}` for the directory path and `{basename}` for the filename. You can do the same thing on the implementation side with the standard glob syntax: `**` to represent the directory path, and `*` to represent the filename, like `app/**/something/*.js`.

If your paths have more than two variable parts, that can work too! You can use multiple sets of `**`/`{dirname}` pairs, which allows you to do something like:

```json
"apps/**/lib/**/*.ex": {
  "alternate": "apps/{dirname}/test/{dirname}/{basename}_test.exs"
}
```

### Multiple alternates

If your project is inconsistent about where specs go (it happens to the best of us), you can also pass an array to `alternate`. The extension will look for a file matching the first alternate, then the second, and so on. When you create an alternate file, it will always follow the first pattern.

Note that this isn't part of the original `projectionist` spec, but it's sometimes handy.

### Examples

```js
{
  // Basic
  // app/foo/bar/file.js => app/foo/bar/file.spec.js
  "app/*.js": { "alternate": "app/{}.spec.js" },
  // Dirname/Basename
  // app/foo/bar/file.js => app/foo/bar/__test__/file.test.js
  "*.js": { "alternate": "{dirname}/__test__/{basename}.test.js" },
  // Globbed implementation:
  // app/foo/bar/js/file.js => test/foo/bar/file_test.js
  "app/**/js/*.js": { "alternate": "test/{}/_test.js" },
  // Multiple alternatives
  // app/foo/bar/file.jsx =>
  //   app/foo/bar/file.spec.jsx OR app/foo/bar/file.spec.js OR
  //   spec/js/foo/bar/file_spec.js
  "app/*.jsx": { "alternate": ["app/{}.spec.jsx", "app/{}.spec.js", "spec/js/{}_spec.js"] }
}
```

For `.projections.json` files for popular frameworks, see the [sample-projections](/sample-projections). If your framework isn't in there, PRs for new sample-projections are welcome!

## Contributing

### Setup

Clone the repository, then

```bash
yarn install
```

### Run Unit Tests

```bash
yarn test
```

## Roadmap

- Support templates for auto-populating new files.
- Automatically create default .projection.json files
- Support all the transformations from Projectionist, not just `dirname` and `basename`.
- Support the "type" attribute in `.projections.json`, and allow for lookup by filetype, like for "`controller`/`view`/`template`".
