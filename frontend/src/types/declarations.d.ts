declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare const process: {
  env: {
    NODE_ENV?: string;
    REACT_APP_API_URL?: string;
    [key: string]: string | undefined;
  };
};
