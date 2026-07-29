import type { Action, AsyncAction } from "@reatom/framework";

export type AppModule = {
  name: string;
  init: Action<[], void | Promise<void>> | AsyncAction<[], void>;
  /**
   * Initialization order.
   * Lower value = earlier execution.
   */
  priority?: number;
  /**
   * Whether the module should be initialized.
   */
  condition?: () => boolean;
  /**
   * Stop boot process if initialization fails.
   * @default true
   */
  critical?: boolean;
}
