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
	static get survivingPlayer() {
		return mcLib.getPlayerList().map(player => this.deceasedPlayer.includes(player) ? null : player).filter(player => player !== TagStatus.tagger).filter(Boolean);
	}
	static randomlyTagged() {
		this.tagger = this.survivingPlayer[Math.floor(Math.random() * this.survivingPlayer.length)];

		mcLib.runCommands(mcLib.dimension, `say 鬼は${this.tagger.nameTag}です！`);
	}
}

export function tagStart() {
	TagStatus.randomlyTagged();
	// mcLib.getPlayerList().forEach(player =>.teleport(new mc.Vector(0, 100, 0), mcLib.dimension));

	mcLib.runCommands(TagStatus.tagger, "inputpermission set @s movement disabled");
	mcLib.getPlayerList().forEach(player => player.addEffect(mc.MinecraftEffectTypes.weakness, 100, 0, false));
	TagStatus.survivingPlayer.forEach(player => player.addEffect(mc.MinecraftEffectTypes.invisibility, 100, 0, false));

	TagStatus.isExecuting = true;
}
export function tagEnd() {
	TagStatus.isExecuting = false;
	TagStatus.taggerLimitDecrease = false;
	TagStatus.tagger = null;
	TagStatus.taggerLimit = 25;
	TagStatus.maxTaggerLimit = 25;
	TagStatus.deceasedPlayer = [];

	mcLib.runCommands(mcLib.dimension, "title @a title Game Over!!");
	mcLib.runCommands(mcLib.dimension, "inputpermission set @a movement enabled");

	// mcLib.getPlayerList().forEach(player => player.teleport(new mc.Vector(2, -60, 4)));
}
