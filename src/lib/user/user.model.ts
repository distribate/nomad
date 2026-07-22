import { atom, withAssign } from "@reatom/framework";

type User = {
  firstName: string;
  createdAt: string
}

export const $user = atom(null, "user").pipe(
  withAssign((_, name) => ({
    data: atom<User | null>(null, `${name}.data`)
  }))
)
