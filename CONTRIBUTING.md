# Contributing to local-ai-stack

Thank you for your interest in contributing to `local-ai-stack`! We welcome contributions from developers, AI enthusiasts, and DevOps engineers.

---

## Code of Conduct
Please review and adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md) in all interactions.

---

## Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose v2

### Steps
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/local-ai-stack/local-ai-stack.git
   cd local-ai-stack
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the TypeScript build in watch mode:
   ```bash
   npm run dev
   ```
4. Run tests:
   ```bash
   npm test
   ```
5. Check types and formatting:
   ```bash
   npm run typecheck
   npm run lint
   npm run format:check
   ```

---

## Pull Request Guidelines

1. **Create a branch**: `git checkout -b feature/my-cool-feature` or `fix/my-bugfix`.
2. **Write tests**: Ensure new features or bug fixes have corresponding tests in `tests/`.
3. **Verify checks**: Run `npm test` and `npm run typecheck` before submitting.
4. **Follow conventions**: Use clear commit messages adhering to Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`).
