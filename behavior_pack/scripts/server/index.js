import * as mc from '@minecraft/server';
import { World } from '../lib/minecraft';
import * as manage from '../lib/manage';

import { TagStatus, tagStart, tagEnd } from '../modules/tag/index';

const mcLib = new World("overworld");

mc.system.events.beforeWatchdogTerminate.subscribe(ev => ev.cancel = true);


mc.world.events.beforeItemUse.subscribe(ev => {
	ev.item.typeId === "minecraft:apple" ? manage.control.show(ev.source) : null;
});

mc.world.events.beforeChat.subscribe(ev => {
	const { sender } = ev;

	manage.player.find(sender).muted ? ev.cancel = true : null;
});

mc.system.events.scriptEventReceive.subscribe(ev => {
	switch (ev.id) {
		case "tag:start": return !TagStatus.isExecuting ? tagStart() : null;
		case "tag:end": return tagEnd();
	}
});
