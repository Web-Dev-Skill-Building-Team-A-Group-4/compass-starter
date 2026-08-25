# GitHub Workflows

This directory contains GitHub Actions workflows for automating various aspects of the development process.

## PR Autolabeler

The `pr-autolabeler.yml` workflow automatically adds labels to pull requests based on the files changed. 

### How It Works

1. When a PR is opened, reopened, or synchronized (new commits pushed), the workflow is triggered
2. It uses the [actions/labeler](https://github.com/actions/labeler) action to analyze the changed files
3. Labels are applied according to rules defined in `.github/labeler.yml`
4. The `sync-labels` option ensures that labels are removed if files in that category are no longer changed

### Label Categories

Labels are applied based on both the **scope** of the change and the **type** of change:

#### Scope-based Labels
- `core`: Changes to core functionality
- `store`: Changes to state management
- `auth`: Authentication-related changes
- `admin`: Admin panel features
- `main`: Main application components
- `first-time`: First-time user experience
- `create`: Content creation components
- `shared`: Shared components
- `user-data`: User data management
- `course`: Course organization components
- `task`: Task content entities
- `dashboard`: Dashboard components
- `learn`: Learning components
- `public`: Public-facing content

#### Type-based Labels
- `docs`: Documentation changes
- `styles`: CSS/SCSS styling changes
- `ci`: CI/CD pipeline changes
- `build`: Build configuration changes

### Extending the Labeler

To add new label categories:

1. Edit the `.github/labeler.yml` file
2. Add a new entry with the label name and file path patterns
3. Labels will be automatically created if they don't exist

Example:
```yaml
new-label:
  - changed-files:
    - any-glob-to-any-file: 'path/to/files/**/*'
```

For more advanced configuration options, see the [actions/labeler documentation](https://github.com/actions/labeler).
