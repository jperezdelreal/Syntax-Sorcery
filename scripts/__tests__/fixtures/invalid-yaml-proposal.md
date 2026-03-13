---
title: "Bad YAML
slug: nope
  - this: is broken
    yaml: [unclosed
---

Some body text here that should never be reached because the YAML frontmatter is malformed and will cause a parse error before the validator even gets to check the body content of this proposal file.
