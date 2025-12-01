// This file contains type declarations for your project.
// It allows you to provide type information for modules that don't have their own type definitions.

// Add type declarations for other modules if needed
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
