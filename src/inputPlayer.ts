declare const cc: any;
declare const ig: any;

export class InputPlayer {
    private inputList: Array<Array<{type: string, argument: number | number[]}>> = [];
    private frame = 0;

    public setupHooks() {
        const original = cc.ig.gameMain.update;
        cc.ig.gameMain.update = (...args: any[]) => {
            this.preUpdate();
            original.apply(cc.ig.gameMain, args);
            this.postUpdate();
        };
    }

    public play(inputList: Array<Array<{type: string, argument: number | number[]}>>) {
        this.inputList = inputList;
        this.frame = 0;
    }

    public preUpdate() {
        if (this.frame < this.inputList.length) {
            for (const input of this.inputList[this.frame]) {
                switch (input.type) {
                    case 'mousedown':
                        if (typeof input.argument === 'number') {
                            throw new Error();
                        }
                        ig.input.keydown({
                            type: 'mousedown',
                            target: {},
                            button: input.argument[0],
                            pageX: input.argument[1],
                            pageY: input.argument[2],
                            stopPropagation: () => 0,
                            preventDefault: () => 0,
                        });
                        break;
                    case 'mouseup':
                        if (typeof input.argument === 'number') {
                            throw new Error();
                        }
                        ig.input.keyup({
                            type: 'mouseup',
                            target: {},
                            button: input.argument[0],
                            pageX: input.argument[1],
                            pageY: input.argument[2],
                            stopPropagation: () => 0,
                            preventDefault: () => 0,
                        });
                        break;
                    case 'mousemove':
                        if (typeof input.argument === 'number') {
                            throw new Error();
                        }
                        ig.input.mousemove({
                            type: 'mousemove',
                            target: {},
                            pageX: input.argument[0],
                            pageY: input.argument[1],
                            stopPropagation: () => 0,
                            preventDefault: () => 0,
                        });
                        break;
                    case 'keydown':
                        if (typeof input.argument !== 'number') {
                            throw new Error();
                        }
                        ig.input.keydown({
                            type: 'keydown',
                            target: {},
                            keyCode: input.argument,
                            stopPropagation: () => 0,
                            preventDefault: () => 0,
                        });
                        break;
                    case 'keyup':
                        if (typeof input.argument !== 'number') {
                            throw new Error();
                        }
                        ig.input.keyup({
                            type: 'keyup',
                            target: {},
                            keyCode: input.argument,
                            stopPropagation: () => 0,
                            preventDefault: () => 0,
                        });
                        break;
                }
            }
        }
    }

    public postUpdate() {
        if (this.frame < this.inputList.length) {
            this.frame++;
        }
    }
}