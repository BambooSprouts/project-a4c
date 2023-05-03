import * as mc from '@minecraft/server';
import { World } from '../../lib/minecraft';

import { TagStatus, tagEnd } from './index';

const mcLib = new World("overworld");


mc.world.events.entityHurt.subscribe(ev => {
	if (TagStatus.isExecuting) {
		TagStatus.tagger = ev.hurtEntity;

		mcLib.runCommands(ev.hurtEntity, "inputpermission set @s movement disabled");
		ev.damageSource.damagingEntity.addEffect(mc.MinecraftEffectTypes.invisibility, 100, 0, false);
	}
	else return;
});

mc.system.runInterval(() => {
	if (TagStatus.isExecuting) {
		TagStatus.survivingPlayer.forEach(player => player.addEffect(mc.MinecraftEffectTypes.weakness, 100, 0, false));

		if (TagStatus.taggerLimit === 20) mcLib.runCommands(TagStatus.tagger, "inputpermission set @s movement enabled");

		if (TagStatus.taggerLimit > 0) {
			TagStatus.taggerLimit--;
		}
		else {
			TagStatus.tagger.kill();
			TagStatus.deceasedPlayer.push(TagStatus.tagger);

			if (TagStatus.survivingPlayer.length > 1) {
				if (TagStatus.taggerLimit > 5) {
					if (TagStatus.TagStatus.taggerLimitDecrease) TagStatus.taggerLimit = --TagStatus.maxTaggerLimit;
					else TagStatus.taggerLimit = TagStatus.maxTaggerLimit;

					TagStatus.TagStatus.taggerLimitDecrease = !TagStatus.TagStatus.taggerLimitDecrease;
				}
			}
			else return tagEnd();

			TagStatus.randomlyTagged();
		}
	}
	else return;
}, 20);
