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
		label: 'Glavna',
		sections: {
			how: 'Kako radi',
			features: 'Što nudi',
			workshop: 'Za vrtiće',
			faq: 'Pitanja'
		},
		open: 'Snimi crtić'
	},
	hero: {
		heading: 'Škljoc, pomak, škljoc.',
		headingAccent: 'I eto crtića!',
		copy: 'BubbleCam je besplatna aplikacija u kojoj djeca od svojih igračaka rade crtiće, sličicu po sličicu. Prethodna sličica lebdi preko kamere kao mali duh, pa se točno vidi koliko pomaknuti medu.',
		open: 'Snimi crtić',
		how: 'Pogledajte kako radi',
		quiet: 'Besplatno. Bez prijave i oglasa, a radi i bez interneta.',
		demo: 'BubbleCam na tabletu: medo skakuće preko slike, a duh njegovog prethodnog položaja korak je iza njega, dok se sličice nižu u traci ispod.'
	},
	how: {
		title: 'Tri koraka do crtića.',
		copy: 'Tako su nastali i prvi crtići: puno mirnih slika, svaka malo drukčija. Kad se brzo izmjenjuju, slike se pokrenu.',
		steps: [
			{
				title: 'Pripremite scenu',
				copy: 'Plišanac, kockice, plastelin ili crtež. Tablet ili mobitel neka miruje, na stalku ili na hrpi knjiga.'
			},
			{
				title: 'Pomaknite i škljocnite',
				copy: 'Igračku pomaknite samo malo i pritisnite crveni gumb. Duh prethodne sličice pokazuje gdje je bila.'
			},
			{
				title: 'Pustite crtić',
				copy: 'Sličice se slože u crtić. Napravite od njega video i pošaljite ga baki.'
			}
		]
	},
	features: {
		title: 'Napravljeno za male ruke.',
		copy: 'Veliki gumbi, gotovo bez riječi i ništa za podešavanje. Snalaze se i djeca koja još ne znaju čitati.',
		ghost: {
			title: 'Duh prethodne sličice',
			copy: 'Prethodna sličica nazire se kroz kameru, pa se svaki pomak lijepo nastavlja i crtić glatko teče.'
		},
		fast: {
			title: 'Škljocajte koliko god brzo želite',
			copy: 'Svaka se sličica spremi u trenu. Nema čekanja, pa zabava nikad ne zastaje.'
		},
		offline: {
			title: 'Radi i bez interneta',
			copy: 'Kad se jednom otvori, BubbleCam radi i bez mreže: u igraonici, na izletu ili u autu.'
		},
		video: {
			title: 'Video za cijelu obitelj',
			copy: 'Jednim dodirom crtić postaje video koji možete spremiti ili poslati u obiteljsku grupu.'
		},
		private: {
			title: 'Sličice ostaju na uređaju',
			copy: 'Ništa se nikamo ne šalje. Nema računa, oglasa ni praćenja, pa ni od nas.'
		},
		free: {
			title: 'Besplatno i otvoreno',
			copy: 'Bez plaćenih dodataka i bez vodenih žigova. Svatko može pogledati kod i vidjeti kako radi.'
		}
	},
	workshop: {
		title: 'Radionica stop-animacije u vrtiću.',
		copy: 'Jedan tablet, nekoliko igračaka i skupina malih redatelja. Uz par trikova prvi crtić sigurno uspije.',
		tipsTitle: 'Savjeti za prvo snimanje',
		tips: [
			'Kamera mora mirovati: stalak, hrpa knjiga ili komadić ljepljive trake.',
			'Neka svjetlo bude stalno. Sunce koje dolazi i odlazi stvara treperenje.',
			'Mali pomaci daju glatko kretanje, a veliki skokovi brzo i živahno.',
			'Ruke van kadra prije svakog škljoca.',
			'Osam sličica čini jednu sekundu crtića.'
		],
		ideasTitle: 'Ideje za početak',
		ideas: [
			{ title: 'Medo ide u šetnju', copy: 'Plišanac skakuće preko stola i maše.' },
			{ title: 'Kockice koje se same slažu', copy: 'Toranj raste kocku po kocku, pa se sruši.' },
			{ title: 'Putovanje plastelinskog puža', copy: 'Puž gmiže po cesti nacrtanoj na papiru.' },
			{ title: 'Crtež koji raste', copy: 'Dodajte crtu, škljocnite, dodajte još jednu.' }
		]
	},
	faq: {
		title: 'Pitanja i odgovori',
		copy: 'Što roditelji i odgojiteljice najčešće pitaju.',
		items: [
			{
				q: 'Treba li mi račun?',
				a: 'Ne. Otvorite BubbleCam i snimajte. Nema prijave i ništa se ne plaća.'
			},
			{
				q: 'Gdje se spremaju crtići?',
				a: 'Na uređaju na kojem su snimljeni, u spremištu preglednika. Nikamo se ne šalju. Ako obrišete podatke preglednika ili uklonite aplikaciju, nestaju i crtići, pa one najdraže spremite kao video.'
			},
			{
				q: 'Radi li bez interneta?',
				a: 'Da. Kad se BubbleCam jednom otvori uz internet, poslije se otvara i radi i bez njega.'
			},
			{
				q: 'Na kojim uređajima radi?',
				a: 'Na tabletima, mobitelima i računalima s kamerom, u novijem Safariju, Chromeu, Edgeu, Firefoxu ili Samsung Internetu. Najbolje radi tablet na stalku.'
			},
			{
				q: 'Kako ga staviti na početni zaslon?',
				a: 'Na iPadu i iPhoneu otvorite BubbleCam u Safariju, dodirnite Dijeli pa Dodaj na početni zaslon. Na Androidu otvorite izbornik Chromea i odaberite Instaliraj aplikaciju ili Dodaj na početni zaslon. Tada se otvara preko cijelog zaslona, kao svaka druga aplikacija. Na iPadu i iPhoneu tako su i crtići sigurniji: Safari može obrisati ono što web stranica sprema ako je tjedan-dva ne otvorite, a aplikacije na početnom zaslonu ne dira.'
			},
			{
				q: 'Što možemo s videom?',
				a: 'Spremite ga u fotografije na uređaju ili ga odmah pošaljite obitelji u aplikaciji za poruke. To je obična MP4 datoteka koja se pokreće bilo gdje.'
			},
			{
				q: 'Je li stvarno besplatno?',
				a: 'Da, potpuno: bez oglasa, bez plaćenih dodataka i bez prikupljanja podataka. BubbleCam je otvorenog koda, a napravio ga je Commit, mali tim koji radi besplatne aplikacije za svakodnevni život.'
			}
		]
	},
	openSource: {
		title: 'Besplatno za svaki vrtić i svaki dom.',
		copy: 'BubbleCam je otvorenog koda i zauvijek besplatan za sve. Napravio ga je Commit, tim koji stoji iza BubbleBoarda, aplikacije koja obitelji malo približi danu njihove djece u vrtiću.',
		code: 'Pogledajte kod',
		write: 'Pišite nam',
		subject: 'BubbleCam',
		bubbleBoard: 'Upoznajte BubbleBoard'
	},
	footer: {
		tagline: 'Igračke oživljavaju, sličicu po sličicu.',
		explore: 'Istražite',
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
