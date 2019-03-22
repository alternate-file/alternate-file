module.exports = {
  "*.js": {
    alternate: ["{dirname}/__test__/{basename}.test.js", "{}.test.js"],
    template: `
    foo
    `
  },
  "*.jsx": {
    alternate: [
      "{dirname}/__test__/{basename}.test.jsx",
      "{dirname}/__test__/{basename}.test.js",
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
