declare const cc: any;

export class InputTracker {

    private inputList: Array<Array<{type: string, argument: number | number[]}>> = [];
    private currentInput: Array<{type: string, argument: number | number[]}> = [];

    constructor() {
        window.addEventListener('mousedown', (ev) => this.mousedown(ev), false);
        window.addEventListener('mouseup', (ev) => this.mouseup(ev), false);
        window.addEventListener('mousemove', (ev) => this.mousemove(ev), false);
        window.addEventListener('keydown', (ev) => this.keydown(ev), false);
        window.addEventListener('keyup', (ev) => this.keyup(ev), false);
    }

    public setupHooks() {
        const original = cc.ig.gameMain.update;
        cc.ig.gameMain.update = (...args: any[]) => {
            this.preUpdate();
            original.apply(cc.ig.gameMain, args);
            this.postUpdate();
        };
    }

    public reset() {
        this.inputList = [];
        this.currentInput = [];
    }

    public preUpdate() {
        this.currentInput = [];
    }

    public postUpdate() {
        this.inputList.push(this.currentInput);
    }

    public getInputs() {
        return this.inputList;
    }

    private mousedown(ev: MouseEvent) {
        this.currentInput.push({
            type: 'mousedown',
            argument: [ev.button, ev.pageX, ev.pageY],
        });
    }

    private mouseup(ev: MouseEvent) {
        this.currentInput.push({
            type: 'mouseup',
            argument: [ev.button, ev.pageX, ev.pageY],
        });
    }

    private mousemove(ev: MouseEvent) {
        this.currentInput.push({
            type: 'mousemove',
            argument: [ev.pageX, ev.pageY],
        });
    }

    private keydown(ev: KeyboardEvent) {
        this.currentInput.push({
            type: 'keydown',
            argument: ev.keyCode,
        });
    }

    private keyup(ev: KeyboardEvent) {
        this.currentInput.push({
            type: 'keyup',
            argument: ev.keyCode,
        });
    }
}