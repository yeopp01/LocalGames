/* Wortschatz für Verräter – und für alles, was später ein Wort zum Beschreiben
   braucht.

   Alles steht als Paar. Das erste Wort ist das der Gruppe, das zweite geht an
   den Doppelgänger. Damit die Variante trägt, muss das Paar eine Eigenschaft
   haben, die sich schwer greifen lässt: nah genug, dass beide Wörter auf
   dieselben Beschreibungen passen ("man trinkt es heiß"), und doch verschieden
   genug, dass es irgendwann auffällt.

   Zu nah taugt nicht (Sofa/Couch – dasselbe Ding), zu weit auch nicht
   (Kaffee/Hubschrauber – der erste Satz verrät alles).

   Wie die Wortliste in woerter.js ist auch diese von Hand geschrieben und
   hängt an keinem fremden Wörterbuch – aus demselben Grund: sonst schlägt
   deren Lizenz auf das ganze Projekt durch.
*/

const Begriffe = (() => {
  const THEMEN = [
    {
      id: 'essen',
      name: 'Essen und Trinken',
      paare: [
        ['Pizza', 'Lasagne'], ['Döner', 'Burger'], ['Pommes', 'Kroketten'],
        ['Kaffee', 'Tee'], ['Bier', 'Wein'], ['Eis', 'Pudding'],
        ['Brötchen', 'Croissant'], ['Suppe', 'Eintopf'], ['Käse', 'Butter'],
        ['Apfel', 'Birne'], ['Schnitzel', 'Frikadelle'], ['Nudeln', 'Reis'],
      ],
    },
    {
      id: 'tiere',
      name: 'Tiere',
      paare: [
        ['Hund', 'Wolf'], ['Katze', 'Luchs'], ['Pferd', 'Esel'],
        ['Kuh', 'Ziege'], ['Huhn', 'Ente'], ['Adler', 'Falke'],
        ['Hai', 'Delfin'], ['Biene', 'Wespe'], ['Maus', 'Ratte'],
        ['Frosch', 'Kröte'], ['Kamel', 'Lama'], ['Schmetterling', 'Motte'],
      ],
    },
    {
      id: 'orte',
      name: 'Orte',
      paare: [
        ['Bahnhof', 'Flughafen'], ['Schwimmbad', 'Badesee'], ['Kino', 'Theater'],
        ['Supermarkt', 'Wochenmarkt'], ['Krankenhaus', 'Arztpraxis'], ['Bibliothek', 'Buchladen'],
        ['Hotel', 'Jugendherberge'], ['Park', 'Wald'], ['Kirche', 'Museum'],
        ['Friseur', 'Nagelstudio'], ['Tankstelle', 'Waschanlage'], ['Baustelle', 'Werkstatt'],
      ],
    },
    {
      id: 'berufe',
      name: 'Berufe',
      paare: [
        ['Arzt', 'Pfleger'], ['Lehrer', 'Erzieher'], ['Polizist', 'Wachmann'],
        ['Koch', 'Bäcker'], ['Pilot', 'Busfahrer'], ['Anwalt', 'Notar'],
        ['Feuerwehrmann', 'Sanitäter'], ['Gärtner', 'Förster'], ['Kellner', 'Barkeeper'],
        ['Schauspieler', 'Moderator'], ['Maler', 'Fliesenleger'], ['Tierarzt', 'Hufschmied'],
      ],
    },
    {
      id: 'sport',
      name: 'Sport',
      paare: [
        ['Fußball', 'Handball'], ['Tennis', 'Badminton'], ['Schwimmen', 'Tauchen'],
        ['Joggen', 'Wandern'], ['Radfahren', 'Motorradfahren'], ['Ski', 'Snowboard'],
        ['Boxen', 'Ringen'], ['Yoga', 'Pilates'], ['Basketball', 'Volleyball'],
        ['Golf', 'Minigolf'], ['Klettern', 'Bouldern'], ['Reiten', 'Kutschfahrt'],
      ],
    },
    {
      id: 'dinge',
      name: 'Dinge im Haus',
      paare: [
        ['Regenschirm', 'Sonnenschirm'], ['Brille', 'Kontaktlinsen'], ['Schlüssel', 'Chipkarte'],
        ['Handy', 'Tablet'], ['Kissen', 'Decke'], ['Zahnbürste', 'Zahnseide'],
        ['Staubsauger', 'Besen'], ['Waschmaschine', 'Spülmaschine'], ['Wecker', 'Kalender'],
        ['Geldbeutel', 'Rucksack'], ['Kerze', 'Taschenlampe'], ['Spiegel', 'Fenster'],
      ],
    },
    {
      id: 'urlaub',
      name: 'Urlaub',
      paare: [
        ['Strand', 'Hotelpool'], ['Zelt', 'Wohnwagen'], ['Koffer', 'Reisetasche'],
        ['Sonnencreme', 'Mückenspray'], ['Postkarte', 'Souvenir'], ['Kreuzfahrt', 'Fähre'],
        ['Reisepass', 'Personalausweis'], ['Wanderung', 'Stadtführung'], ['Ferienwohnung', 'Hotelzimmer'],
        ['Schnorcheln', 'Surfen'], ['Berghütte', 'Almwiese'], ['Flugticket', 'Bahnticket'],
      ],
    },
    {
      id: 'arbeit',
      name: 'Schule und Büro',
      paare: [
        ['Tafel', 'Whiteboard'], ['Hausaufgabe', 'Überstunde'], ['Zeugnis', 'Gehaltszettel'],
        ['Pause', 'Feierabend'], ['Klassenfahrt', 'Betriebsausflug'], ['Lineal', 'Tacker'],
        ['Referat', 'Präsentation'], ['Mensa', 'Kantine'], ['Schulbus', 'Firmenwagen'],
        ['Direktor', 'Chef'], ['Federmäppchen', 'Aktenkoffer'], ['Nachsitzen', 'Abmahnung'],
      ],
    },
    {
      id: 'musik',
      name: 'Musik und Feiern',
      paare: [
        ['Konzert', 'Festival'], ['Gitarre', 'Ukulele'], ['Klavier', 'Orgel'],
        ['Schlagzeug', 'Cajon'], ['Chor', 'Band'], ['Kopfhörer', 'Lautsprecher'],
        ['Karaoke', 'Playback'], ['Geburtstag', 'Hochzeit'], ['Tanzfläche', 'Bühne'],
        ['Trompete', 'Posaune'], ['Radio', 'Podcast'], ['Silvester', 'Karneval'],
      ],
    },
    {
      id: 'natur',
      name: 'Wetter und Natur',
      paare: [
        ['Regen', 'Nieselregen'], ['Schnee', 'Hagel'], ['Gewitter', 'Sturm'],
        ['Sonne', 'Mond'], ['Nebel', 'Rauch'], ['Fluss', 'Bach'],
        ['Berg', 'Hügel'], ['Wüste', 'Steppe'], ['Vulkan', 'Geysir'],
        ['Regenbogen', 'Nordlicht'], ['Herbst', 'Frühling'], ['Eiszapfen', 'Tropfstein'],
      ],
    },
  ];

  /* Alle Paare am Stück – für „bunt gemischt", die vorgegebene Wahl. */
  const ALLE = THEMEN.flatMap((t) => t.paare);

  const nachId = (id) => THEMEN.find((t) => t.id === id) || null;
  const paareVon = (id) => (id && nachId(id) ? nachId(id).paare : ALLE);

  return { THEMEN, ALLE, nachId, paareVon };
})();
