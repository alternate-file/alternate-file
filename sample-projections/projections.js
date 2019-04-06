module.exports = {
  "*.js": {
    alternate: ["{directories}/__test__/{filename}.test.js", "{}.test.js"],
    template: `
    foo
    `
  },
  "*.jsx": {
    alternate: [
      "{directories}/__test__/{filename}.test.jsx",
      "{directories}/__test__/{filename}.test.js",
      "{}.test.jsx",
      "{}.test.js"
    ]
  }
};

[
  {
    "path": "*.js",
    "alternate": "**/__test__/*.test.js",
    "template": [
      "import React from 'react';",
      "",
      "describe('', () => {",
      "  it('' => {",
      "  });",
      "});"
    ],
    alternateTemplate: [

      "import React from 'react';",
      "",
      "describe('', () => {",
      "  it('' => {",
      "  });",
      "});"
    ]
  }
]
