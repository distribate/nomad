import { action, atom, withAssign, type Ctx } from "@reatom/framework";
import { declareModel } from ".";
import { getGsap } from "../gsap";
import type { JSX } from "solid-js";

interface GeolocationError extends Error {
  code?: number;
}

export function getCurrentPositionAsync(
  options?: PositionOptions
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (geoError: GeolocationPositionError) => {
        const err: GeolocationError = new Error(geoError.message);
        err.code = geoError.code;
        reject(err);
      },
      options
    );
  });
}

type AnimInitial = Partial<{
  before: JSX.CSSProperties;
  after: JSX.CSSProperties;
  in: JSX.CSSProperties;
}>;

const createAnimAtoms = (initial: AnimInitial = {}, baseName: string) =>
  atom(null, `${baseName}.$anim`).pipe(
    withAssign((_, name) => ({
      before: atom(initial.before ?? {}, `${name}.before`),
      after: atom(initial.after ?? {}, `${name}.after`),
      in: atom(initial.in ?? {}, `${name}.in`),
    }))
  )

type AnimCallback<P> = (
  ctx: Ctx,
  deps: {
    gsap: typeof gsap;
    anim: ReturnType<typeof createAnimAtoms>;
    payload: P;
  }
) => gsap.core.Animation | void;

type DefineAnimOptions<T extends AnimInitial, P> = {
  name?: string;
  initial?: T;
  callback: AnimCallback<P>;
}

export const defineAnimModel = <T extends AnimInitial, Payload = void>(
  instanceName: string = "default",
  {
    initial = {} as T,
    callback,
  }: DefineAnimOptions<T, Payload>
) => declareModel(`anim:${instanceName}`, ({ name }) => {
  const $anim = createAnimAtoms(initial, name("model"));
  const isPending = atom(false, name("isPending"));

  const start = action((ctx, payload: Payload) => {
    const gsap = getGsap();

    $anim.before(ctx, {});
    isPending(ctx, true);

    const animation = callback(ctx, { gsap, anim: $anim, payload });

    if (animation && "then" in animation) {
      animation.then(() => isPending(ctx, false));
    }

    return animation;
  }, name("start"));

  return {
    $anim,
    isPending,
    initial,
    start,
  };
})
