/*!
 * manage.js v1.0.0
 *
 * Copyright (c) 2023 Apedy
 *
 * This software is released under the manage.js.
 * see https://opensource.org/license/MIT
 */

import * as mc from '@minecraft/server';
import * as mcui from '@minecraft/server-ui';
import { World } from './minecraft';

const mcLib = new World("overworld");


class PlayerStatus {
	/**
	 * @param {mc.Player} player
	 */
	constructor(player) {
		this.nameTag = player.nameTag;
		this.muted = false;
	}
	/**
	 * @param {mc.Player} player
	 * @returns {PlayerStatus}
	 */
	static find(player) {
		return this.content.find(o => player.nameTag === o.nameTag) || this.content[this.content.push(new PlayerStatus(player))];
	}
	/** @type PlayerStatus[] */
	static content = [];
}

class Player {
	/**
	 * show the Player panel
	 * @param {mc.Player} player
	 */
	async show(player) {
		const playerList = mcLib.getPlayerList();
		const content = new mcui.ActionFormData()
			.title("§lPlayer§r");

		playerList.forEach(player => content.button(player.nameTag));

		const res = await content.show(player);

		Player.show(player, {player: playerList[res.selection]});
	}
	/**
	 * show the Player panel
	 * @param {mc.Player} player
	 * @param {{ player: mc.Player }} content
	 */
	static async show(player, content) {
		const res = await new mcui.ModalFormData()
			.title("§lPlayer§r")
			.textField("", "Player", `${content.player.nameTag}`)
			.toggle("§lMuted§r", PlayerStatus.find(content.player)?.muted)
			.show(player);

		PlayerStatus.find(player).muted = res.formValues[1];
	}
}

class Control {
	/**
	 * show the Control panel
	 * @param {mc.Player} player
	 */
	async show(player) {
		const res = await new mcui.ActionFormData()
			.title("§lControl§r")
			.button("§lPlayer§r")
			.show(player);

		switch (res.selection) {
			case 0: this.player.show(player); break;
		}
	}
	player = new Player();
}

export const control = new Control();
export const player = PlayerStatus;
