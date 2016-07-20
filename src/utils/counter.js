export class Counter {
    constructor(start = 0) {
        this.c = start;
    }
    increase() {
        this.c++;
    }
    toString() {
        return this.c;
    }
}
