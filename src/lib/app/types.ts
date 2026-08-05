import type { Ctx } from "@reatom/framework";

export type AppModule = {
  name: string;
  init: (ctx: Ctx) => void | Promise<void>;
  /**
   * Initialization order.
   * Lower value = earlier execution.
   */
  priority?: number;
  /**
   * Whether the module should be initialized.
   */
  when?: (ctx: Ctx) => boolean;
  /**
   * Stop boot process if initialization fails.
   * @default true
   */
  critical?: boolean;
}
