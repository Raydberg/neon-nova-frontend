# Neon Nova FrontEnd

This Angular 19 project serves as the frontend application for Neon Nova, built with modern web technologies including Angular, Tailwind CSS, and DaisyUI.

## Project Overview

To start a local development server, run:Neon Nova is a web application using Angular's standalone components architecture with the following features:

- Angular 19.2.5
- TailwindCSS for styling
- DaisyUI component library
- Bun package manager
- Automated CI/CD with GitHub Actions to Netlify


## Project Structure
```
neon-nova/
├── .angular/              # Angular cache files
├── .vscode/               # VS Code configuration
├── node_modules/          # Dependencies
├── src/                   # Source code
│   ├── app/               # Application code
│   │   ├── core/          # Core functionality
│   │   │   ├── guards/    # Route guards
│   │   │   ├── interceptors/ # HTTP interceptors
│   │   │   ├── models/    # Data models
│   │   │   └── services/  # Core services
│   │   ├── modules/       # Feature modules
│   │   │   └── [feature]/ # Feature-specific components
│   │   └── shared/        # Shared components, pipes, directives
│   ├── assets/            # Static assets (images, fonts)
│   ├── environments/      # Environment configurations
│   ├── index.html         # Main HTML file
│   ├── main.ts            # Application entry point
│   └── styles.css         # Global styles
├── .editorconfig          # Editor configurations
├── .gitignore             # Git ignore configuration
├── angular.json           # Angular CLI configuration
├── package.json           # Dependencies and scripts
├── README.md              # Project documentation
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```


## Getting Started

### Prerequisites
- Node.js or Bun installed on your system
- Angular CLI

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/neon-nova.git

# Navigate to the project directory
cd neon-nova

# Install dependencies with Bun (recommended)
bun install

# Or with npm
npm install
```
## Development Server

```bash
# Start development server
ng serve

# Or with Bun
bun run start

# Open in browser automatically
ng serve -o
```
The app will be available at http://localhost:4200/ and will automatically reload when you make changes.


## Building
```bash
# Production build
ng build --configuration=production

# Or with Bun
bun run build -- --configuration=production
```

## Deployment

- The project uses GitHub Actions for CI/CD, deploying to Netlify on pushes to the main branch. The workflow is defined in [Build and Debloy Netlify](.github/workflows/github-deploy.yml)

### The deployment process:

- Runs tests
- Builds the application for production
- Deploys to Netlify

## Technologies Used
- Angular 19
- TailwindCSS 4
- DaisyUI
- Bun (package manager)
- Netlify (hosting)

## 📄 Licencia

Este proyecto está licenciado bajo la licencia Apache 2.0 - consulte el archivo [LICENSE](LICENSE) para más detalles.
