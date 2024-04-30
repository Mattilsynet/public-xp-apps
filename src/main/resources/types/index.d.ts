export type { Request } from './Request.d'

// POLYFILLS
declare global {
  interface Array<T> {
    find(predicate: (value: T) => boolean): T | undefined
  }
}
