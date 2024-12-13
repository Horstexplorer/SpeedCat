export type Callback<T> = (t: T) => void

export function combineCallbacks<T>(...callbacks: Callback<T>[]): Callback<T> {
    return (t: T) => {
        callbacks.forEach(callback => callback(t))
    }
}