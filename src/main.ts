import { InputPlayer } from './inputPlayer';
import { InputTracker } from './inputTracker';
import { SavePoint } from './savepoint';

SavePoint.setupHooks();

const inputTracker = new InputTracker();
inputTracker.setupHooks();

const inputPlayer = new InputPlayer();
inputPlayer.setupHooks();

let savePoint!: SavePoint;

let animationFrame!: (callback: FrameRequestCallback) => number;
let animationArgs!: [FrameRequestCallback];

Object.assign(window, {
    tas: {
        time: {
            disable: disableTime,
            advance: advanceTime,
            enable: enableTime,
        },

        sp: {
            new: () => new SavePoint(),
            restore: (sp: SavePoint) => sp.restore(),
            compare: (sp: SavePoint) => sp.compare(),
        },

        start: () => {
            savePoint = new SavePoint();
            inputTracker.reset();
        },
        replay: () => {
            const inputs = inputTracker.getInputs();
            savePoint.restore();
            inputTracker.reset();
            inputPlayer.play(inputs);
        },
    },
});

function disableTime() {
    animationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = (...args) => {
        animationArgs = args;
        window.requestAnimationFrame = (_) => 0;
        return 0;
    };
}

function advanceTime() {
    animationFrame.apply(window, animationArgs);
}

function enableTime() {
    window.requestAnimationFrame = animationFrame;
}