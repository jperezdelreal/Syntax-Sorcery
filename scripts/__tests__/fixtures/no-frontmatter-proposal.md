No frontmatter here at all. Just plain text without any YAML block.

This file has no dashes at the start, no YAML metadata, nothing machine-readable. The validator should detect that there is no YAML frontmatter and report an appropriate error message indicating that the proposal format is invalid.

We need enough words here to pass the body length check if it ever gets that far, but the YAML check should fail first and prevent further validation from occurring on this particular test fixture file.
