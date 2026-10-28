# w7skills

Agent skills for starting new projects with the w7 stack.

| Skill | Use it for |
| --- | --- |
| `project-starter-convex` | New TanStack Start + Convex project |
| `project-starter-tanstack-start` | New TanStack Start project without Convex |
| `project-starter-core` | Shared base used by both (not run on its own) |

Both starters run the core setup first and then add their backend layer:

- **Core:** better-result with exhaustive error matching, t3-env for environment variables, business logic in a core folder as
  `<name>Fn` functions behind thin wrappers, TanStack Query / Form / Table, shadcn + reui, no
  subtitles under headings unless asked, and the `frontend-design` skill installed.
- **TanStack Start:** `createServerFn` wrappers in `src/server/` over `src/server/core/<name>Fn`,
  throwing core errors the way TanStack Start expects.
- **Convex:** the schema defined in Zod with `zodTable`, Convex query/mutation/action wrappers over `convex/core/<name>Fn`, TanStack Query
  through `@convex-dev/react-query`, and verified Convex components before custom code.

Each starter actually runs the setup (installs dependencies, configures shadcn + reui, installs
skills, scaffolds the core folder and helpers) and writes the rules into the project's
`AGENTS.md`, so they keep applying after setup.

## Install

With the [skills CLI](https://skills.sh), from inside the new project:

```bash
npx skills add w7tf/w7skills
```

Install all three skills, since both starters load `project-starter-core`. Add `-g` to install
them globally so every new project can use them.

## Use

Open the new (or empty) project folder in your agent and ask for the starter:

```
/project-starter-convex
```

or

```
Set up this project with project-starter-tanstack-start
```

The skill scaffolds the app if the folder is empty, otherwise it sets up the existing app.
