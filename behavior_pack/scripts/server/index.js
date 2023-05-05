import * as mc from '@minecraft/server';
import { World } from '../lib/minecraft';

import { TagStatus, tagStart, tagEnd } from '../modules/tag/index';

const mcLib = new World("overworld");

mc.system.events.beforeWatchdogTerminate.subscribe(ev => ev.cancel = true);

mc.system.events.scriptEventReceive.subscribe(ev => {
	switch (ev.id) {
		case "tag:start": return TagStatus.isExecuting ? tagStart() : null;
		case "tag:end": return tagEnd();
	}
});
