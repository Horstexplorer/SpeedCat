import {Callback, combineCallbacks} from "./callback.ts"

export interface IEvent {
    timestamp: number
}

export interface IStatefulEvent<T> extends IEvent {
    state?: T
}

export type EventCallback<T extends IEvent> = Callback<T>

export class EventAggregator<T extends IEvent> {
    readonly events: T[] = []
    readonly additionalCallbacks: EventCallback<T>

    constructor(...additionalCallbacks: EventCallback<T>[]) {
        this.additionalCallbacks = combineCallbacks<T>(...additionalCallbacks)
    }

    get capture(): EventCallback<T> {
        return (event: T) => {
            this.events.push(event)
            this.additionalCallbacks(event)
        }
    }

}