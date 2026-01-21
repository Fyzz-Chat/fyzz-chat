## Coding guidelines

- DO NOT write docstrings for functions or classes unless explicitly asked to do so.
- DO NOT write unnecessary comments like "Returns the user's name" for a function named `getName`.
- Only write comments for complex logic or when it's not obvious what the code does.
- Run the linter and formatter after writing code to fix any errors or warnings.
  - Run `bun run type-check` to check for type errors.
  - Run `bun run check` to check the code.
  - Fix any errors or warnings until the code passes the checks.
  - You may use `bun run check-write` to fix the code.
- Install new dependencies with `bun add <package> --exact`, meaning the exact version of the package.
  - If a dependency is installed with ^, install that exact version and remove the ^.

## Code organization

- Keep contexts in `/src/lib/contexts/` folder, hooks in `/src/hooks/` folder, and utils in `/src/lib/utils/` folder.
- Extract helper functions with no component dependencies to `/src/lib/utils/` or `/src/lib/` subfolders.
