# Git Branching Strategy for AI App Builder

## Overview

This repository manages multiple Flutter app projects with a scalable branching strategy that keeps the Tier4 builder framework as the baseline while allowing independent development of each app.

## Branch Structure

### Main Branches

#### `master` - Tier4 Baseline

- **Purpose**: Contains the core AI app builder framework (Tier4)
- **Contents**:
  - `builder/` - Code generation agents and scripts
  - `docs/` - Framework documentation
  - Root configuration files (package.json, tsconfig, etc.)
  - Template structures
- **Policy**: Only framework updates, no app-specific code
- **Protection**: Requires review for direct pushes

#### `app/[app-name]` - Individual App Branches

- **Purpose**: Development of specific Flutter apps
- **Naming Convention**: `app/jiji-clean`, `app/my-app1`, `app/test-app`
- **Contents**: Full workspace including both framework + app code
- **Base**: Always branches from latest `master`

## Workflow

### 1. Creating a New App Project

```bash
# Start from master with latest framework
git checkout master
git pull origin master

# Create new app branch
git checkout -b app/new-app-name

# Generate app using builder
npm run new new-app-name

# Develop and commit app-specific changes
git add .
git commit -m "feat: Add [AppName] - [description]"
git push origin app/new-app-name
```

### 2. Working on Existing Apps

```bash
# Switch to app branch
git checkout app/jiji-clean

# Make changes
# ... development work ...

# Commit changes
git add .
git commit -m "feat: Add capture functionality to JIJI Clean"
git push origin app/jiji-clean
```

### 3. Framework Updates (Tier4 Improvements)

```bash
# Work on master for framework changes
git checkout master

# Make framework improvements
# ... builder/, docs/, templates/ changes ...

# Commit framework updates
git add .
git commit -m "feat: Improve code generation for AR apps"
git push origin master
```

### 4. Syncing Apps with Framework Updates

```bash
# Update app with latest framework
git checkout app/jiji-clean
git merge master

# Resolve conflicts if any
# Test app still works with new framework
git push origin app/jiji-clean
```

## Directory Structure Per Branch

### `master` Branch

```
AI_APP_BUILDER/
├── builder/          # Core framework
├── docs/            # Documentation
├── package.json     # Root config
├── tsconfig.base.json
└── apps/            # Empty or minimal examples
```

### `app/jiji-clean` Branch

```
AI_APP_BUILDER/
├── builder/          # Framework (from master)
├── docs/            # Documentation (from master)
├── package.json     # Root config (from master)
├── apps/
│   └── jiji_clean/  # Complete Flutter AR app
└── [other framework files]
```

## Benefits

1. **Clean Separation**: Framework vs app code clearly separated
2. **Independent Development**: Each app can evolve independently
3. **Framework Evolution**: Core builder can be improved without affecting apps
4. **Easy Deployment**: Each app branch is self-contained and deployable
5. **Collaboration**: Multiple developers can work on different apps simultaneously
6. **Rollback Safety**: Framework issues don't break existing apps

## App Lifecycle

### Development Phase

- Work in `app/[name]` branch
- Regular commits for features and fixes
- Periodic syncing with master for framework updates

### Production Deployment

- Deploy directly from `app/[name]` branch
- Tag releases: `git tag v1.0.0-jiji-clean`
- Create GitHub releases for distribution

### Maintenance

- Bug fixes in app branch
- Framework improvements in master
- Merge master → app branches as needed

## Current Status

| Branch           | Status    | Description                      |
| ---------------- | --------- | -------------------------------- |
| `master`         | ✅ Active | Tier4 framework baseline         |
| `app/jiji-clean` | 🚀 Ready  | Complete AR hygiene app for kids |

## Next Steps

1. Create `app/jiji-clean` branch from current master
2. Set up additional app branches for `my_app1`, `test_app`
3. Establish CI/CD pipelines per app branch
4. Document deployment procedures per app

---

**Last Updated**: December 2024  
**Framework Version**: Tier4 Complete  
**Active Apps**: 1 (JIJI Clean AR)
