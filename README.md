# Minified Branch Builder | GitHub Action
![](https://img.shields.io/github/stars/tristanbudd/minified-branch-github-action.svg) ![](https://img.shields.io/github/forks/tristanbudd/minified-branch-github-action.svg) ![](https://img.shields.io/github/issues/tristanbudd/minified-branch-github-action.svg)

## Overview
This GitHub Action provides an automated build pipeline for static assets. It scans your repository for CSS and JavaScript files, minifies them using `clean-css` and `terser`, and pushes the optimised code to a dedicated production branch.

The built-in link rewriter automatically updates `<link>` and `<script>` tags in your HTML or PHP files to point to the new `.min` (or hashed) filenames. This ensures the production branch is deployment-ready without requiring manual adjustments to your source code.

---

## Features
- **Asset Minification**: Compression for `.css` and `.js` files.
- **Dedicated Production Branch**: Maintains a clean `main` branch while providing an optimised target for deployment.
- **Link Rewriting**: Updates asset references in HTML and PHP files automatically.
- **Cache Busting**: Optional content hashing (e.g., `style.a1b2c3d4.min.css`) to prevent browser caching issues.
- **Backup Generation**: Automatically creates `.backup` copies and supports custom directory exclusion.
- **Concurrency Control**: Utilises a worker pool to process large repositories efficiently.

---

## Examples & Comparison
You can compare the output of the action across different branches:

### 1. Standard Production (`production`)
Minifies assets and appends `.min` to filenames.
[**View Examples**](https://github.com/tristanbudd/minified-branch-github-action/tree/production/examples)

### 2. Cache-Busted Production (`production-hashed`)
Minifies assets and appends a unique 8-character content hash.
[**View Examples**](https://github.com/tristanbudd/minified-branch-github-action/tree/production-hashed/examples)

---

## Inputs
| Name | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `github_token` | ✅ Yes | `${{ github.token }}` | Token used to push the production branch. (Typically auto-filled by GitHub) |
| `target_branch` | ❌ No | `production` | The name of the branch to receive the minified code. |
| `source_dir` | ❌ No | `.` | Root directory to scan for assets. |
| `minify_css` | ❌ No | `true` | Toggle CSS minification. |
| `minify_js` | ❌ No | `true` | Toggle JavaScript minification. |
| `hash_files` | ❌ No | `false` | Append a content hash (e.g., `app.8f2a1c3e.min.js`). |
| `keep_original_file`| ❌ No | `false` | Retain unminified source alongside minified files. |
| `generate_backup_file`| ❌ No | `true` | Create a `.backup` copy of original assets. |
| `exclude_dirs` | ❌ No | `node_modules,.git,dist` | Comma-separated list of folders to ignore. |

---

## Usage

### Basic Configuration
Add this to `.github/workflows/minify.yml`:

```yaml
name: Build Production Branch

on:
  push:
    branches: [ main ]

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: tristanbudd/minified-branch-github-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          target_branch: 'production'
          hash_files: 'true'
```

### Advanced Configuration (PHP & Custom Directories)
```yaml
      - uses: tristanbudd/minified-branch-github-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          source_dir: 'public/assets'
          target_branch: 'cdn-deploy'
          keep_original_file: 'true'
          exclude_dirs: 'vendor,node_modules,tests'
```

---

## Technical Details
- **Node.js Runtime**: Uses Node 20.
- **CSS Minifier**: `clean-css` (Level 2 optimisation).
- **JS Minifier**: `terser` (2-pass compression and mangling).
- **Deployment**: Automatically generates a `.nojekyll` file on the target branch to ensure assets are served correctly on GitHub Pages.

---

## Support
To report a bug or request a feature, please [**open an issue on GitHub**](https://github.com/tristanbudd/minified-branch-github-action/issues).

---

## License
[MIT](LICENSE)
