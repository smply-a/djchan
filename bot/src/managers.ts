import { ComponentManager } from "./base/ComponentManager.js";

export const Managers = {
    components: new ComponentManager(),
    // todo maybe move compoennts manager in client or player out of client
    players: null
}