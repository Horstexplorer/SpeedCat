export type Callback<T> = (t: T) => void

export function combineCallbacks<T>(...callbacks: (Callback<T>|undefined)[]): Callback<T> {
    return (t: T) => callbacks
        .filter(callback => !!callback)
        .forEach(callback => callback(t))
}