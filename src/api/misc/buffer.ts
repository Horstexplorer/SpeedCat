export class ChangeCalculationBuffer<I, O> {

    private readonly onCapture: (previous: I | undefined, next: I) => O
    private previous?: I

    constructor(onNext: (previous: I | undefined, next: I) => O) {
        this.onCapture = onNext
    }

    public calculate(next: I): O {
        const output = this.onCapture(this.previous, next)
        this.previous = next
        return output
    }

}