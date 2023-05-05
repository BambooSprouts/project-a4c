import * as mc from '@minecraft/server';
import { World } from '../../lib/minecraft';

import './tagged';

const mcLib = new World("overworld");


export class TagStatus {
	static isExecuting = false;
	static taggerLimitDecrease = false;
	static tagger = null;
	static taggerLimit = 25;
	static maxTaggerLimit = 25;
	static deceasedPlayer = [];
	static get isInvincible() {
		return this.taggerLimit > this.maxTaggerLimit - Math.floor(this.maxTaggerLimit / 5);
	}
	static get survivingPlayer() {
		return mcLib.getPlayerList().map(player => this.deceasedPlayer.includes(player) ? null : player).filter(Boolean);
	}
	static get escapingPlayer() {
		return this.survivingPlayer.filter(player => player !== this.tagger);
	}
	/**
	 * @param {mc.Entity} entity
	 */
	static setTagger(entity) {
		this.tagger = entity;

		mcLib.runCommands(mcLib.dimension, "replaceitem entity @a slot.armor.head 0 air 1 0");
		mcLib.runCommands(entity, "replaceitem entity @s slot.armor.head 0 carved_pumpkin 1 0 {\"minecraft:item_lock\":{\"mode\":\"lock_in_slot\"}}", "inputpermission set @s movement disabled");
	}
	static randomlyTagged() {
		this.setTagger(this.survivingPlayer[Math.floor(Math.random() * this.survivingPlayer.length)]);

		mcLib.runCommands(mcLib.dimension, `say 鬼は${this.tagger.nameTag}です！`);
	}
}

export function tagStart() {
	TagStatus.randomlyTagged();
	// mcLib.getPlayerList().forEach(player => player.teleport(new mc.Vector(130, -59, 50), mcLib.dimension, 0, 0));

	mcLib.getPlayerList().forEach(player => player.addEffect(mc.MinecraftEffectTypes.weakness, 100, 0, false));
	TagStatus.escapingPlayer.forEach(player => player.addEffect(mc.MinecraftEffectTypes.invisibility, 100, 0, false));

	TagStatus.isExecuting = true;
}
export function tagEnd() {
	TagStatus.isExecuting = false;
	TagStatus.taggerLimitDecrease = false;
	TagStatus.taggerN = null;
	TagStatus.taggerLimit = 25;
	TagStatus.maxTaggerLimit = 25;
	TagStatus.deceasedPlayer = [];

	mcLib.runCommands(mcLib.dimension, "title @a title Game Over!!", "inputpermission set @a movement enabled", "replaceitem entity @a slot.armor.head 0 air 1 0");

	// mcLib.getPlayerList().forEach(player => player.teleport(new mc.Vector(2, -60, 4), mcLib.dimension, 0, 0));
}
