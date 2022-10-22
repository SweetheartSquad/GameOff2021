import { Engine } from 'matter-js';

// create an engine
export const engine = Engine.create();
export const { world } = engine;
engine.gravity.y = 0;
window.engine = engine;
