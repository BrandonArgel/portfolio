import { describe, expect, test } from 'bun:test'
import {
  createCopyToClipboardController,
  type UseCopyToClipboardOptions,
} from './use-copy-to-clipboard'

interface RecordedState {
  copiedText: string | null
  error: Error | null
}

interface ScheduledTimer {
  id: number
  ms: number
  callback: () => void
  cancelled: boolean
}

function createFakeTimers() {
  let nextId = 1
  const timers: ScheduledTimer[] = []

  const scheduleReset = (callback: () => void, ms: number): number => {
    const timer: ScheduledTimer = {
      id: nextId++,
      ms,
      callback,
      cancelled: false,
    }
    timers.push(timer)
    return timer.id
  }

  const cancelReset = (id: unknown) => {
    const target = timers.find((timer) => timer.id === id)
    if (target) {
      target.cancelled = true
    }
  }

  const fire = (id: number) => {
    const target = timers.find((timer) => timer.id === id)
    if (target && !target.cancelled) {
      target.callback()
    }
  }

  return {
    timers,
    scheduleReset,
    cancelReset,
    fire,
  }
}

describe('createCopyToClipboardController', () => {
  test('copies text, triggers onSuccess, schedules default 2000ms reset, and clears after timeout', async () => {
    const states: RecordedState[] = []
    const successes: string[] = []
    const written: string[] = []
    const fakeTimers = createFakeTimers()

    const options: UseCopyToClipboardOptions = {
      onSuccess: (text) => successes.push(text),
    }

    const controller = createCopyToClipboardController({
      getOptions: () => options,
      onStateChange: (state) => states.push(state),
      writeText: async (text) => {
        written.push(text)
      },
      scheduleReset: fakeTimers.scheduleReset,
      cancelReset: fakeTimers.cancelReset,
    })

    const ok = await controller.copy('hello world')

    expect(ok).toBe(true)
    expect(written).toEqual(['hello world'])
    expect(successes).toEqual(['hello world'])
    expect(states).toEqual([{ copiedText: 'hello world', error: null }])
    expect(fakeTimers.timers).toHaveLength(1)
    expect(fakeTimers.timers[0]?.ms).toBe(2000)
    expect(fakeTimers.timers[0]?.cancelled).toBe(false)

    fakeTimers.fire(fakeTimers.timers[0].id)

    expect(states).toEqual([
      { copiedText: 'hello world', error: null },
      { copiedText: null, error: null },
    ])
  })

  test('does not schedule reset timer when timeout is null or 0', async () => {
    const states: RecordedState[] = []
    const fakeTimersNull = createFakeTimers()
    const controllerNull = createCopyToClipboardController({
      getOptions: () => ({ timeout: null }),
      onStateChange: (state) => states.push(state),
      writeText: async () => {},
      scheduleReset: fakeTimersNull.scheduleReset,
      cancelReset: fakeTimersNull.cancelReset,
    })

    expect(await controllerNull.copy('id-1')).toBe(true)
    expect(fakeTimersNull.timers).toHaveLength(0)

    const fakeTimersZero = createFakeTimers()
    const controllerZero = createCopyToClipboardController({
      getOptions: () => ({ timeout: 0 }),
      onStateChange: (state) => states.push(state),
      writeText: async () => {},
      scheduleReset: fakeTimersZero.scheduleReset,
      cancelReset: fakeTimersZero.cancelReset,
    })

    expect(await controllerZero.copy('id-2')).toBe(true)
    expect(fakeTimersZero.timers).toHaveLength(0)
  })

  test('rapid consecutive clicks cancel prior timer and reset countdown cleanly', async () => {
    const states: RecordedState[] = []
    const fakeTimers = createFakeTimers()

    const controller = createCopyToClipboardController({
      getOptions: () => ({ timeout: 2500 }),
      onStateChange: (state) => states.push(state),
      writeText: async () => {},
      scheduleReset: fakeTimers.scheduleReset,
      cancelReset: fakeTimers.cancelReset,
    })

    await controller.copy('first')
    await controller.copy('second')

    expect(fakeTimers.timers).toHaveLength(2)
    expect(fakeTimers.timers[0]?.cancelled).toBe(true)
    expect(fakeTimers.timers[1]?.cancelled).toBe(false)
    expect(fakeTimers.timers[1]?.ms).toBe(2500)

    // Even if an external timer runner fires callback #1 late, it must not reset state
    fakeTimers.timers[0]?.callback()
    expect(states.at(-1)).toEqual({ copiedText: 'second', error: null })

    fakeTimers.fire(fakeTimers.timers[1].id)
    expect(states.at(-1)).toEqual({ copiedText: null, error: null })
  })

  test('ignores stale async write resolution when superseded by a newer copy', async () => {
    const states: RecordedState[] = []
    const successes: string[] = []
    const fakeTimers = createFakeTimers()
    const resolvers: Array<() => void> = []

    const controller = createCopyToClipboardController({
      getOptions: () => ({
        onSuccess: (text) => successes.push(text),
      }),
      onStateChange: (state) => states.push(state),
      writeText: () =>
        new Promise<void>((resolve) => {
          resolvers.push(resolve)
        }),
      scheduleReset: fakeTimers.scheduleReset,
      cancelReset: fakeTimers.cancelReset,
    })

    const firstPromise = controller.copy('stale')
    const secondPromise = controller.copy('fresh')

    resolvers[1]?.()
    expect(await secondPromise).toBe(true)

    resolvers[0]?.()
    expect(await firstPromise).toBe(true)

    expect(successes).toEqual(['fresh'])
    expect(states).toEqual([{ copiedText: 'fresh', error: null }])
    expect(fakeTimers.timers).toHaveLength(1)
  })

  const createDeferred = () => {
    let resolve: () => void = () => {}
    let reject: (reason?: unknown) => void = () => {}
    const promise = new Promise<void>((res, rej) => {
      resolve = res
      reject = rej
    })
    return { promise, resolve, reject }
  }

  test('reset cancels pending timer, clears state, and ignores in-flight copies', async () => {
    const states: RecordedState[] = []
    const fakeTimers = createFakeTimers()
    const deferred = createDeferred()
    let calls = 0

    const controller = createCopyToClipboardController({
      getOptions: () => ({ timeout: 1500 }),
      onStateChange: (state) => states.push(state),
      writeText: () => {
        calls += 1
        return calls === 1 ? deferred.promise : Promise.resolve()
      },
      scheduleReset: fakeTimers.scheduleReset,
      cancelReset: fakeTimers.cancelReset,
    })

    const pending = controller.copy('in-flight')
    controller.reset()

    deferred.resolve()
    expect(await pending).toBe(true)
    expect(states).toEqual([{ copiedText: null, error: null }])
    expect(fakeTimers.timers).toHaveLength(0)

    await controller.copy('active')
    expect(fakeTimers.timers).toHaveLength(1)
    expect(fakeTimers.timers[0]?.cancelled).toBe(false)

    controller.reset()
    expect(fakeTimers.timers[0]?.cancelled).toBe(true)
    expect(states.at(-1)).toEqual({ copiedText: null, error: null })
  })

  test('dispose cancels pending timer and suppresses post-unmount state updates', async () => {
    const states: RecordedState[] = []
    const successes: string[] = []
    const errors: Error[] = []
    const fakeTimers = createFakeTimers()

    const controller = createCopyToClipboardController({
      getOptions: () => ({
        onSuccess: (text) => successes.push(text),
        onError: (err) => errors.push(err),
      }),
      onStateChange: (state) => states.push(state),
      writeText: async () => {},
      scheduleReset: fakeTimers.scheduleReset,
      cancelReset: fakeTimers.cancelReset,
    })

    await controller.copy('copied')
    expect(fakeTimers.timers).toHaveLength(1)

    controller.dispose()
    expect(fakeTimers.timers[0]?.cancelled).toBe(true)

    // Firing the timer callback directly after dispose must not mutate state
    fakeTimers.timers[0]?.callback()
    expect(states).toEqual([{ copiedText: 'copied', error: null }])

    // In-flight copies started while mounted that settle after dispose must not mutate state
    const pendingOk = createDeferred()
    const pendingFail = createDeferred()

    const unmountingController = createCopyToClipboardController({
      getOptions: () => ({
        onSuccess: (text) => successes.push(text),
        onError: (err) => errors.push(err),
      }),
      onStateChange: (state) => states.push(state),
      writeText: (text) => (text === 'pending-ok' ? pendingOk.promise : pendingFail.promise),
      scheduleReset: fakeTimers.scheduleReset,
      cancelReset: fakeTimers.cancelReset,
    })

    const inFlightOk = unmountingController.copy('pending-ok')
    const inFlightFail = unmountingController.copy('pending-fail')
    unmountingController.dispose()

    pendingOk.resolve()
    expect(await inFlightOk).toBe(true)

    pendingFail.reject(new Error('late error'))
    expect(await inFlightFail).toBe(false)

    expect(successes).toEqual(['copied'])
    expect(errors).toEqual([])
    expect(states).toEqual([{ copiedText: 'copied', error: null }])
  })

  test('handles rejected writeText errors and clears prior state and timer', async () => {
    const states: RecordedState[] = []
    const errors: Error[] = []
    const fakeTimers = createFakeTimers()
    let mode: 'ok' | 'error' | 'non-error' = 'ok'

    const controller = createCopyToClipboardController({
      getOptions: () => ({
        timeout: 2000,
        onError: (err) => errors.push(err),
      }),
      onStateChange: (state) => states.push(state),
      writeText: async () => {
        if (mode === 'error') {
          throw new Error('Permission denied')
        }
        if (mode === 'non-error') {
          throw 'string failure'
        }
      },
      scheduleReset: fakeTimers.scheduleReset,
      cancelReset: fakeTimers.cancelReset,
    })

    await controller.copy('valid')
    expect(fakeTimers.timers[0]?.cancelled).toBe(false)

    mode = 'error'
    expect(await controller.copy('blocked')).toBe(false)
    expect(fakeTimers.timers[0]?.cancelled).toBe(true)
    expect(states.at(-1)?.copiedText).toBeNull()
    expect(states.at(-1)?.error?.message).toBe('Permission denied')

    mode = 'non-error'
    expect(await controller.copy('weird-fail')).toBe(false)
    expect(states.at(-1)?.copiedText).toBeNull()
    expect(states.at(-1)?.error?.message).toBe('Failed to copy to clipboard')

    expect(errors.map((err) => err.message)).toEqual([
      'Permission denied',
      'Failed to copy to clipboard',
    ])
  })

  test('handles missing navigator.clipboard gracefully via default transport', async () => {
    const states: RecordedState[] = []
    const errors: Error[] = []
    const fakeTimers = createFakeTimers()

    let succeedOnce = true
    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator')

    try {
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: {
          clipboard: {
            writeText: async () => {
              if (!succeedOnce) {
                throw new Error('Unexpected writeText call')
              }
            },
          },
        },
      })

      const controller = createCopyToClipboardController({
        getOptions: () => ({
          timeout: 2000,
          onError: (err) => errors.push(err),
        }),
        onStateChange: (state) => states.push(state),
        scheduleReset: fakeTimers.scheduleReset,
        cancelReset: fakeTimers.cancelReset,
      })

      expect(await controller.copy('initial')).toBe(true)
      expect(fakeTimers.timers).toHaveLength(1)

      succeedOnce = false
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: {},
      })

      expect(await controller.copy('unsupported')).toBe(false)
      expect(fakeTimers.timers[0]?.cancelled).toBe(true)
      expect(states.at(-1)?.copiedText).toBeNull()
      expect(states.at(-1)?.error?.message).toBe('Clipboard API not supported')
      expect(errors.map((err) => err.message)).toEqual(['Clipboard API not supported'])
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, 'navigator', originalDescriptor)
      } else {
        Reflect.deleteProperty(globalThis, 'navigator')
      }
    }
  })
})
