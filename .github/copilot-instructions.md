## Purpose

Short, focused instructions for AI coding agents working in this repo (Puerts + Unreal demo).

1) Big picture
- This repo is an Unreal Engine project that uses the Puerts plugin to run JavaScript/TypeScript inside UE. Key runtime boundaries:
  - Native C++ (Source/) — hosts a JsEnv and starts JS entry scripts. See `Source/puerts_unreal_demo/TsGameInstance.cpp` (JsEnv->Start("QuickStart")).
  - TypeScript sources (TypeScript/) — primary app logic written in TS and compiled to JS.
  - Runtime JS (Content/JavaScript/) — compiled JS and npm-managed dependencies loaded by Puerts at runtime.
  - Plugins/ — contains `Puerts` (native binding) and `NodeToCode` (codegen/prompting) used for translation examples.

2) Developer workflows (concrete)
- Build Unreal native modules: open the generated Visual Studio solution or run UE Build scripts from the engine directory. Example (engine cwd: `C:\Program Files\Epic Games\UE_5.5`):
  - Build editor target (Windows): `Engine\\Build\\BatchFiles\\Build.bat puerts_unreal_demoEditor Win64 Development <path-to>/puerts_unreal_demo.uproject -waitmutex`
  - Several VS Code tasks exist in workspace for common targets (see Tasks in workspace or the `.code-workspace`).
- TypeScript build: run the VS Code tsc watch build task (or run `tsc --watch`) from the repo root — the TypeScript sources compile into JS files used at runtime.
- Install JS deps used at runtime: `cd Content/JavaScript && npm install .` (required for some features like react-reconciler).
- Packaging note: add `Content/JavaScript` to Project Settings -> Packaging -> Additional Not-Asset Directories to Package so JS is included in packaged builds.

3) Debugging notes
- If breakpoints in VS Code won't bind for TS -> JS debugging, update `.vscode/launch.json` `remoteRoot` to use `${workspaceFolder}` (see README.md guidance).
- When changing C++ (Source/), rebuild the appropriate UE target (Editor/Project) with the UE Build task.

4) Project-specific conventions & patterns
- Single entry: the demo starts at `JsEnv->Start("QuickStart")`. Look for TS names that map to JS entry names (QuickStart.ts -> QuickStart.js).
- TS outputs live under `Content/JavaScript` at runtime — always compile TS before running UE to pick up changes.
- Native/JS integration: prefer editing TS for gameplay logic unless you need new engine bindings — then change C++ under `Source/` and update module rules.
- Plugins usage:
  - `Plugins/Puerts`: native bindings for JS runtime — do not modify lightly.
  - `Plugins/NodeToCode`: contains prompting templates and node-to-code rules. See `Plugins/NodeToCode/Content/Prompting/CodeGen_JavaScript.md` for examples of how prompts and translations are structured.

5) Integration points & external deps
- v8 / Puerts: This demo requires a compatible v8 build per Puerts docs — follow docs linked in the README before building.
- npm packages used by runtime JS are stored and installed under `Content/JavaScript`.

6) Guidance for AI edits (practical heuristics)
- If modifying gameplay logic, prefer editing TypeScript files under `TypeScript/` and ensure `tsc` compiles to `Content/JavaScript/`.
- If a change touches engine API or binding surfaces (new UClass/UFUNCTION exposure), update `Source/` C++ code and the module build, then run the UE build task.
- For generating JS from Blueprints or nodes, inspect `Plugins/NodeToCode/Content/Prompting/CodeGen_JavaScript.md` to match existing prompt-format and output expectations.
- Always verify: after edits, (1) run TypeScript build, (2) run (or rebuild) the UE target if native code changed, (3) confirm the JS files are present under `Content/JavaScript`.

7) Key files to reference (examples)
- `Source/puerts_unreal_demo/TsGameInstance.cpp` — C++ entry that starts JS.
- `TypeScript/QuickStart.ts` and `Content/JavaScript/QuickStart.js` — canonical TS -> JS flow example.
- `Plugins/NodeToCode/Content/Prompting/CodeGen_JavaScript.md` — codegen prompt templates and expected JSON responses.
- `README.md` — repository-level setup and troubleshooting notes (v8, packaging, debug tips).

8) When to ask for human help
- If you need to change native plugin code under `Plugins/Puerts` or the engine code, pause and request the maintainer — these are high-risk changes.

If anything here is unclear or you need more examples (e.g., a sample TS->JS change + build run), tell me which area to expand and I will iterate.
