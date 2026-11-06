import type en from './messages/en.json'

/**
 * next-intl's key inference recurses into array members (`length`, `map`, ...), which breaks
 * namespace typing for every sibling key. Arrays of messages are read through `t.raw()`,
 * so they are modelled as opaque raw messages (`string`) at the type level.
 */
type RawArrays<T> = T extends readonly unknown[]
  ? string
  : T extends object
    ? { [K in keyof T]: RawArrays<T[K]> }
    : T

type Messages = RawArrays<typeof en>

declare module 'next-intl' {
  interface AppConfig {
    Messages: Messages
  }
}
