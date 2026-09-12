import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'

import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect'

type EventListenerOptions = boolean | AddEventListenerOptions

type ElementRef<T extends EventTarget> = RefObject<T | null>

// Window events
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: undefined,
  options?: EventListenerOptions,
): void

// Element events
export function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLElement,
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: ElementRef<T>,
  options?: EventListenerOptions,
): void

// SVG events
export function useEventListener<
  K extends keyof SVGElementEventMap,
  T extends SVGElement = SVGElement,
>(
  eventName: K,
  handler: (event: SVGElementEventMap[K]) => void,
  element: ElementRef<T>,
  options?: EventListenerOptions,
): void

// MediaQueryList events
export function useEventListener<K extends keyof MediaQueryListEventMap>(
  eventName: K,
  handler: (event: MediaQueryListEventMap[K]) => void,
  element: ElementRef<MediaQueryList>,
  options?: EventListenerOptions,
): void

export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  element?: RefObject<EventTarget | null>,
  options?: EventListenerOptions,
): void {
  const savedHandler = useRef(handler)

  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const target = element?.current ?? window
    if (!target) return
    const listener = (event: Event) => {
      savedHandler.current(event)
    }

    target.addEventListener(eventName, listener, options)
    return () => {
      target.removeEventListener(eventName, listener, options)
    }
  }, [eventName, element, options])
}
