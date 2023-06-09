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
	static get invincibleTick() {
		return Math.floor(this.maxTaggerLimit / 5) * 20;
	}
	static get isInvincible() {
		return this.taggerLimit > this.maxTaggerLimit - this.invincibleTick / 20;
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
	static Tagged(entity) {
		mcLib.getPlayerList().forEach(player => {
			player.nameTag = player.name;
		});

		this.tagger = entity;
		entity.nameTag = `§l§c>§r §l§f${entity.nameTag}§r §l§c<§r`;

		if (this.taggerLimit > 5 && this.taggerLimitDecrease) this.taggerLimit = --this.maxTaggerLimit;
		else this.taggerLimit = this.maxTaggerLimit;

		this.taggerLimitDecrease = !this.taggerLimitDecrease;

		mcLib.runCommands([
			`title @a title ${this.tagger.nameTag}`,
			"replaceitem entity @a slot.armor.head 0 air 1 0"
		]);
		mcLib.runCommands([
			"inputpermission set @s movement disabled",
			"replaceitem entity @s slot.armor.head 0 carved_pumpkin 1 0 {\"minecraft:item_lock\":{\"mode\":\"lock_in_slot\"}}"
		], entity);
	}
	static randomlyTagged() {
		this.Tagged(this.survivingPlayer[Math.floor(Math.random() * this.survivingPlayer.length)]);
	}
}

export function tagStart() {
	mcLib.runCommands([
		"gamemode a @a",
		"title @a times 0 40 0"
	]);
	mcLib.getPlayerList().forEach(player => {
		player.teleport(new mc.Vector(130, -59, 50), mcLib.dimension, 0, 0);
		player.addEffect(mc.MinecraftEffectTypes.weakness, TagStatus.invincibleTick, 9, false);
	});

	TagStatus.randomlyTagged();
	TagStatus.escapingPlayer.forEach(player => player.addEffect(mc.MinecraftEffectTypes.invisibility, 100, 0, false));
	TagStatus.isExecuting = true;
}
export function tagEnd() {
	mcLib.runCommands([
		"title @a title §cGame Over!!",
		`title @a subtitle §fwinner: ${TagStatus.survivingPlayer[0]?.nameTag}`,
		"inputpermission set @a movement enabled",
		"replaceitem entity @a slot.armor.head 0 air 1 0"
	]);
	mcLib.getPlayerList().forEach(player => {
		player.nameTag = player.name;
	});

	TagStatus.isExecuting = false;
	TagStatus.taggerLimitDecrease = false;
	TagStatus.tagger = null;
	TagStatus.taggerLimit = 25;
	TagStatus.maxTaggerLimit = 25;
	TagStatus.deceasedPlayer = [];

	mcLib.getPlayerList().forEach(player => player.teleport(new mc.Vector(2, -60, 4), mcLib.dimension, 0, 0));
}
