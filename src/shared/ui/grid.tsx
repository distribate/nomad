
import { createMemo, For, type JSX } from "solid-js";

type MasonryGridProps<T> = {
  items: T[];
  columns?: number;
  gap?: string;
  renderItem: (item: T, index: number) => JSX.Element;
  /**
   * uses for calculating item height
   * if not provided, all items are considered the same height
   */
  getWeight?: (item: T) => number;
};

export function MasonryGrid<T>(props: MasonryGridProps<T>) {
  const columns = createMemo(() => {
    const count = props.columns ?? 3;

    const result: {
      item: T;
      index: number;
    }[][] = Array.from(
      { length: count },
      () => []
    );

    const heights = Array(count).fill(0);


    props.items.forEach((item, index) => {
      const shortest = heights.indexOf(
        Math.min(...heights)
      );

      result[shortest].push({
        item,
        index,
      });

      heights[shortest] += props.getWeight
        ? props.getWeight(item)
        : 1;
    });


    return result;
  });

  return (
    <div
      class="flex w-full"
      style={{
        gap: props.gap ?? "0.75rem",
      }}
    >
      <For each={columns()}>
        {(column) => (
          <div
            class="flex min-w-0 flex-1 flex-col"
            style={{
              gap: props.gap ?? "0.75rem",
            }}
          >
            <For each={column}>
              {(entry) =>
                props.renderItem(
                  entry.item,
                  entry.index
                )
              }
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
