addLayer('a', {
	startData() { return {
		unlocked: true,
		points: new Decimal(0),
	}},
	color: 'yellow',
	resource: 'achievements', 
	row: 'side',
	tooltip() { // Optional, tooltip displays when the layer is locked
		return 'Achievements';
	},
	update(diff) {
		player.a.points = new Decimal(getAchs());
	},
	achievementPopups: true,
	achievements: {
		11: {
			name: 'Starting out',
			tooltip() {
				return `Get 10 egg points\nCurrently: ${player.e.points}`;
			},
			image: 'https://media.discordapp.net/attachments/478214127945383936/860595705672630282/starting_out_tet.png',
			done() {
				return player.e.points.gte(10);
			},
		},
		12: {
			name: 'Yolkmaker',
			tooltip() { 
				return `Reset egg layer 50 times\nCurrently: ${player.e.resets}`;
			},
			image: 'https://cdn.discordapp.com/attachments/478214127945383936/860834255319728128/yolkmaker_tet.png',
			done() {
				return player.e.resets.gte(50);
			},
		},
		13: {
			name: 'A new dimension',
			tooltip() {
				return `Unlock a new layer`;
			},
			image: 'https://media.discordapp.net/attachments/478214127945383936/861583068564291614/a_new_dimension_tet.png',
			done() {
				return player.m.unlocked || player.c.unlocked;
			},
		},
		14: {
			name: 'Optimize',
			tooltip() {
				return `Get the first 6 egg upgrades`;
			},
			image: 'https://cdn.discordapp.com/attachments/478214127945383936/862785941964849203/optimize_tet.png',
			done() {
				return player.e.achs[14];
			},
		},
		15: {
			name: 'Accidental equation',
			tooltip() {
				return `Unlock both row 2 layers`;
			},
			image: 'https://media.discordapp.net/attachments/478214127945383936/861583068564291614/a_new_dimension_tet.png',
			done() {
				return player.m.unlocked && player.c.unlocked;
			},
		},
		21: {
			name: 'Free Boost',
			tooltip() {
				return `Get 4 Multiplier upgrades`;
			},
			image: 'https://media.discordapp.net/attachments/478214127945383936/861583068564291614/a_new_dimension_tet.png',
			done() {
				return player.m.achs[21];
			},
		},
	},
});