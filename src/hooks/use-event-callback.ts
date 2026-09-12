import { useCallback, useRef } from 'react'

import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect'

export function useEventCallback<Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
): (...args: Args) => Return {
  const callbackRef = useRef(callback)

  useIsomorphicLayoutEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback((...args: Args) => callbackRef.current(...args), [])
}
