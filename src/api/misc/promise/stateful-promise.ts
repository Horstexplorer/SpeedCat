
export enum PromiseState {
    UNKNOWN,
    STARTED,
    RESOLVED,
    REJECTED
}

export default class StatefulPromise<T> extends Promise<T> {

    static get [Symbol.species]() {
        return Promise;
    }

    private _state: PromiseState = PromiseState.UNKNOWN

    constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
        super(resolve => resolve(
            Promise.resolve().then(async () => {
                    this._state = PromiseState.STARTED
                    try {
                        const result = await new Promise<T>(executor)
                        this._state = PromiseState.RESOLVED
                        return result
                    } catch (e) {
                        this._state = PromiseState.REJECTED
                        throw e
                    }
                })
        ))
    }

    get state() {
        return this._state
    }

    get finished() {
        return this._state == PromiseState.RESOLVED || this._state == PromiseState.REJECTED
    }

    static of<R>(promise: Promise<R>): StatefulPromise<R> {
        return new StatefulPromise<R>(resolve => resolve(promise))
    }

}