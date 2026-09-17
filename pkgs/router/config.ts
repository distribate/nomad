export class RedirectError extends Error {
  readonly to: string;
  readonly replace: boolean;

  constructor(to: string, replace = false) {
    super(`Redirecting to ${to}`);
    this.name = "RedirectError";
    this.to = to;
    this.replace = replace;
  }
}

export let routerLog = false;
export const updateRouterLog = (log: boolean) => {
  routerLog = log;
};
