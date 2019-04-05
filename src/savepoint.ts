import * as seedrandom from 'seedrandom';

declare const ig: any;
declare const sc: any;

export class SavePoint {
    public static setupHooks(): void {
        const offset = Date.now();
        Date.now = () => (offset + (SavePoint.dateCount++) * (1000 / 60));
    }

    private static readonly generator = seedrandom('tas', { state: true });
    private static readonly ctor = ig.system.constructor.toString();
    private static dateCount = 0;

    // Even though this field is named timestamp it does not contains a timestamp.
    // Instead it contains the dateCount at the time of the snapshot
    private timestamp!: number;
    private rngState!: () => seedrandom.prng;
    private objects = new Map<any, any>();
    private arrays = new Map<any[], any[]>();
    private canvases = new Map<HTMLCanvasElement, HTMLCanvasElement>();
    private contexts = new Map<CanvasRenderingContext2D, CanvasRenderingContext2D>();

    constructor() {
        this.save();
    }

    public compare(): boolean {
        for (const object of this.objects.keys()) {
            const clone = this.objects.get(object);

            for (const key of Object.keys(clone)) {
                if (object[key] !== clone[key] && !Number.isNaN(clone[key])) {
                    return false;
                }
            }
        }

        for (const array of this.arrays.keys()) {
            const clone = this.arrays.get(array);

            if (!clone || clone.length !== array.length) {
                return false;
            }

            for (let i = 0; i < array.length; i++) {
                if (array[i] !== clone[i] && !Number.isNaN(clone[i])) {
                    return false;
                }
            }
        }

        return true;
    }

    public restore() {
        for (const object of this.objects.keys()) {
            const clone = this.objects.get(object);

            for (const key of Object.keys(clone)) {
                object[key] = clone[key];
            }
        }

        for (const array of this.arrays.keys()) {
            const clone = this.arrays.get(array);

            array.splice(0, array.length);
            Object.assign(array, clone);
        }

        /*for (const canvas of this.canvases.keys()) {
            const clone = this.canvases.get(canvas)!;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(clone, 0, 0);
            }
        }*/

        /*for (const ctx of this.contexts.keys()) {
            const clone = this.contexts.get(ctx)!.canvas;
            const canvas = ctx.canvas;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(clone, 0, 0);
            }
        }*/

        Math.random = seedrandom('tas', { state: this.rngState });

        SavePoint.dateCount = this.timestamp;
    }

    private save() {
        this.timestamp = SavePoint.dateCount;
        this.rngState = SavePoint.generator.state();

        this.saveObject(ig);
        this.saveObject(sc);
    }

    private saveValue(value: any) {
        if (value && typeof value === 'object') {
            if (value instanceof Array) {
                this.saveArray(value);
            } else if (value instanceof HTMLCanvasElement) {
                this.saveCanvas(value);
            } else if (value instanceof CanvasRenderingContext2D) {
                this.saveContext(value);
            } else {
                this.saveObject(value);
            }
        }
    }

    private saveObject(object: any) {
        if (this.objects.has(object) || !this.canBeSaved(object)) {
            return;
        }

        const clone: {[key: string]: any} = {};
        this.objects.set(object, clone);

        for (const key of Object.keys(object)) {
            const value = object[key];

            if (typeof value !== 'function') {
                clone[key] = value;
                this.saveValue(value);
            }
        }
    }

    private saveArray(object: any[]) {
        if (this.arrays.has(object)) {
            return;
        }

        const clone = Object.assign([], object);
        this.arrays.set(object, clone);

        for (const value of object) {
            this.saveValue(value);
        }
    }

    private saveCanvas(canvas: HTMLCanvasElement) {
        if (this.canvases.has(canvas)) {
            return;
        }

        const clone = document.createElement('canvas');
        const ctx = clone.getContext('2d');
        if (ctx === null) {
            return;
        }

        clone.width = canvas.width;
        clone.height = canvas.height;

        ctx.drawImage(canvas, 0, 0);

        this.canvases.set(canvas, clone);
    }

    private saveContext(ctx: CanvasRenderingContext2D) {
        if (this.contexts.has(ctx)) {
            return;
        }

        const canvas = ctx.canvas;
        const clone = document.createElement('canvas');
        const context = clone.getContext('2d');
        if (context === null) {
            return;
        }

        clone.width = canvas.width;
        clone.height = canvas.height;

        context.drawImage(canvas, 0, 0);

        this.contexts.set(ctx, context);
    }

    private canBeSaved(object: any): boolean {
        return object
            && typeof object === 'object'
            && (Object.getPrototypeOf(object).constructor === Object
                || Object.getPrototypeOf(object).constructor.toString() === SavePoint.ctor);
    }
}