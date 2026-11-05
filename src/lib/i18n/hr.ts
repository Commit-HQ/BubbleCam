import type { Messages } from './en.ts';

// Tekst sučelja na hrvatskom, istog oblika kao en.ts. Stranica se obraća roditeljima i odgojiteljicama s „vi”,
// a aplikacija djeci s „ti”.

const plural = new Intl.PluralRules('hr');

/** „1 sličica”, „3 sličice”, „24 sličice”, „25 sličica”. */
function pictures(count: number) {
	return `${count} ${plural.select(count) === 'few' ? 'sličice' : 'sličica'}`;
}

export const hr: Messages = {
	languageName: 'Hrvatski',
	ogLocale: 'hr_HR',
	title: 'Igračke oživljavaju',
	description:
		'BubbleCam je besplatna aplikacija za stop-animaciju za djecu. Od svojih igračaka rade crtiće, sličicu po sličicu, a duh prethodne sličice lebdi preko kamere. Bez prijave i oglasa, a radi i bez interneta.',
	skip: 'Preskoči na sadržaj',
	home: 'BubbleCam početna',
	language: 'Jezik',
	nav: {
		open: 'Snimi crtić'
	},
	footer: {
		tagline: 'Igračke oživljavaju, sličicu po sličicu.',
		project: 'Projekt',
		github: 'Izvorni kod',
		license: 'Licenca',
		credits: 'Zasluge',
		privacy: 'Privatnost',
		madeBy: 'S ljubavlju napravio'
	},
	build: {
		label: 'Verzija',
		modified: 'izmijenjena'
	},
	privacyPolicy: {
		title: 'Privatnost',
		intro: 'BubbleCam o vama ne sprema ništa. Što djeca naprave, ostaje na njihovom uređaju.',
		sections: [
			{
				title: 'Sličice i crtići',
				copy: 'Svaka sličica koju BubbleCam snimi i svaki crtić napravljen od njih čuvaju se samo na uređaju, u spremištu preglednika. Ništa od toga ne šalje se nama ni bilo kome drugome. Video ide dalje samo kad ga vi podijelite.'
			},
			{
				title: 'Kamera',
				copy: 'BubbleCam koristi kameru samo dok je crtić otvoren za snimanje, i to nakon što preglednik zatraži vaše dopuštenje. Ono što kamera vidi nigdje se ne snima niti šalje, osim sličica koje snimite, a one ostaju na uređaju.'
			},
			{
				title: 'Bez računa, kolačića i praćenja',
				copy: 'Nema računa, kolačića, oglasa ni analitike. BubbleCam ne zna tko ga koristi.'
			},
			{
				title: 'Posluživanje',
				copy: 'Stranicu poslužuje Cloudflare. Kao i svaki poslužitelj, obrađuje tehničke podatke potrebne da stranica stigne do vašeg uređaja, poput IP adrese. BubbleCam sam ne zapisuje i ne analizira posjete.'
			},
			{
				title: 'Brisanje',
				copy: 'Crtić obrišete u aplikaciji, a sve odjednom brisanjem podataka stranice u postavkama preglednika.'
			}
		],
		contact: 'Imate pitanje? Pišite na'
	},
	error: {
		title: 'Nešto je pošlo krivo',
		copy: 'Nešto se na ovoj stranici pokvarilo. Obično pomogne vratiti se natrag.',
		missingTitle: 'Ova je stranica pukla',
		missingCopy: 'Kao balon od sapunice. Možda je adresa pogrešna ili je stranica premještena.',
		home: 'Na početnu',
		app: 'Na moje crtiće'
	},
	app: {
		films: {
			title: 'Moji crtići',
			new: 'Novi crtić',
			intro:
				'Odaberi igračku, stavi je pred kameru i pritisni crveni gumb. Crtići ostaju na ovom uređaju, pa one najdraže spremi kao video.',
			pictures,
			open: (when: string, count: number) => `Crtić od ${when}, ${pictures(count)}`,
			remove: 'Obriši crtić',
			removeTitle: 'Obrisati ovaj crtić?',
			removeCopy:
				'S njim nestaju i sve njegove sličice, i to se ne može vratiti. Spremljeni videi ostaju gdje jesu.',
			removeConfirm: 'Obriši',
			keep: 'Ostavi ga',
			unavailable:
				'Ovaj preglednik ne može čuvati crtiće, možda zato što je u privatnom načinu rada. Otvori BubbleCam u običnom prozoru.'
		},
		install: {
			button: 'Instaliraj',
			iosTitle: 'Stavi BubbleCam na početni zaslon',
			iosCopy:
				'U Safariju dodirni Dijeli, pa Dodaj na početni zaslon. Ondje su tvoji crtići najsigurniji.',
			dismiss: 'Ne sada'
		},
		studio: {
			back: 'Moji crtići',
			shutter: 'Snimi sličicu',
			camera: 'Natrag na kameru',
			ghost: 'Duh prethodne sličice',
			play: 'Pusti crtić',
			stop: 'Zaustavi',
			flip: 'Promijeni kameru',
			removeLast: 'Obriši zadnju sličicu',
			removeThis: 'Obriši ovu sličicu',
			save: 'Napravi video',
			speed: 'Brzina',
			speeds: { slow: 'Polako', walk: 'Hodom', fast: 'Brzo' },
			strip: 'Sličice',
			frame: (index: number) => `Sličica ${index}`,
			hint: 'Stavi igračku pred kameru i pritisni crveni gumb!',
			hintNext: 'Sad je malo pomakni i opet škljocni.',
			taken: (count: number) => `Snimljena je ${count}. sličica`,
			removed: 'Sličica je obrisana',
			starting: 'Palim kameru…',
			problems: {
				denied: {
					title: 'Kamera nije dopuštena',
					copy: 'U postavkama preglednika dopusti kameru za ovu stranicu, pa pokušaj ponovno.'
				},
				missing: {
					title: 'Nema kamere',
					copy: 'BubbleCam treba kameru, kao što je ona na tabletu ili mobitelu.'
				},
				busy: {
					title: 'Kamera je zauzeta',
					copy: 'Neka druga aplikacija koristi kameru. Zatvori je, pa pokušaj ponovno.'
				},
				unsupported: {
					title: 'Ovaj preglednik ne može koristiti kameru',
					copy: 'Otvori BubbleCam u novijem Safariju, Chromeu, Edgeu ili Firefoxu.'
				}
			},
			retry: 'Pokušaj ponovno'
		},
		video: {
			making: 'Radim tvoj video…',
			progress: (done: number, total: number) => `${done} od ${total}`,
			ready: 'Tvoj crtić je gotov!',
			share: 'Podijeli',
			save: 'Spremi',
			close: 'Zatvori',
			cancel: 'Odustani',
			failed: 'Video nije uspio',
			failedCopy: 'Pokušaj ponovno. Ako opet ne uspije, ažuriraj preglednik.',
			retry: 'Pokušaj ponovno',
			shareTitle: 'Moj BubbleCam crtić',
			fileName: 'bubblecam-crtic'
		}
	}
};
