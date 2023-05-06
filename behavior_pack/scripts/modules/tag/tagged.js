import * as mc from '@minecraft/server';
import { World } from '../../lib/minecraft';

import { TagStatus, tagEnd } from './index';

const mcLib = new World("overworld");


mc.world.events.entityHit.subscribe(ev => {
	const { entity, hitEntity } = ev;
	if (TagStatus.isExecuting && entity === TagStatus.tagger && hitEntity) {
		TagStatus.setTagger(hitEntity);

		entity.addEffect(mc.MinecraftEffectTypes.invisibility, TagStatus.invincibleTick, 0, false);
	}
	else return;
});

mc.system.runInterval(() => {
	if (TagStatus.isExecuting) {
		TagStatus.tagger.addEffect(mc.MinecraftEffectTypes.speed, TagStatus.invincibleTick, 1, false);
		TagStatus.escapingPlayer.forEach(player => player.addEffect(mc.MinecraftEffectTypes.weakness, TagStatus.invincibleTick, 9, false));

		if (!TagStatus.isInvincible) mcLib.runCommands(TagStatus.tagger, "inputpermission set @s movement enabled");

		if (TagStatus.taggerLimit > 0) TagStatus.taggerLimit--;
		else {
			TagStatus.tagger.kill();
			TagStatus.deceasedPlayer.push(TagStatus.tagger);

			if (TagStatus.survivingPlayer.length < 2) return tagEnd();

			TagStatus.randomlyTagged();
		}
	}
	else return;
}, 20);
