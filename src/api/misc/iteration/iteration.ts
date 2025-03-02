export interface IterationSettings {
    timeoutAfterMs?: number,
    maxIterations?: number
    iterationDelayMs?: number
}

export interface IterationDetails {
    iteration: {
        max?: number
        current: number
        startTime: number
        startTimeCurrent: number
    }
    timeout: {
        remaining?: number
        last: number
    }
}

export async function iterateTask<T>(settings: IterationSettings, task: (details: IterationDetails) => Promise<T>): Promise<T[]> {
    if (!settings.timeoutAfterMs && !settings.maxIterations)
        throw Error("No iteration constrains set - Either timeout or maxIterations required.")

    const startTime: number = window.performance.now()
    let iterationCount: number = 0
    let lastIterationDuration: number = 0

    const continueIteration: () => boolean = () =>
        (!settings.maxIterations || iterationCount < settings.maxIterations) // max iterations not reached
        && (!settings.timeoutAfterMs || (window.performance.now() - startTime) + lastIterationDuration < settings.timeoutAfterMs) // timeout unlikely
    const remainingUntilTimeout: () => number | undefined = () =>
        settings.timeoutAfterMs ? settings.timeoutAfterMs - (window.performance.now() - startTime) : undefined

    function currentDetails(): IterationDetails {
        return {
            iteration: {
                max: settings.maxIterations, current: iterationCount,
                startTime: startTime, startTimeCurrent: window.performance.now()
            },
            timeout: {
                remaining: remainingUntilTimeout(), last: lastIterationDuration
            }
        }
    }

    const results: T[] = []
    while (continueIteration()) {
        iterationCount++
        const iterationStartTime = window.performance.now()
        results.push(await task(currentDetails()))
        lastIterationDuration = window.performance.now() - iterationStartTime
    }

    return results
}