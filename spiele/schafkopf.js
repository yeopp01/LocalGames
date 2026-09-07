/* Schafkopf – bayrisch, zu viert, gegen drei Rechner.

   Die Regeln und der Rechner stehen in spiele/karten.js; hier steht der Tisch.
   Diese Datei kümmert sich um Gabe, Ansage, die acht Stiche, die Abrechnung –
   und um das, was den Unterschied zum bloßen Kartenspiel macht: die Hinweise.

   Drei Stufen, oben unter der Glühbirne einstellbar:

     aus        nichts, nur die Regeln
     Tipp       ein Knopf, der auf die richtige Karte zeigt und sagt, warum
     Mitlesen   nach jeder deiner Karten ein Urteil, und am Ende die Bilanz

   Der Hinweisgeber rechnet aus deiner Sicht. Er sieht dein Blatt und alles,
   was liegt – die Karten der anderen sieht er nicht. Ein Tipp kann deshalb
   danebengehen; er ist der beste Zug nach dem, was man wissen kann, und nicht
   der beste Zug nach dem, was zufällig der Fall ist. Andersherum wäre es
   Betrug und als Lehrer wertlos: Man lernt nichts von jemandem, der schummelt.
*/

(() => {
  const K = Karten;

  const NAMEN = ['du', 'Vroni', 'Sepp', 'Resi'];
  const PLATZ = ['unten', 'links', 'oben', 'rechts'];
  const ICH = 0;

  const DENKZEIT = 620;      // wie lang ein Rechner "überlegt"
  const STICHZEIT = 1250;    // wie lang ein voller Stich liegen bleibt

  /* Die vier Farbzeichen. Selbst gezeichnet – die Illustrationen eines
     gedruckten Kartensatzes hängen an fremden Rechten, und dieses Projekt ist
     bewusst frei davon. Übernommen sind Aufbau und Farbgebung des bayrischen
     Blatts; die sind Allgemeingut und seit dem 19. Jahrhundert dieselben.

     Und die sind anders, als man denkt: Die Eichel ist nicht braun. Ihre
     Frucht ist grün, die Kappe gold mit rotem Band. Braun kommt auf dem
     ganzen Blatt nicht vor – ein brauner Eichel-Ober sieht aus wie eine
     Eichel im Wald und nicht wie eine auf einer Karte.

     Jedes Zeichen lebt in einem Feld von 24 × 24 und wird zum Setzen nur
     verschoben, gedreht und skaliert. Die dunkle Kontur ist keine Zierde: bei
     zwanzig Pixeln hält sie die Form zusammen, und das gedruckte Blatt macht
     es genauso. */
  const ZEICHEN = [
    /* Eichel: die goldene Frucht mit der Spitze nach oben, darunter der
       gruene Kelch, unten der Stiel. So steht sie auf dem gedruckten Blatt -
       nicht so, wie sie am Baum haengt.

       Zwei Fehler steckten vorher darin, und sie sind verschieden: Die
       Richtung war falsch, die Frucht hing nach unten. Und die Farben sassen
       an den falschen Teilen - der Kelch ist gruen, die Frucht ist gold, nie
       umgekehrt.

       Die Frucht ist kein Kegel, sondern eine Kapsel: gerade Flanken, oben
       eine halbrunde Kuppe. Ein spitz zulaufendes Zeichen las sich als
       Flamme, ein gedrungenes als Pilzkappe auf einem Bauch - erst die
       geraden Seiten machen daraus eine Frucht, die im Kelch steckt. Ganze
       21,8 hoch auf 11,6 breit im Feld von 24, also fast doppelt so hoch wie
       breit. Im Faecher, wo vom Zeichen nur der linke Streifen zu sehen ist,
       entscheidet genau diese Flanke - sie ist gerade, die der Schelle
       daneben rund. */
    '<path class="sk-dunkel" d="M11.2 19.4h1.6v3.6h-1.6z"/>'
      + '<path class="sk-gold" d="M7.8 14.6V5.4a4.2 4.2 0 0 1 8.4 0v9.2z"/>'
      + '<rect class="sk-rot" x="7.9" y="11.9" width="8.2" height="2"/>'
      + '<path class="sk-gruen" d="M6.2 14.3h11.6c0 3.1-2.6 5.6-5.8 5.6s-5.8-2.5-5.8-5.6z"/>',
    /* Gras: das gruene Laub mit goldener Rippe. */
    '<path class="sk-gruen" d="M12 2.3c3.4 4.5 8 7 8 11.1a4.1 4.1 0 0 1-6.7 3.2c.3 1.9.9 3.2 2 4.4H8.7c1.1-1.2 1.7-2.5 2-4.4A4.1 4.1 0 0 1 4 13.4C4 9.3 8.6 6.8 12 2.3z"/>'
      + '<path class="sk-rippe" d="M12 20V7"/>',
    /* Herz. */
    '<path class="sk-rot" d="M12 21.3C6.4 17.2 3.3 14 3.3 10.2A4.7 4.7 0 0 1 12 7.7a4.7 4.7 0 0 1 8.7 2.5c0 3.8-3.1 7-8.7 11.1z"/>',
    /* Schellen: die Falkenschelle - runder goldener Koerper, oben die Oese
       zum Anbinden, quer der Schlitz mit den beiden Loechern, unten das Loch
       fuer den Kloeppel. Die Oese ist wieder da: sie war frueher als
       Eichelstiel zu lesen, aber der Stiel der Eichel steht jetzt unten, und
       damit ist der Knubbel oben eindeutig eine Schelle. Ein runder Koerper
       allein war es nicht - der las sich als Muenze. */
    '<rect class="sk-gold" x="9.6" y="2.4" width="4.8" height="5" rx="1.4"/>'
      + '<circle class="sk-punkt" cx="12" cy="4.4" r=".95"/>'
      + '<circle class="sk-gold" cx="12" cy="14.2" r="7.8"/>'
      + '<rect class="sk-rot" x="5.6" y="13.1" width="12.8" height="2.2" rx="1.1"/>'
      + '<circle class="sk-punkt" cx="7.2" cy="14.2" r="1.35"/>'
      + '<circle class="sk-punkt" cx="16.8" cy="14.2" r="1.35"/>'
      + '<circle class="sk-rot" cx="12" cy="18.7" r="1.7"/>',
  ];


  /* ------------------------------------------------------- Das Regelwerk

     Was der Rechner spielt, in Worten - nach Spielart und Rolle getrennt,
     weil dieselbe Regel darin verschieden liegt. Jede Zahl dahinter ist
     gemessen: gepaarte Partien mit und ohne die Regel, dazu der Bereich, in
     dem der wahre Wert mit 95 Prozent liegt.

     Die Liste steht hier und nicht nur im README, weil sie zum Spiel gehoert:
     Wer lernen will, soll nachlesen koennen, wonach die drei am Tisch
     entscheiden. Auch das, was sich als falsch erwiesen hat - die verworfenen
     Merksaetze sind der lehrreichere Teil. */
  const REGELWERK = [
    { kopf: 'Ansagen', regeln: [
      { titel: 'Nicht schätzen, sondern durchspielen',
        gilt: 'alle Spielarten',
        text: 'Ob ein Blatt reicht, rechnet der Rechner nicht aus einer Punktetabelle, '
          + 'sondern spielt es 600-mal probeweise durch und zählt, wie oft 61 Augen '
          + 'zusammenkommen. Die gerufene Sau liegt schließlich irgendwo, und wo, weiß '
          + 'beim Ansagen niemand.' },
      { titel: 'Ein Alleinspiel braucht deutlich mehr als die Hälfte',
        gilt: 'Solo, Wenz, Geier',
        text: 'Ein Sauspiel wird ab 50 von 100 angesagt, ein Alleinspiel erst ab 72. '
          + 'Rechnerisch wäre weniger schon lohnend – bei 62 wird aber jede vierte Gabe '
          + 'allein gespielt, bei 72 jede siebte. Das kommt dem näher, wie am Tisch '
          + 'wirklich gespielt wird.' },
      { titel: 'Bei Gleichstand die Farbe rufen, in der deine Augen stehen',
        gilt: 'Sauspiel',
        text: 'Sind zwei Rufe rechnerisch nicht zu unterscheiden, entscheidet, wo die '
          + 'eigenen Augen liegen. Die gerufene Sau gehört dem Partner: Wird die Farbe '
          + 'angespielt, muss er sie legen und nimmt den Stich – dein Zehner fällt damit '
          + 'euch zu statt den anderen.',
        zahl: 'Der Zehner landet zu 71 % bei der eigenen Partei statt zu 41 %.' },
    ] },
    { kopf: 'Anspielen', regeln: [
      { titel: 'Den höchsten Trumpf ziehen, der noch draußen ist',
        gilt: 'alle Rollen, alle Spielarten',
        text: 'Hast du den höchsten Trumpf, der noch im Spiel ist, spielst du ihn an – '
          + 'auch wenn es dein einziger ist. Er holt den Stich und dazu das Anspiel, und '
          + 'jeder Trumpf, den du herausziehst, kann dir später keinen Stich mehr wegnehmen.',
        zahl: '+0,56 ± 0,36 beim Sauspiel, +0,63 ± 0,32 beim Solo.' },
      { titel: 'Nachspielen, wo dein Mitspieler frei ist – mit einer hohen Karte',
        gilt: 'Solo, Gegenpartei',
        text: 'Ist einer deiner Mitspieler in einer Farbe schon frei und hat noch Trumpf, '
          + 'spielst du diese Farbe an. Er sticht, und die Augen fallen euch zu. '
          + 'Entscheidend ist die hohe Karte: Mit der kleinsten verbrennt er einen Trumpf '
          + 'für einen Stich ohne Augen.',
        zahl: '+3,2 und +3,8 für die Gegenpartei, zweimal unabhängig gemessen. Mit '
          + 'kleiner Karte kehrt es sich um: dann kostet dieselbe Regel 5,0 bis 5,5.' },
      { titel: 'Die blanke Sau anspielen, solange die Farbe läuft',
        gilt: 'Sauspiel und Solo – nicht als Alleinspieler bei Wenz und Geier',
        text: 'Wartest du, ist irgendwann jemand blank und sticht sie weg. Beim Wenz und '
          + 'Geier gilt es für den Alleinspieler nicht: Dort sind nur vier Karten Trumpf, '
          + 'die Farben sind lang, und wer vorlegt, legt dem Gegner vor.',
        zahl: 'Die Ausnahme bringt dem Wenz-Spieler 3,4 Punkte, dem Geier-Spieler 2,8.' },
      { titel: 'Beim Solo nicht in eine Farbe, in der jemand frei ist',
        gilt: 'Solo, alle Rollen',
        text: 'Dort fällt die Sau samt allem, was noch daraufkommt. Die naheliegende '
          + 'Abhilfe – als Spielerpartei erst Trumpf ziehen und die Sau so lange halten – '
          + 'ist gemessen schlechter. Die Farbe zu meiden trifft es, das Warten nicht.',
        zahl: 'Farbe meiden: Spieler +0,20 ± 0,13, Gegenpartei +0,98 ± 0,44. Erst Trumpf '
          + 'ziehen und warten kostet dagegen: Spieler −0,51, Mitspieler −1,88.' },
      { titel: 'Die Rufsau nie mit dem Zehner suchen',
        gilt: 'Sauspiel, Gegenpartei',
        text: 'Spielst du die gerufene Farbe an, muss der Partner die Sau legen – aber wer '
          + 'in der Farbe frei ist, sticht darüber. Dann fallen dein Zehner und die Sau '
          + 'zusammen: 21 Augen auf einen Schlag, und zwar an die Gegenseite. Suchen darf '
          + 'man, aber nur mit einer Karte, die nichts kostet.',
        zahl: 'In der Faustregel ändert das Verbot nichts (±0,00): Sie spielt die '
          + 'Rufffarbe ohnehin nie teuer an. Der Merksatz steht hier für den Menschen.' },
      { titel: 'Im ersten Stich nicht auf Biegen und Brechen Trumpf ziehen',
        gilt: 'alle Rollen',
        text: 'Auch als Spieler nicht. Im ersten Stich ist noch niemand blank, und eine '
          + 'kleine Farbkarte kostet dort weniger als ein Trumpf, den man später braucht. '
          + 'Für die Gegenpartei ist es geradezu verheerend – sie spielt dem Alleinspieler '
          + 'damit die Trümpfe frei.',
        zahl: 'Erzwungener Trumpf im ersten Stich kostet den Spieler 0,58 ± 0,34 – und '
          + 'die Gegenpartei 3,0 im Rufspiel und 10,2 beim Solo. Für sie ist es der '
          + 'teuerste Fehler, den das Regelwerk kennt.' },
      { titel: 'Sonst die kurze Farbe klein anspielen',
        gilt: 'alle',
        text: 'Danach bist du dort blank und kannst beim nächsten Mal stechen.' },
    ] },
    { kopf: 'Stechen', regeln: [
      { titel: 'Mit der teuersten Karte, die hält',
        gilt: 'alle Rollen, alle Spielarten',
        text: 'Nicht mit der billigsten. Die Augen deiner eigenen Karte fallen in deinen '
          + 'Stich, wenn er hält – eine teure Karte ist dort keine Ausgabe, sondern eine '
          + 'Verwahrung. Was eine Karte wirklich kostet, ist ihr Rang: die Kontrolle, die '
          + 'du hergibst.',
        zahl: 'Sauspiel +1,9 · Herz-Solo +7,6 · Wenz ±0, dort gibt es nur vier Trümpfe.' },
      { titel: 'Außer sie ist der höchste Trumpf, den es noch gibt',
        gilt: 'alle',
        text: 'Der holt später selbst einen Stich. Ihn für einen herzugeben, den auch eine '
          + 'kleinere Karte holt, ist ein schlechtes Geschäft.' },
      { titel: 'Wie fett der Stich schon ist, spielt keine Rolle',
        gilt: 'alle',
        text: 'Klingt falsch, ist aber so: Du holst den Stich mit beiden Karten, die Augen '
          + 'darin fallen so oder so dir zu. Was allein zählt, ist, welche der beiden du '
          + 'lieber behältst.',
        zahl: 'Das Kriterium wegzulassen brachte beiden Parteien rund einen halben Punkt.' },
    ] },
    { kopf: 'Schmieren', regeln: [
      { titel: 'Hält der Stich, alles drauf – hält er nicht, höchstens ein Unter',
        gilt: 'alle Rollen',
        text: 'Ein König war zu viel: vier Augen, die die Gegenpartei mitnimmt, wenn doch '
          + 'noch jemand drüberkommt.',
        zahl: 'Zusammen mit der nächsten Regel: Spieler +1,59 ± 0,38, Mitspieler '
          + '+0,82 ± 0,28, Gegenpartei +2,07 ± 0,46. Beim Solo +6,0 für die Gegenpartei – '
          + 'der größte Einzelgewinn im ganzen Regelwerk.' },
      { titel: 'Nie den höchsten Trumpf schmieren',
        gilt: 'alle – auch als Letzter im Stich',
        text: 'Unter dem Trumpf des Partners ist er verschenkt. Das gilt sogar dann, wenn '
          + 'der Stich absolut sicher ist: Er ist einen künftigen Stich wert, unabhängig '
          + 'vom jetzigen.',
        zahl: 'Ihn als Letzter doch zu schmieren kostet 0,3 bis 0,4.' },
      { titel: 'Den eigenen Stich übernehmen, um das Anspiel zu bekommen',
        gilt: 'Wenz und Geier, Gegenpartei',
        text: 'Gehört der Stich schon uns, ändert es an den Augen nichts, ob du ihn '
          + 'draufwirfst oder selbst holst – sie fallen so oder so eurer Partei zu. Der '
          + 'Unterschied ist das Anspiel: Wer danach ausspielt, kann die Farbe wählen, in '
          + 'der ein Mitspieler frei ist. Im Rufspiel kostet dasselbe, dort nimmt man dem '
          + 'Partner die Führung weg und gewinnt zu wenig dafür.',
        zahl: 'Wenz +0,77 ± 0,29, Geier +0,83 ± 0,28 für die Gegenpartei, zweimal '
          + 'gemessen. Im Rufspiel kostet dasselbe: Mitspieler −0,92, Spieler −0,21.' },
      { titel: 'Nicht unterstechen – außer als Mitspieler mit einem Trumpf, der drüberkommt',
        gilt: 'alle Rollen, aber verschieden',
        text: 'Gehört der Stich schon uns und bist du in der angespielten Farbe frei, '
          + 'darfst du abwerfen oder Trumpf drauflegen. Für den Spieler und die Gegenpartei '
          + 'gilt: gar kein Trumpf – ihre Trümpfe sind später mehr wert als ein Stich, den '
          + 'die eigene Partei ohnehin hält. Für den Ruf-Mitspieler nicht: Er hält öfter '
          + 'einen Trumpf, der den Stich gewinnt – etwa die Herz-Sau über dem Achter des '
          + 'Spielers. Damit bringt er elf Augen sicher unter, statt sie in der Hand zu '
          + 'behalten, wo sie noch acht höheren Trümpfen begegnen. Ein Trumpf, der '
          + 'drüberkommt, ist eben kein Unterstechen.',
        zahl: 'Gegen die Fassung ohne Unterschied: Spieler +0,49 ± 0,29, Mitspieler '
          + '+0,28 ± 0,21, Gegenpartei +0,10.' },
    ] },
    { kopf: 'Abwerfen', regeln: [
      { titel: 'Die kurze Farbe blank machen',
        gilt: 'alle',
        text: 'Nicht aus der langen werfen. Bist du in einer Farbe blank, kannst du dort '
          + 'stechen.',
        zahl: 'Die Gegenprobe kostet: Aus der langen Farbe zu werfen bringt der '
          + 'Gegenpartei 0,2 Punkte weniger beim Rufspiel und 0,5 weniger beim Solo.' },
      { titel: 'Trumpf hält man, Sau und Zehner wirft man nicht',
        gilt: 'alle',
        text: 'Vier Stellschrauben dieser Formel wurden durchgemessen – keine ließ sich '
          + 'verbessern. Was dort steht, stimmt.' },
    ] },
    { kopf: 'Wann Trumpf anspielen', regeln: [
      { titel: 'Die eine Frage, die fast alles entscheidet',
        gilt: 'alle Rollen, alle Spielarten',
        text: 'Hältst du den höchsten Trumpf, der überhaupt noch draußen ist? Aus 1480 '
          + 'Anspielen, bei denen der Rechner zwischen Trumpf und Farbe wählen konnte, '
          + 'sagt dieses eine Merkmal fast alles voraus.',
        zahl: 'Mit Chef-Trumpf: Spieler 96 %, Mitspieler 94 %, Gegenspieler 92 % Trumpf. '
          + 'Ohne: 29 %, 16 %, 3 %.' },
      { titel: 'Die Ausnahme: wenn die Gegner keinen Trumpf mehr haben',
        gilt: 'alle Rollen',
        text: 'Dann zieht man niemandem mehr etwas heraus, und der höchste Trumpf ist als '
          + 'Stichkarte für später besser aufgehoben. Das ist die einzige Lage, in der man '
          + 'den Chef-Trumpf nicht anspielt.',
        zahl: 'Mit Chef-Trumpf, aber trumpffreien Gegnern: nur noch 3 % Trumpf statt 96 %.' },
      { titel: 'Als Gegenspieler ohne den höchsten Trumpf: gar kein Trumpf',
        gilt: 'Gegenpartei',
        text: 'Die schärfste Regel im ganzen Spiel. Wer als Gegenspieler Trumpf anspielt, '
          + 'ohne den höchsten zu halten, spielt dem Alleinspieler die Trümpfe frei.',
        zahl: 'In 398 solchen Lagen spielt der Rechner 3 % Trumpf. 89 Prozent aller '
          + 'Anspiele der Gegenpartei folgen allein dieser einen Frage.' },
      { titel: 'Als Spieler ohne den höchsten Trumpf: je später, desto weniger',
        gilt: 'Spieler',
        text: 'Früh und wenn ohnehin schon wenig fremder Trumpf unterwegs ist, lohnt es '
          + 'noch etwa jedes zweite Mal. Ab der Mitte des Spiels praktisch nicht mehr.',
        zahl: 'Früh mit wenig fremdem Trumpf 58 %, früh mit viel 25 %, ab Stich 5 nur '
          + 'noch 7 %.' },
      { titel: 'Und wo keine Regel mehr hilft',
        gilt: 'zur Einordnung',
        text: 'Von den 1480 Anspielen fallen 59 Prozent in Lagen, in denen der Rechner sich '
          + 'zu über neun Zehnteln einig ist – die lassen sich als Regel aufschreiben. Die '
          + 'übrigen 41 Prozent sind echte Abwägungen, in denen es auf die einzelnen Karten '
          + 'ankommt und keine Zusammenfassung mehr trägt. Der Versuch, die 58-Prozent-Lage '
          + 'trotzdem zur Regel zu machen, wurde gemessen und kostet.',
        zahl: 'Fassbar: Gegenspieler 89 %, Spieler 54 %, Mitspieler 27 %. Die erzwungene '
          + 'Regel für die offene Lage: Spieler −0,15, Gegenpartei −0,79.' },
    ] },
    { kopf: 'Zu selten zum Messen', regeln: [
      { titel: 'Sich trumpffrei machen',
        gilt: 'Solo, Gegenpartei – ein echter Sonderfall',
        text: 'Man ist hinten dran, der Alleinspieler sticht mit etwas Höherem, als man '
          + 'selbst hat. Dann wirft man den kleinen Trumpf trotzdem hinein, um trumpffrei '
          + 'zu werden: Beim nächsten Trumpfstich muss man dann nicht zugeben, sondern '
          + 'kann schmieren. Es lohnt nur, wenn mit dem eigenen Trumpf ohnehin nichts mehr '
          + 'zu holen ist und man Augen auf der Hand hat, die weg sollen.',
        zahl: 'Nicht eingebaut, weil nicht prüfbar. Eine großzügige Fassung greift in 17 '
          + 'von 1000 Gaben, und selbst darauf ist die Wirkung nicht von Rauschen zu '
          + 'trennen (+2,4 ± 2,2). Die enge Fassung kommt zweimal in tausend Gaben vor – '
          + 'dafür bräuchte es etwa das Sechzigfache an Partien. Dass sie stimmt, ist gut '
          + 'möglich; hier steht sie, damit sie nicht vergessen wird.' },
    ] },
    { kopf: 'Was nicht gilt', aus: true, regeln: [
      { titel: 'Als Gegenspieler immer die Rufsau suchen',
        gilt: 'Sauspiel',
        text: 'Klingt zwingend – man will ja wissen, wer zu wem gehört. Stur angewandt '
          + 'kostet es die Gegenpartei aber Punkte.',
        zahl: 'Kostet die Gegenpartei 1,2 Punkte, über 4000 gepaarte Sauspiele.' },
      { titel: 'Immer Trumpf ziehen – ohne hinzusehen',
        gilt: 'alle',
        text: 'Achtung, das ist kein Argument gegen das Trumpfziehen. Der Rechner zieht als '
          + 'Spielerpartei sehr wohl Trumpf: beim Solo in 79 von 100 Anspielen, beim Sauspiel '
          + 'in 43. Falsch ist nur, es ohne Bedingung zu tun. Schreibt man „immer den höchsten '
          + 'Trumpf voraus" fest, gewinnt man in den Lagen, wo es passt, weniger dazu, als man '
          + 'in den übrigen verliert. Was zählt, ist die Bedingung: Hast du den höchsten '
          + 'Trumpf, der noch draußen ist? Dann ja, und das steht oben unter Anspielen.',
        zahl: 'Ohne Bedingung: Sauspiel −1,9 · Herz-Solo −4,2.' },
      { titel: 'Kurzer Weg – lange Farbe, langer Weg – kurze Farbe',
        gilt: 'alle',
        text: 'In der engen Fassung, die nur zwischen den Farben entscheidet, ohne messbare '
          + 'Wirkung. Als Vorrang über alles – auch über das Trumpfziehen – schadet sie.',
        zahl: 'eng: ±0,4 · als Vorrang: −3,2 bis −3,9.' },
      { titel: 'Nachspielen auch im Rufspiel',
        gilt: 'Rufspiel',
        text: 'Die Regel, in eine Farbe zu spielen, in der der Partner frei ist, trägt beim '
          + 'Solo deutlich – im Rufspiel nicht. Dort weiß man lange nicht sicher, wer der '
          + 'Partner ist, und der Stich, den er trumpft, ist einer, den die eigene Partei '
          + 'oft ohnehin bekommen hätte.',
        zahl: 'Mitspieler −0,68 ± 0,60.' },
      { titel: 'Nachspielen als allgemeine Regel',
        gilt: 'alle',
        text: 'Die Farbe der eigenen Partei einfach fortzusetzen bringt nichts. Erst mit der '
          + 'Bedingung „der Mitspieler ist dort frei" und einer hohen Karte wird eine Regel '
          + 'daraus – und auch dann nur beim Solo.',
        zahl: '±0,4, kein Unterschied.' },
      { titel: 'Als Spieler die blanke Sau aufheben',
        gilt: 'alle',
        text: 'Erst Trumpf ziehen und die Sau bis dahin halten klingt vernünftig und kostet. '
          + 'Der Schaden kommt nicht vom frühen Anspielen, sondern von der Farbe, in der '
          + 'schon jemand frei ist – die meidet man, statt zu warten.',
        zahl: 'Spieler −0,51 ± 0,20, Mitspieler −1,88 ± 0,43 über 20000 Gaben.' },
    ] },
  ];

  const sauKarteVon = (sp) => (sp && sp.art === 'sau' ? K.karte(sp.farbe, 0) : -1);

  /* ------------------------------------------------------- Das Kartenbild

     Das Bild in der Mitte, in einem Feld von 34 × 46. Die Bauweise ist die des
     gedruckten Blatts, nur die Striche sind eigene:

       Zahlkarten tragen ihr Zeichen so oft, wie sie heißen. Sieben Eicheln
       sehen anders aus als neun, ohne dass man den Buchstaben liest – und
       nebenbei sagt das Bild schon, was die Karte wert ist: viele kleine
       Zeichen heißt wertlos, ein großes heißt Sau.

       Ober und Unter heißen so, weil das Farbzeichen bei der Figur oben
       beziehungsweise unten steht. Genau das machen sie hier auch. Das ist
       die einzige Unterscheidung, die man am Rand eines Fächers noch sieht,
       und sie ist die, die den Karten ihre Namen gab.

       Der Zehner trägt sein römisches X wie auf dem gedruckten Blatt, aus dem
       Zeichen ausgespart.
  */

  /* kopf = auf den Kopf gestellt. Die untere Hälfte einer Zahlkarte trägt
     ihre Zeichen gedreht, so wie auf dem gedruckten Blatt – die Karte liest
     sich dann von beiden Seiten gleich. */
  const zeichenSetzen = (f, x, y, g, kopf) => '<g transform="translate(' + x + ' ' + y
    + ') scale(' + g + ')' + (kopf ? ' rotate(180)' : '') + ' translate(-12 -12)">'
    + ZEICHEN[f] + '</g>';

  /* Die Anordnungen der Zahlkarten – zwei Spalten wie auf dem Blatt, bei
     ungerader Zahl eine Reihe in der Mitte. Die Mittelachse liegt bei 23. */
  const REIHEN = {
    7: [[11, 10], [23, 10], [8, 23], [17, 23], [26, 23], [11, 36], [23, 36]],
    8: [[11, 8], [23, 8], [11, 18], [23, 18], [11, 28], [23, 28], [11, 38], [23, 38]],
    9: [[11, 10], [17, 10], [23, 10], [11, 23], [17, 23], [23, 23], [11, 36], [17, 36], [23, 36]],
  };

  /* Die Figur für Ober und Unter. Kopf und Schultern allein sahen aus wie ein
     Benutzersymbol – erst der Hut macht daraus eine Kartenfigur. Sie ist
     bunt und keine Silhouette: auf dem gedruckten Blatt trägt der Ober einen
     roten Rock unter goldenem Hut, und eine schwarze Figur neben einem
     farbigen Zeichen sieht aus, als fehle ihr die Farbe. Sie steht in
     der Hälfte, die das Farbzeichen frei lässt: beim Ober also unten, beim
     Unter oben. Genau daher kommen die beiden Namen.

     Ausgemalt ist sie mit denselben drei Farben wie die Zeichen, mehr hat
     das Blatt nicht: roter Rock, gruener Kragen, goldener Hut mit rotem
     Band, braunes Haar darunter. Das Gesicht bleibt leer – bei acht
     Millimetern Kopf werden Augen zu Schmutz. */
  function figur(unten) {
    const o = unten ? 24 : 0;
    const y = (v) => v + o;
    /* Von unten nach oben gemalt, so wie sich die Teile ueberdecken: Rock,
       Kragen, Knopfleiste, Kopf, Haar, Krempe, Hut, Hutband. */
    return '<path class="sk-rock" d="M9 ' + y(22) + 'c0-4.5 3.6-7.4 8-7.4s8 2.9 8 7.4z"/>'
      + '<path class="sk-gruen" d="M12.6 ' + y(15.4) + 'L17 ' + y(19.6) + 'l4.4-4.2 1.9 1.4L17 '
        + y(22) + 'l-6.3-5.2z"/>'
      + '<rect class="sk-gold" x="16.2" y="' + y(15.8) + '" width="1.6" height="3.6" rx=".6"/>'
      + '<circle class="sk-haut" cx="17" cy="' + y(11.4) + '" r="3.8"/>'
      + '<path class="sk-dunkel" d="M10.9 ' + y(7.8) + 'h12.2v1.5c0 1.6-2.7 2.7-6.1 2.7s-6.1-1.1-6.1-2.7z"/>'
      + '<rect class="sk-gold" x="8.4" y="' + y(5.9) + '" width="17.2" height="2" rx="1"/>'
      + '<path class="sk-gold" d="M13.2 ' + y(5.9) + 'l.8-4.1a9 9 0 0 1 6 0l.8 4.1z"/>'
      + '<rect class="sk-rot" x="13.2" y="' + y(3.6) + '" width="7.6" height="1.6"/>';
  }

  function kartenBild(f, w) {
    if (w === 0) return zeichenSetzen(f, 17, 23, 1.4);                 // Sau
    if (w === 1) {                                                     // Zehner
      /* Das römische X steht auf dem gedruckten Blatt oben und unten in der
         Mitte – nicht über dem Farbzeichen. Quer durchs Bild gemalt macht es
         die Karte nur unleserlich. */
      return '<path class="sk-xmark" d="M13.6 2.4l6.8 6.2M20.4 2.4l-6.8 6.2'
        + 'M13.6 37.4l6.8 6.2M20.4 37.4l-6.8 6.2"/>'
        + zeichenSetzen(f, 17, 23, 1.2);
    }
    if (w === 2) {                                                     // König mit Krone
      return '<path class="sk-hut" d="M6.5 15.5l2-8.5 4.2 4.6L17 4l4.3 7.6 4.2-4.6 2 8.5z"/>'
        /* Drei Steine auf den Zacken. Ohne sie ist die Krone eine Zackenlinie,
           mit ihnen liest sie sich auch dann noch als Krone, wenn die Karte
           halb verdeckt im Faecher steckt. */
        + '<circle class="sk-rot" cx="8.5" cy="6.4" r="1.4"/>'
        + '<circle class="sk-rot" cx="17" cy="3.4" r="1.5"/>'
        + '<circle class="sk-rot" cx="25.5" cy="6.4" r="1.4"/>'
        + '<rect class="sk-gruen" x="6.5" y="17" width="21" height="3" rx="1.2"/>'
        + zeichenSetzen(f, 17, 33, 1.02);
    }
    if (w === 3) return zeichenSetzen(f, 17, 11, 0.86) + figur(true);   // Ober: Zeichen oben
    if (w === 4) return figur(false) + zeichenSetzen(f, 17, 35, 0.86, true); // Unter: Zeichen unten
    const n = w === 5 ? 9 : w === 6 ? 8 : 7;
    return REIHEN[n].map(([x, y]) => zeichenSetzen(f, x, y, 0.43, y > 23)).join('');
  }

  /* ------------------------------------------------------------------ Spiel */

  function starten(wurzel, s) {
    const el = s.el;
    let stand = laden();
    let denkt = false;
    let uhren = [];
    let tipp = null;         // { karte, text, quote }
    let vorabRat = null;     // Bewertung deines Zuges, im Voraus gerechnet
    let vorabFuer = -1;      // für welchen Stich sie gilt

    const spaeter = (tun, ms) => { uhren.push(setTimeout(tun, ms)); };
    const uhrenAus = () => { for (const u of uhren) clearTimeout(u); uhren = []; };

    /* ---------------------------------------------------------- Spielstand */

    function frisch(alt) {
      return {
        phase: 'ansage',
        geber: alt ? (alt.geber + 1) % 4 : 3,   // damit du die erste Vorhand hast
        haende: [[], [], [], []],
        start: [[], [], [], []],
        spielart: null, spieler: -1, partner: -1,
        gebote: [], zeiger: 0,
        stiche: [], aktuell: { start: 0, karten: [] }, stichFertig: false,
        amZug: 0, sauWeg: false, davon: false,
        begonnen: Date.now(),
        hilfen: 0, treffer: 0, gezaehlt: 0, zurueck: 0,
        rueckstand: null,        // Stand vor deiner letzten Karte
        abrechnung: null,
        lehre: alt ? alt.lehre : 'tipp',
        konto: alt ? alt.konto.slice() : [0, 0, 0, 0],
        gaben: alt ? alt.gaben : 0,
        notiz: null,
      };
    }

    /* Geht der gespeicherte Stand überhaupt auf? Jede der 32 Karten muss
       genau einmal vorkommen – auf einer Hand, in einem fertigen Stich oder
       auf dem Tisch. Ein Stand aus einer älteren Fassung oder eine halb
       geschriebene Sicherung kann das verletzen, und dann rechnet der Rechner
       an einer Lage, die es nicht geben kann: Er verteilt Karten auf Hände,
       die schon voll sind, und bricht mitten im Zug ab. Auf dem Schirm bleibt
       dann „überlegt …" stehen, für immer.

       Lieber neu geben als das. Eine Gabe ist schnell nachgeholt, ein
       eingefrorenes Spiel nicht. */
    function standStimmig(a) {
      if (a.phase !== 'spiel' && a.phase !== 'ende') return true;
      if (!a.spielart || a.spieler < 0) return false;
      const gesehen = new Uint8Array(32);
      let n = 0;
      const zaehle = (liste) => {
        for (const k of liste || []) {
          if (typeof k !== 'number' || k < 0 || k > 31 || gesehen[k]) return false;
          gesehen[k] = 1;
          n += 1;
        }
        return true;
      };
      for (const h of a.haende) if (!zaehle(h)) return false;
      for (const st of a.stiche || []) if (!zaehle(st.karten)) return false;
      if (!zaehle(a.aktuell && a.aktuell.karten)) return false;
      return n === 32;
    }

    function laden() {
      const a = s.erinnert();
      if (a && Array.isArray(a.haende) && a.haende.length === 4 && a.phase
          && ['ansage', 'spiel', 'ende'].includes(a.phase) && standStimmig(a)) {
        if (!Array.isArray(a.konto)) a.konto = [0, 0, 0, 0];
        if (!a.lehre) a.lehre = 'tipp';
        if (typeof a.zurueck !== 'number') a.zurueck = 0;
        if (typeof a.rueckstand !== 'string') a.rueckstand = null;
        return a;
      }
      return frisch(null);
    }

    const sichern = () => s.merken(stand);
    const vorhand = () => (stand.geber + 1) % 4;
    const ord = () => K.ordnung(stand.spielart);
    const sauKarte = () => sauKarteVon(stand.spielart);

    /* Meine Partei – aber nur, soweit ich sie kennen darf. Beim Sauspiel weiß
       man vor dem Fallen der Sau nicht, wer zu wem gehört, und die Anzeige
       tut auch nicht so. */
    function partnerBekannt() {
      if (!stand.spielart || stand.spielart.art !== 'sau') return true;
      return stand.sauWeg || stand.davon;
    }

    function meineSeite() {
      if (stand.spieler === ICH) return 1;
      if (stand.spielart.art === 'sau' && stand.partner === ICH) return 1;
      return 0;
    }

    function zustand() {
      return {
        spielart: stand.spielart, spieler: stand.spieler, haende: stand.haende,
        stiche: stand.stiche, aktuell: stand.aktuell, davon: stand.davon,
      };
    }

    function weltJetzt() {
      const w = K.welt(stand.spielart, stand.haende, stand.spieler, stand.partner,
        stand.amZug, stand.aktuell.start, stand.aktuell.karten);
      w.sauWeg = stand.sauWeg;
      w.davon = stand.davon;
      return w;
    }

    const erlaubteJetzt = (p) => K.erlaubt(weltJetzt(), p);

    /* ------------------------------------------------------------- Aufbau */

    const kopf = el('div', 'sk-kopf');
    const tisch = el('div', 'sk-tisch');
    const mitspieler = [];
    for (const i of [1, 2, 3]) {
      const m = el('div', 'sk-mitspieler sk-mitspieler--' + PLATZ[i]);
      m.append(el('span', 'sk-name', NAMEN[i]));
      m.append(el('span', 'sk-rolle', ''));
      m.append(el('span', 'sk-ruecken', ''));
      tisch.append(m);
      mitspieler[i] = m;
    }
    const stichKasten = el('div', 'sk-stich');
    tisch.append(stichKasten);

    /* Wer dran ist, stand bisher nur in der Kopfzeile und als heller Fleck
       unter dem Namen des Mitspielers. Beides half genau dann nicht, wenn man
       es am dringendsten braucht: Bist du selbst am Zug, ist keiner der drei
       hervorgehoben, und dann sieht das Brett aus, als warte es auf jemand
       anderen. Also eine eigene Zeile, direkt über der eigenen Hand. */
    const dranKasten = el('div', 'sk-dran');
    dranKasten.hidden = true;

    const notizKasten = el('div', 'sk-notiz');
    notizKasten.hidden = true;
    const handKasten = el('div', 'sk-hand');
    const ansageKasten = el('div', 'sk-ansage');
    ansageKasten.hidden = true;
    const endeKasten = el('div', 'ende-kasten');
    endeKasten.hidden = true;
    const leiste = el('div', 'leiste');

    wurzel.append(kopf, tisch, dranKasten, notizKasten, ansageKasten, handKasten, leiste, endeKasten);

    const tippKnopf = el('button', 'knopf knopf--still', 'Tipp');
    tippKnopf.type = 'button';
    tippKnopf.addEventListener('click', tippGeben);
    const zurueckKnopf = el('button', 'knopf knopf--still', 'Zug zurück');
    zurueckKnopf.type = 'button';
    zurueckKnopf.addEventListener('click', zurueckNehmen);
    leiste.append(tippKnopf, zurueckKnopf);

    s.werkzeuge([
      { label: 'Anleitung', symbol: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/>', tun: anleitung },
      { label: 'Hinweise', symbol: '<path d="M9 18h6M10 21h4" stroke-linecap="round"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z"/>', tun: hinweiseWaehlen },
      { label: 'Regeln des Rechners', symbol: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" stroke-linejoin="round"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" stroke-linejoin="round"/>', tun: regelwerkZeigen },
      { label: 'Neu geben', symbol: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke-linecap="round" stroke-linejoin="round"/>', tun: neuFragen },
    ]);

    /* --------------------------------------------------------------- Gabe */

    function geben() {
      const stapel = K.ALLE.slice();
      K.mischen(stapel, Math.random);
      const neu = frisch(stand);
      for (let p = 0; p < 4; p += 1) {
        neu.haende[p] = stapel.slice(p * 8, p * 8 + 8);
        neu.start[p] = neu.haende[p].slice();
      }
      neu.amZug = (neu.geber + 1) % 4;
      neu.aktuell = { start: neu.amZug, karten: [] };
      stand = neu;
      sichern();
      zeichnen();
      ansageWeiter();
    }

    /* ------------------------------------------------------------- Ansage

       Einmal reihum ab der Vorhand: Jeder sagt an oder sagt weiter, und wer
       ansagt, sagt gleich was. Die höhere Spielart sticht die tiefere; stehen
       zwei auf derselben Stufe – Wenz und Geier –, bleibt es beim Früheren,
       also beim Näheren an der Vorhand. Deshalb reicht die eine Runde. */

    const bestesGebot = () => stand.gebote.reduce(
      (b, g) => (g.spiel && (!b || K.spielStufe(g.spiel) > K.spielStufe(b.spiel)) ? g : b), null);

    function ansageWeiter() {
      if (stand.phase !== 'ansage') return;
      if (stand.zeiger >= 4) { ansageFertig(); return; }
      const p = (vorhand() + stand.zeiger) % 4;
      if (p === ICH) { zeichnen(); return; }        // wartet auf deinen Knopf
      denkt = true;
      zeichnen();
      spaeter(() => {
        const oben = bestesGebot();
        let rat = { wahl: null };
        try {
          rat = K.ansageRat(stand.haende[p], stand.zeiger, {
            proben: 400,
            stufeAb: oben ? K.spielStufe(oben.spiel) : 0,
          });
        } catch (e) {
          // Im Zweifel sagt er weiter – hängen bleiben darf die Ansage nicht.
          rat = { wahl: null };
        }
        stand.gebote.push({ p, spiel: rat.wahl ? rat.wahl.spiel : null });
        stand.zeiger += 1;
        denkt = false;
        sichern();
        zeichnen();
        ansageWeiter();
      }, DENKZEIT);
    }

    function ansagen(spiel) {
      stand.gebote.push({ p: ICH, spiel });
      stand.zeiger += 1;
      sichern();
      zeichnen();
      ansageWeiter();
    }

    function ansageFertig() {
      const oben = bestesGebot();
      if (!oben) {
        stand.phase = 'weiter';
        sichern();
        zeichnen();
        spaeter(geben, 1700);
        return;
      }
      stand.spielart = oben.spiel;
      stand.spieler = oben.p;
      stand.partner = -1;
      if (oben.spiel.art === 'sau') {
        const sau = sauKarteVon(oben.spiel);
        for (let p = 0; p < 4; p += 1) if (stand.haende[p].indexOf(sau) >= 0) stand.partner = p;
      }
      stand.phase = 'spiel';
      stand.amZug = vorhand();
      stand.aktuell = { start: stand.amZug, karten: [] };
      sichern();
      zeichnen();
      zugWeiter();
    }

    /* ---------------------------------------------------------------- Zug */

    function zugWeiter() {
      if (stand.phase !== 'spiel') return;
      if (stand.stichFertig) { spaeter(stichAbraeumen, STICHZEIT); return; }
      if (stand.amZug === ICH) {
        tipp = null;
        // Beim Mitlesen wird schon gerechnet, während du noch überlegst –
        // dann steht das Urteil sofort, wenn du legst.
        if (stand.lehre === 'mit') {
          vorabRat = null;
          vorabFuer = stand.stiche.length * 4 + stand.aktuell.karten.length;
          const merker = vorabFuer;
          spaeter(() => {
            if (stand.phase !== 'spiel' || stand.amZug !== ICH) return;
            if (stand.stiche.length * 4 + stand.aktuell.karten.length !== merker) return;
            try {
              vorabRat = K.bewerten(K.sichtVon(zustand(), ICH), { proben: 240, frist: 300 });
            } catch (e) { vorabRat = null; }
          }, 30);
        }
        zeichnen();
        return;
      }
      denkt = true;
      zeichnen();
      spaeter(() => {
        const p = stand.amZug;
        /* Notbremse. Fliegt hier eine Ausnahme, bliebe denkt auf true und das
           Spiel stünde für immer bei „überlegt …" – ein Spiel, das man allein
           gegen den Rechner spielt, darf nie stehenbleiben. Also: was auch
           schiefgeht, es wird eine erlaubte Karte gelegt. Die Faustregel
           kommt ohne das Würfeln aus und ist der kürzere Weg; scheitert auch
           sie, tut es die erste erlaubte Karte. */
        let karte = -1;
        try {
          karte = K.besteKarte(K.sichtVon(zustand(), p), { proben: 200, frist: 240 });
        } catch (e) {
          try {
            karte = K.faustregel(weltJetzt(), p);
          } catch (e2) {
            karte = -1;
          }
          const erlaubt = erlaubteJetzt(p);
          if (erlaubt.indexOf(karte) < 0) karte = erlaubt[0];
          s.toast('Der Rechner hat sich verrechnet – er legt einfach.');
        }
        denkt = false;
        legen(karte);
      }, DENKZEIT);
    }

    function legen(karte) {
      const p = stand.amZug;
      const hand = stand.haende[p];
      const i = hand.indexOf(karte);
      if (i < 0) return;
      hand.splice(i, 1);

      /* Davonlaufen: der Ruf-Partner spielt seine Farbe an, ohne die Sau zu
         legen. Danach ist sie frei – und alle wissen, wer er ist. */
      if (stand.spielart.art === 'sau' && !stand.sauWeg && !stand.aktuell.karten.length
          && !ord().trumpf[karte] && K.farbe(karte) === stand.spielart.farbe
          && karte !== sauKarte() && hand.indexOf(sauKarte()) >= 0) {
        stand.davon = true;
      }
      if (karte === sauKarte()) stand.sauWeg = true;

      stand.aktuell.karten.push(karte);
      if (stand.aktuell.karten.length === 4) stand.stichFertig = true;
      else stand.amZug = (p + 1) % 4;
      sichern();
      zeichnen();
      zugWeiter();
    }

    function stichAbraeumen() {
      const st = stand.aktuell;
      const platz = K.stichPlatz(st.karten, ord());
      const sieger = (st.start + platz) % 4;
      stand.stiche.push({ start: st.start, karten: st.karten.slice(), sieger });
      stand.aktuell = { start: sieger, karten: [] };
      stand.stichFertig = false;
      stand.amZug = sieger;
      sichern();
      if (stand.stiche.length === 8) { abschluss(); return; }
      zeichnen();
      zugWeiter();
    }

    /* ------------------------------------------------------- Zug zurück

       Genommen wird deine letzte Karte samt allem, was die drei danach
       gelegt haben – ein halber Schritt brächte nichts, man stünde vor
       derselben Lage und wäre nur nicht am Zug.

       Der Stand vor deiner Karte wird dafür weggeschrieben, statt den Zug
       rückwärts nachzurechnen: Ein Stich kann in der Zwischenzeit fertig
       geworden sein, die Rufsau gefallen, jemand davongelaufen. Eine Kopie
       ist kürzer als all diese Fälle einzeln rückgängig zu machen.

       Die Rechner legen danach nicht dieselben Karten wie vorher – sie
       würfeln ja neu. Wer oft genug zurücknimmt, spielt sich also auch eine
       günstige Antwort herbei. Für einen Lehrer ist das kein Schaden, aber
       ehrlich soll es bleiben: Die Zahl der zurückgenommenen Züge steht in
       der Statistik. */
    function merkeStand() {
      stand.rueckstand = JSON.stringify({
        haende: stand.haende, stiche: stand.stiche, aktuell: stand.aktuell,
        amZug: stand.amZug, sauWeg: stand.sauWeg, davon: stand.davon,
        stichFertig: stand.stichFertig,
        treffer: stand.treffer, gezaehlt: stand.gezaehlt,
      });
    }

    const kannZurueck = () => !!stand.rueckstand && stand.phase === 'spiel'
      && stand.amZug === ICH && !denkt && !stand.stichFertig;

    function zurueckNehmen() {
      if (!kannZurueck()) return;
      // Erst die laufenden Uhren stoppen: ein schon angesetzter Rechnerzug
      // fiele sonst in den wiederhergestellten Stand hinein.
      uhrenAus();
      denkt = false;
      Object.assign(stand, JSON.parse(stand.rueckstand));
      stand.rueckstand = null;
      stand.zurueck += 1;
      stand.notiz = null;
      tipp = null;
      vorabRat = null;
      sichern();
      zeichnen();
      zugWeiter();
    }

    /* Deine Karte – erst prüfen, dann urteilen, dann legen. */
    function deineKarte(karte) {
      if (stand.phase !== 'spiel' || stand.amZug !== ICH || denkt || stand.stichFertig) return;
      const erlaubt = erlaubteJetzt(ICH);
      if (erlaubt.indexOf(karte) < 0) { warumNicht(karte, erlaubt); return; }
      merkeStand();
      if (stand.lehre === 'mit') urteilen(karte, erlaubt);
      else stand.notiz = null;
      tipp = null;
      legen(karte);
    }

    /* ------------------------------------------------------------ Hinweise */

    function rechnen(frist) {
      return K.bewerten(K.sichtVon(zustand(), ICH), { proben: 500, frist: frist || 380 });
    }

    function tippGeben() {
      if (stand.phase === 'ansage' && (vorhand() + stand.zeiger) % 4 === ICH) {
        ansageTipp();
        return;
      }
      if (stand.phase !== 'spiel' || stand.amZug !== ICH || stand.stichFertig) {
        s.toast('Gerade bist du nicht dran.');
        return;
      }
      const rat = vorabRat || rechnen(700);
      const beste = rat.werte[0];
      stand.hilfen += 1;
      tipp = {
        karte: beste.karte,
        text: rat.einzig
          ? 'Du hast gar keine Wahl – nur diese eine Karte ist erlaubt.'
          : K.begruenden(K.sichtVon(zustand(), ICH), beste.karte, meineSeite(),
            rat.werte.map((e) => e.karte)),
        zahl: rat.einzig ? '' : zahlSatz(rat, beste) + ' ' + herkunftSatz(rat),
      };
      sichern();
      zeichnen();
    }

    const prozentText = (q) => Math.round(q * 100) + ' %';

    /* Zwei Quoten nebeneinander sind noch kein Vorsprung. Verglichen wird
       paarweise – dieselben Verteilungen für beide Karten –, und wenn der
       Unterschied kleiner ist als sein eigener Fehler, steht das auch da.
       Sonst liest man aus 39 gegen 36 Prozent eine Rangfolge heraus, die es
       gar nicht gibt. */
    function zahlSatz(rat, e) {
      const zweite = rat.werte[1];
      const kopf = 'In ' + rat.welten + ' durchgerechneten Verteilungen reicht es damit in '
        + prozentText(e.quote) + ' der Fälle';
      if (!zweite) return kopf + '.';
      const u = K.unterschied(e, zweite);
      if (!u.klar) {
        return kopf + '. ' + K.kartenName(zweite.karte) + ' käme auf '
          + prozentText(zweite.quote) + ' – der Unterschied ist kleiner als die '
          + 'Ungenauigkeit des Würfelns. Hier entscheidet also der Grund oben '
          + 'und nicht die Zahl.';
      }
      return kopf + ', mit ' + K.kartenName(zweite.karte) + ' nur in '
        + prozentText(zweite.quote) + '.';
    }

    /* Ein Satz darüber, woher der Zug kommt. Die Rechner spielen nicht nach
       Merksätzen, sondern rechnen – die Merksätze stecken nur in ihren
       Ausspielungen und entscheiden bei Gleichstand. Wenn die Empfehlung
       gegen die Faustregel geht, soll das dastehen, damit niemand einen
       Merksatz ableitet, den es nicht gibt. */
    function herkunftSatz(rat) {
      if (!rat || rat.regelWahl == null || rat.regelWahl < 0) return '';
      const beste = rat.werte[0].karte;
      if (rat.regelWahl === beste) {
        return 'Das ist auch der Zug nach der Faustregel.';
      }
      return 'Nach der Faustregel wäre ' + K.kartenName(rat.regelWahl) + ' dran – '
        + 'der Rechner entscheidet hier gegen den Merksatz, weil die durchgerechneten '
        + 'Verteilungen anders ausgehen. Die drei Mitspieler tun dasselbe.';
    }

    /* Das Urteil nach deinem Zug. Es kommt aus derselben Rechnung wie der
       Tipp, nur wird sie hier still im Voraus gemacht. Ein knapper Unterschied
       ist keiner: unter drei Punkten Quotenabstand liegen zwei Karten
       innerhalb dessen, was das Würfeln selbst schwankt. */
    function urteilen(karte, erlaubt) {
      stand.notiz = null;
      if (erlaubt.length < 2) return;
      const rat = vorabRat && vorabFuer === stand.stiche.length * 4 + stand.aktuell.karten.length
        ? vorabRat : rechnen(260);
      const beste = rat.werte[0];
      const meine = rat.werte.find((e) => e.karte === karte);
      if (!meine) return;
      stand.gezaehlt += 1;
      const sicht = K.sichtVon(zustand(), ICH);
      const zuege = rat.werte.map((e) => e.karte);
      /* Gilt als richtig, was sich vom Besten nicht unterscheiden lässt. Der
         Vergleich ist paarweise: dieselben Verteilungen für beide Karten.
         Eine feste Schwelle wäre hier falsch – mal sind drei Punkte Zufall,
         mal ist ein Punkt echt. */
      const u = K.unterschied(beste, meine);
      if (!u.klar) {
        stand.treffer += 1;
        stand.notiz = {
          art: 'gut',
          titel: karte === beste.karte ? 'Genau die.' : 'Geht auch.',
          text: K.begruenden(sicht, karte, meineSeite(), zuege),
        };
        return;
      }
      stand.notiz = {
        art: 'schlecht',
        titel: 'Besser: ' + K.kartenName(beste.karte),
        text: K.begruenden(sicht, beste.karte, meineSeite(), zuege)
          + ' Deine Karte reicht in ' + prozentText(meine.quote) + ' der Verteilungen, jene in '
          + prozentText(beste.quote) + '.',
      };
    }

    function warumNicht(karte, erlaubt) {
      const o = ord();
      const st = stand.aktuell.karten;
      let text;
      if (!st.length) {
        text = 'Die Rufsau darfst du nicht anspielen – außer du legst sie selbst. '
          + 'Mit vier Karten dieser Farbe dürftest du davonlaufen, aber so viele hast du nicht.';
      } else if (o.reihe(st[0]) === 4) {
        text = 'Trumpf ist angespielt, und du hast noch Trumpf – den musst du zugeben.';
      } else if (erlaubt.length === 1 && erlaubt[0] === sauKarte()) {
        text = 'Deine Farbe ist gesucht: die Rufsau muss fallen.';
      } else {
        text = K.FARBEN[o.reihe(st[0])] + ' ist angespielt, und du hast noch '
          + K.FARBEN[o.reihe(st[0])] + ' – Farbe muss bedient werden.';
      }
      s.blatt({ titel: 'Die geht nicht', inhalt: text, aktionen: [{ text: 'Verstanden' }] });
    }

    function ansageTipp() {
      stand.hilfen += 1;
      const oben = bestesGebot();
      const rat = K.ansageRat(stand.haende[ICH], stand.zeiger, {
        proben: 1200,
        stufeAb: oben ? K.spielStufe(oben.spiel) : 0,
      });
      const d = el('div');

      if (oben) {
        d.append(el('p', 'notiz', NAMEN[oben.p] + ' hat ' + K.spielName(oben.spiel)
          + ' angesagt. Dagegenhalten kannst du nur mit einer höheren Spielart – '
          + 'gleicher Rang bleibt beim Näheren an der Vorhand. Gerechnet ist deshalb '
          + 'nur, was jetzt überhaupt noch geht.'));
      }

      if (!rat.liste.length) {
        d.append(el('p', 'notiz', oben
          ? 'Und dafür reicht dein Blatt nicht annähernd. Weiter sagen.'
          : 'Mit diesem Blatt ist nichts anzufangen – zu wenig Trumpf, zu wenig Ober. '
            + 'Weiter sagen und schauen, was die anderen wollen.'));
        sichern();
        s.blatt({ titel: 'Was geht mit dem Blatt?', inhalt: d, aktionen: [{ text: 'Danke' }] });
        return;
      }

      const fehler = Math.round(rat.liste[0].fehler * 100);
      d.append(el('p', 'notiz', 'So oft reicht dein Blatt für 61 Augen, wenn der Rest '
        + 'zufällig verteilt ist – aus ' + rat.liste[0].proben + ' probeweise ausgespielten '
        + 'Gaben je Zeile. Die Zahlen sind auf ±' + fehler + ' Punkte genau; was enger '
        + 'beieinanderliegt, ist nicht wirklich verschieden.'));

      const liste = el('div', 'sk-ratliste');
      const gleich = new Set(rat.gleichauf.map((e) => e.spiel));
      for (const e of rat.liste.slice(0, 5)) {
        const z = el('div', 'sk-ratzeile');
        z.append(el('span', 'sk-ratname', K.spielName(e.spiel)));
        z.append(el('span', 'sk-ratzahl', prozentText(e.quote) + ' ±' + fehler));
        if (e.reicht) z.dataset.gut = 'ja';
        if (rat.wahl && e.spiel === rat.wahl.spiel) z.dataset.wahl = 'ja';
        liste.append(z);
      }
      d.append(liste);

      if (!rat.wahl) {
        d.append(el('p', 'notiz', 'Der Rechner würde weiter sagen. Ein Sauspiel braucht die '
          + 'Hälfte, ein Alleinspiel 72 von 100 – dort steht das Fünfzehnfache auf dem Spiel.'));
      } else {
        d.append(el('p', 'notiz', 'Der Rechner würde ' + K.spielName(rat.wahl.spiel) + ' ansagen.'));
        /* Wenn mehrere Rufe rechnerisch gleichauf sind, hat nicht die Rechnung
           entschieden, sondern die Regel darunter – und dann muss sie auch
           dastehen. Sonst wirkt die Wahl willkürlich, so wie sie es vorher war. */
        if (rat.gleichauf.length > 1 && rat.wahl.spiel.art === 'sau') {
          const ord = K.ordnung(rat.wahl.spiel);
          const meine = stand.haende[ICH]
            .filter((k) => !ord.trumpf[k] && K.farbe(k) === rat.wahl.spiel.farbe);
          const wieviele = rat.gleichauf.length;
          let satz = 'Rechnerisch sind ' + (wieviele === 2 ? 'beide' : 'alle ' + wieviele)
            + ' Rufe dasselbe Spiel – der Unterschied in der Liste ist Würfelrauschen. '
            + 'Den Ausschlag gibt etwas anderes: ';
          if (rat.wahl.schutz > 0) {
            satz += 'Die gerufene Sau gehört deinem Partner. Wird die Farbe angespielt, '
              + 'muss er sie legen und nimmt den Stich – ' + meine.map(K.kartenName).join(' und ')
              + ' fällt damit der eigenen Partei zu statt der gegnerischen. '
              + 'Nachgemessen: bei diesem Ruf landet die Karte zu 71 % bei euch, sonst zu 41 %. '
              + 'Auf die Siegquote schlägt das knapp einen Punkt durch.';
          } else {
            satz += 'in keiner der Farben steht etwas Zählbares von dir, also ist es '
              + 'wirklich einerlei.';
          }
          d.append(el('p', 'notiz', satz));
        }
      }
      sichern();
      s.blatt({ titel: 'Was geht mit dem Blatt?', inhalt: d, aktionen: [{ text: 'Danke' }] });
    }

    function hinweiseWaehlen() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Der Hinweisgeber rechnet aus deiner Sicht – er sieht dein '
        + 'Blatt und was liegt, aber nicht die Karten der anderen. Er kann sich also irren. '
        + 'Alles andere wäre Betrug, und von einem, der schummelt, lernt man nichts.'));
      const wahl = [
        ['aus', 'Aus', 'Nur die Regeln. Unerlaubte Karten bleiben trotzdem gesperrt.'],
        ['tipp', 'Tipp auf Anfrage', 'Ein Knopf zeigt die Karte und sagt, warum sie es ist.'],
        ['mit', 'Mitlesen', 'Nach jeder deiner Karten ein Urteil, am Ende die Bilanz.'],
      ];
      const liste = el('div', 'sheet-liste');
      for (const [id, titel, unter] of wahl) {
        const b = el('button', 'zeile');
        b.type = 'button';
        if (stand.lehre === id) b.dataset.gewaehlt = 'ja';
        const t = el('span', 'zeile-text');
        t.append(el('span', 'zeile-titel', titel));
        t.append(el('span', 'zeile-unter', unter));
        b.append(t);
        b.addEventListener('click', () => {
          stand.lehre = id;
          if (id === 'aus') stand.notiz = null;
          sichern();
          s.blattZu();
          zeichnen();
          if (id === 'mit' && stand.phase === 'spiel' && stand.amZug === ICH) zugWeiter();
        });
        liste.append(b);
      }
      d.append(liste);
      s.blatt({ titel: 'Hinweise', inhalt: d, aktionen: [{ text: 'Fertig', art: 'still' }] });
    }

    /* ----------------------------------------------------------- Abschluss */

    function abschluss() {
      const seite = [0, 0, 0, 0];
      seite[stand.spieler] = 1;
      if (stand.partner >= 0) seite[stand.partner] = 1;
      const ab = K.abrechnen(stand.spielart, seite, stand.stiche, stand.start);
      stand.abrechnung = ab;
      stand.phase = 'ende';
      stand.gaben += 1;
      for (let p = 0; p < 4; p += 1) stand.konto[p] += ab.konto[p];

      const meins = seite[ICH] === 1;
      s.notieren({
        gewonnen: meins ? ab.gewonnen : !ab.gewonnen,
        dauer: Date.now() - stand.begonnen,
        spielart: stand.spielart.art,
        alsSpieler: stand.spieler === ICH,
        augen: meins ? ab.augenSpieler : ab.augenGegner,
        punkte: ab.konto[ICH],
        hilfen: stand.hilfen,
        treffer: stand.treffer,
        gezaehlt: stand.gezaehlt,
        zurueck: stand.zurueck,
      });
      sichern();
      zeichnen();
    }

    /* ------------------------------------------------------------ Zeichnen */

    /* Der Eckindex ist der Grund, warum sich ein Fächer lesen lässt: Von den
       acht Karten in der Hand ist von sieben nur ein Streifen zu sehen, und
       auf dem muss alles stehen. Wert und Farbzeichen, klein untereinander,
       oben links – und noch einmal auf dem Kopf unten rechts, damit es auch
       dann stimmt, wenn die Karte andersherum liegt. */
    function ecke(k, unten) {
      const e = el('span', 'sk-ecke' + (unten ? ' sk-ecke--unten' : ''));
      e.append(el('span', 'sk-rang', K.KURZ[K.wert(k)]));
      const p = el('span', 'sk-minipip');
      p.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
        + ZEICHEN[K.farbe(k)] + '</svg>';
      e.append(p);
      return e;
    }

    function karteBauen(k, klasse) {
      const b = el('button', 'sk-karte ' + (klasse || ''));
      b.type = 'button';
      b.dataset.farbe = String(K.farbe(k));
      /* Trumpf bekommt einen Punkt neben den Eckindex, mehr nicht. Beim
         Sauspiel sind vierzehn der zweiunddreißig Karten Trumpf, quer durch
         drei Farben – ohne Marke muss man sie sich merken. Vor der Ansage
         steht die Spielart noch nicht fest, dann bleibt der Punkt weg statt
         zu raten. */
      const trumpf = !!stand.spielart
        && (stand.phase === 'spiel' || stand.phase === 'ende')
        && ord().trumpf[k] === 1;
      if (trumpf) b.dataset.trumpf = 'ja';
      b.setAttribute('aria-label', K.kartenName(k)
        + (trumpf ? ', Trumpf' : '') + ', ' + K.augen(k) + ' Augen');
      const bild = el('span', 'sk-bild');
      bild.innerHTML = '<svg viewBox="0 0 34 46" aria-hidden="true" focusable="false">'
        + kartenBild(K.farbe(k), K.wert(k)) + '</svg>';
      b.append(bild, ecke(k, false), ecke(k, true));
      if (trumpf) b.append(el('span', 'sk-trumpfpunkt'));
      return b;
    }

    function zeichnen() {
      tisch.dataset.phase = stand.phase;
      kopfZeichnen();
      tischZeichnen();
      dranZeichnen();
      handZeichnen();
      ansageZeichnen();
      notizZeichnen();
      endeZeichnen();
      tippKnopf.hidden = stand.lehre === 'aus' || stand.phase === 'ende' || stand.phase === 'weiter';
      tippKnopf.disabled = denkt || stand.stichFertig
        || !(stand.phase === 'spiel' ? stand.amZug === ICH
          : stand.phase === 'ansage' && (vorhand() + stand.zeiger) % 4 === ICH);
      tippKnopf.textContent = stand.phase === 'ansage' ? 'Was geht?' : 'Tipp';
      zurueckKnopf.hidden = stand.phase !== 'spiel';
      zurueckKnopf.disabled = !kannZurueck();
      leiste.hidden = tippKnopf.hidden && zurueckKnopf.hidden;
    }

    /* Oben links: wer spielt, und was. Bisher stand dort nur die Spielart -
       gerade beim Sauspiel ist aber die Frage, wer sie angesagt hat, die
       wichtigste am Tisch, und sie liess sich nur aus dem kleinen Wort
       SPIELT unter einem der drei Namen herauslesen. Der Partner kommt dazu,
       sobald er bekannt ist; vorher wird er auch nicht angedeutet. */
    function spielZeile() {
      const sp = stand.spielart;
      let text = (stand.spieler === ICH ? 'Du spielst ' : NAMEN[stand.spieler] + ' spielt ')
        + K.spielKurz(sp);
      if (sp.art === 'sau' && stand.partner >= 0 && partnerBekannt()) {
        text += ' mit ' + (stand.partner === ICH ? 'dir' : NAMEN[stand.partner]);
      }
      return text;
    }

    function kopfZeichnen() {
      kopf.replaceChildren();
      if (stand.phase === 'ansage' || stand.phase === 'weiter') {
        kopf.append(el('span', null, 'Gabe ' + (stand.gaben + 1)));
        kopf.append(el('b', null, stand.phase === 'weiter' ? 'zusammengeworfen' : 'wer spielt?'));
        kopf.append(el('span', null, kontoText()));
        s.unter(stand.phase === 'weiter'
          ? 'Keiner mag – neu geben.'
          : 'Vorhand ist ' + NAMEN[vorhand()] + '.');
        return;
      }
      kopf.append(el('span', 'sk-kopf-spiel', spielZeile()));
      kopf.append(el('b', null, augenText()));
      kopf.append(el('span', null, 'Stich ' + Math.min(stand.stiche.length + 1, 8) + '/8'));

      /* Wer dran ist, steht jetzt gross ueber der Hand. Die Zeile unter dem
         Titel traegt deshalb das, was sonst nirgends vollstaendig steht: auf
         welche Sau gerufen wurde, mit ihrem Namen am Tisch. */
      if (stand.phase === 'ende') { s.unter(''); return; }
      s.unter(K.spielName(stand.spielart));
    }

    /* Was du an Augen beisammen hast. Solange beim Sauspiel die Sau nicht
       gefallen ist, zählt nur, was du selbst gemacht hast – wer dein Partner
       ist, weißt du ja noch nicht. */
    function augenText() {
      let augen = 0;
      for (const st of stand.stiche) {
        const meins = st.sieger === ICH
          || (partnerBekannt() && stand.spielart.art === 'sau'
            && ((stand.partner === ICH && st.sieger === stand.spieler)
              || (stand.spieler === ICH && st.sieger === stand.partner)))
          || (stand.spielart.art !== 'sau' && stand.spieler !== ICH
            && st.sieger !== stand.spieler);
        if (meins) augen += K.augenSumme(st.karten);
      }
      return augen + (partnerBekannt() ? ' Augen' : ' Augen bei dir');
    }

    const kontoText = () => (stand.konto[ICH] > 0 ? '+' : '') + stand.konto[ICH];

    function dranZeichnen() {
      dranKasten.replaceChildren();
      if (stand.phase !== 'spiel') { dranKasten.hidden = true; return; }
      dranKasten.hidden = false;

      /* Liegt der Stich voll da, ist die Frage nach dem Zug uninteressant –
         dann will man wissen, wer ihn bekommt und was er wert war. */
      if (stand.stichFertig) {
        const platz = K.stichPlatz(stand.aktuell.karten, ord());
        const sieger = (stand.aktuell.start + platz) % 4;
        const a = K.augenSumme(stand.aktuell.karten);
        dranKasten.dataset.wer = sieger === ICH ? 'ich' : 'stich';
        dranKasten.append(el('span', 'sk-dran-text',
          (sieger === ICH ? 'Du machst den Stich' : NAMEN[sieger] + ' macht den Stich')
          + ' · ' + a + (a === 1 ? ' Auge' : ' Augen')));
        return;
      }

      dranKasten.dataset.wer = stand.amZug === ICH ? 'ich' : 'andere';
      dranKasten.append(el('span', 'sk-dran-punkt'));
      dranKasten.append(el('span', 'sk-dran-text', stand.amZug === ICH
        ? 'Du bist dran'
        : NAMEN[stand.amZug] + ' überlegt …'));
    }

    function tischZeichnen() {
      for (const i of [1, 2, 3]) {
        const m = mitspieler[i];
        m.dataset.dran = stand.phase === 'spiel' && stand.amZug === i && !stand.stichFertig ? 'ja' : 'nein';
        m.querySelector('.sk-rolle').textContent = rolleVon(i);
        const ruecken = m.querySelector('.sk-ruecken');
        ruecken.replaceChildren();
        for (let n = 0; n < stand.haende[i].length; n += 1) ruecken.append(el('span', 'sk-rueck'));
      }
      stichKasten.replaceChildren();
      const st = stand.aktuell;
      for (let i = 0; i < st.karten.length; i += 1) {
        const p = (st.start + i) % 4;
        const k = karteBauen(st.karten[i], 'sk-karte--tisch');
        k.disabled = true;
        k.dataset.platz = PLATZ[p];
        if (stand.stichFertig) {
          const sieger = (st.start + K.stichPlatz(st.karten, ord())) % 4;
          if (p === sieger) k.dataset.sticht = 'ja';
        }
        stichKasten.append(k);
      }
      if (!st.karten.length && stand.phase === 'spiel') {
        stichKasten.append(el('span', 'sk-leer', NAMEN[stand.amZug] + ' spielt aus'));
      }
    }

    function rolleVon(p) {
      if (stand.phase === 'ansage') {
        const g = stand.gebote.find((x) => x.p === p);
        if (!g) return '';
        return g.spiel ? K.spielKurz(g.spiel) : 'weiter';
      }
      if (stand.phase !== 'spiel' && stand.phase !== 'ende') return '';
      if (p === stand.spieler) return 'spielt';
      if (stand.spielart.art === 'sau' && p === stand.partner
          && (partnerBekannt() || stand.phase === 'ende')) return 'Partner';
      return '';
    }

    function handZeichnen() {
      handKasten.replaceChildren();
      const hand = K.sortieren(stand.haende[ICH], stand.spielart || { art: 'sau', farbe: 0 });
      const erlaubt = stand.phase === 'spiel' && stand.amZug === ICH && !stand.stichFertig
        ? erlaubteJetzt(ICH) : null;
      /* Wie stark der Faecher ueberlappt, haengt an der Kartenzahl: acht
         Karten muessen sich schieben, drei duerfen nebeneinanderliegen.
         Am Ende steht immer ungefaehr dieselbe Gesamtbreite - sonst
         laeuft die Hand mit sechs Karten aus dem schmalen Bild heraus. */
      /* Steht die Wahl an, heben sich die spielbaren Karten ab. Ausserhalb
         des eigenen Zuges bleibt die Hand ruhig liegen. */
      handKasten.dataset.wahl = erlaubt ? 'ja' : 'nein';
      handKasten.dataset.eng = hand.length > 6 ? 'viel'
        : hand.length > 4 ? 'mittel'
          : hand.length > 3 ? 'wenig' : 'nein';
      /* Die Lücke zwischen Trumpf und Farbe – dieselbe, die man mit echten
         Karten in der Hand lässt. Sie sagt mehr als jede Marke auf der Karte
         und kostet keinen Millimeter Kartenfläche. */
      const trumpfEnde = stand.spielart && stand.phase === 'spiel'
        ? hand.findIndex((k) => !ord().trumpf[k]) : -1;
      for (let i = 0; i < hand.length; i += 1) {
        const k = hand[i];
        const b = karteBauen(k, 'sk-karte--hand');
        if (i === trumpfEnde && i > 0) b.dataset.gruppe = 'farbe';
        if (erlaubt && erlaubt.indexOf(k) < 0) b.dataset.gesperrt = 'ja';
        if (tipp && tipp.karte === k) b.dataset.tipp = 'ja';
        b.addEventListener('click', () => deineKarte(k));
        if (!erlaubt) b.disabled = stand.phase !== 'spiel';
        handKasten.append(b);
      }
      handKasten.hidden = !hand.length;
    }

    function ansageZeichnen() {
      ansageKasten.replaceChildren();
      const dran = stand.phase === 'ansage' && (vorhand() + stand.zeiger) % 4 === ICH;
      ansageKasten.hidden = !dran;
      if (!dran) return;

      const oben = bestesGebot();
      ansageKasten.append(el('p', 'sk-frage', oben
        ? NAMEN[oben.p] + ' will ' + K.spielName(oben.spiel) + ' spielen. Hältst du dagegen?'
        : 'Magst du spielen?'));

      const moeglich = K.moeglicheSpiele(stand.haende[ICH])
        .filter((sp) => !oben || K.spielStufe(sp) > K.spielStufe(oben.spiel));

      const gruppe = (titel, liste) => {
        if (!liste.length) return;
        const g = el('div', 'sk-gruppe');
        g.append(el('span', 'sk-gruppe-titel', titel));
        const reihe = el('div', 'sk-knopfreihe');
        for (const sp of liste) {
          const b = el('button', 'knopf knopf--still sk-ansageknopf',
            sp.art === 'sau' ? K.SAUNAME[sp.farbe] : K.spielName(sp));
          b.type = 'button';
          b.addEventListener('click', () => ansagen(sp));
          reihe.append(b);
        }
        g.append(reihe);
        ansageKasten.append(g);
      };
      gruppe('Sauspiel auf …', moeglich.filter((sp) => sp.art === 'sau'));
      gruppe('Allein', moeglich.filter((sp) => sp.art === 'wenz' || sp.art === 'geier'));
      gruppe('Solo', moeglich.filter((sp) => sp.art === 'solo'));

      const weiter = el('button', 'knopf knopf--voll sk-weiter', 'Weiter');
      weiter.type = 'button';
      weiter.addEventListener('click', () => ansagen(null));
      ansageKasten.append(weiter);
    }

    function notizZeichnen() {
      notizKasten.replaceChildren();
      if (tipp) {
        notizKasten.dataset.art = 'tipp';
        notizKasten.append(el('p', 'sk-notiz-titel', K.kartenName(tipp.karte)));
        notizKasten.append(el('p', 'sk-notiz-text', tipp.text));
        if (tipp.zahl) notizKasten.append(el('p', 'sk-notiz-zahl', tipp.zahl));
        notizKasten.hidden = false;
        return;
      }
      if (stand.notiz && stand.lehre === 'mit' && stand.phase !== 'ende') {
        notizKasten.dataset.art = stand.notiz.art;
        notizKasten.append(el('p', 'sk-notiz-titel', stand.notiz.titel));
        notizKasten.append(el('p', 'sk-notiz-text', stand.notiz.text));
        notizKasten.hidden = false;
        return;
      }
      notizKasten.hidden = true;
    }

    function endeZeichnen() {
      endeKasten.replaceChildren();
      endeKasten.hidden = stand.phase !== 'ende';
      if (stand.phase !== 'ende') return;
      const ab = stand.abrechnung;
      const meins = stand.spieler === ICH || stand.partner === ICH;
      const gewonnen = meins ? ab.gewonnen : !ab.gewonnen;

      endeKasten.append(el('p', 'ende-titel', gewonnen ? 'Gewonnen.' : 'Verloren.'));
      endeKasten.append(el('p', 'notiz',
        K.spielName(stand.spielart) + ', ' + NAMEN[stand.spieler] + ' spielt'
        + (stand.partner >= 0 ? ' mit ' + NAMEN[stand.partner] : '') + '. '
        + ab.augenSpieler + ' zu ' + ab.augenGegner + ' Augen.'));

      const zeilen = [];
      zeilen.push(['Grundwert', String(K.GRUNDWERT[stand.spielart.art])]);
      if (ab.schneider) zeilen.push(['Schneider', '+10']);
      if (ab.schwarz) zeilen.push(['Schwarz', '+10']);
      if (ab.laufende) {
        zeilen.push([ab.laufende + ' Laufende, ' + (ab.laufendeMit ? 'mit' : 'ohne'),
          '+' + ab.laufende * 10]);
      } else if (ab.laufendeRoh > 1) {
        zeilen.push([ab.laufendeRoh + ' Laufende – zählen erst ab '
          + K.LAUF_AB[stand.spielart.art], '0']);
      }
      zeilen.push(['Für dich', (ab.konto[ICH] > 0 ? '+' : '') + ab.konto[ICH]]);
      const tafel = el('div', 'sk-rechnung');
      for (const [wort, zahl] of zeilen) {
        const z = el('div', 'sk-rechnung-zeile');
        z.append(el('span', null, wort));
        z.append(el('span', 'sk-rechnung-zahl', zahl));
        tafel.append(z);
      }
      endeKasten.append(tafel);

      if (stand.lehre === 'mit' && stand.gezaehlt) {
        endeKasten.append(el('p', 'notiz', 'Bei ' + stand.treffer + ' von ' + stand.gezaehlt
          + ' Karten, bei denen du wirklich die Wahl hattest, lagst du auf der besten – '
          + 'oder so nah dran, dass es keinen Unterschied macht.'));
      }
      endeKasten.append(el('p', 'notiz notiz--klein',
        'Stand über ' + stand.gaben + (stand.gaben === 1 ? ' Gabe: ' : ' Gaben: ')
        + NAMEN.map((n, p) => n + ' ' + (stand.konto[p] > 0 ? '+' : '') + stand.konto[p]).join(' · ')));

      const l = el('div', 'leiste');
      const noch = el('button', 'knopf knopf--voll', 'Nächste Gabe');
      noch.type = 'button';
      noch.addEventListener('click', geben);
      const schauen = el('button', 'knopf knopf--still', 'Stiche ansehen');
      schauen.type = 'button';
      schauen.addEventListener('click', sticheZeigen);
      l.append(noch, schauen);
      endeKasten.append(l);
    }

    function sticheZeigen() {
      const d = el('div', 'sk-rueckblick');
      for (let i = 0; i < stand.stiche.length; i += 1) {
        const st = stand.stiche[i];
        const z = el('div', 'sk-rueck-zeile');
        z.append(el('span', 'sk-rueck-nr', String(i + 1)));
        const karten = el('div', 'sk-rueck-karten');
        for (let j = 0; j < 4; j += 1) {
          const k = karteBauen(st.karten[j], 'sk-karte--mini');
          k.disabled = true;
          if ((st.start + j) % 4 === st.sieger) k.dataset.sticht = 'ja';
          karten.append(k);
        }
        z.append(karten);
        z.append(el('span', 'sk-rueck-wer',
          NAMEN[st.sieger] + ' · ' + K.augenSumme(st.karten)));
        d.append(z);
      }
      s.blatt({ titel: 'Die acht Stiche', inhalt: d, aktionen: [{ text: 'Zu' }] });
    }

    function neuFragen() {
      s.blatt({
        titel: 'Neu geben',
        inhalt: 'Die laufende Gabe wird weggelegt und nicht gewertet. Der Stand über '
          + 'den Abend bleibt stehen.',
        aktionen: [
          { text: 'Neu geben', tun: () => { uhrenAus(); geben(); } },
          { text: 'Weiterspielen', art: 'still' },
        ],
      });
    }

    /* Die Regeln zum Nachlesen. Nach Spielart und Rolle sortiert, mit der
       gemessenen Wirkung dahinter - wer lernen will, soll auch sehen, wie
       sicher eine Regel ist und woher sie kommt. */
    function regelwerkZeigen() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Wonach die drei am Tisch entscheiden. Jede Zahl dahinter '
        + 'ist gemessen: dieselben Gaben mit und ohne die Regel, dazu der Bereich, in dem '
        + 'der wahre Wert mit 95 Prozent liegt. Ein Pluszeichen heißt: so viele '
        + 'Prozentpunkte öfter gewinnt die Partei, die die Regel anwendet – immer aus '
        + 'ihrer eigenen Sicht, nie aus der des Gegners. Gemessen wird getrennt nach '
        + 'Spielart und nach Rolle: Dieselbe Regel liegt für den Spieler, seinen '
        + 'Mitspieler und die Gegenpartei oft ganz verschieden, und manche hilft der '
        + 'einen Seite und schadet der anderen.'));
      for (const abschnitt of REGELWERK) {
        d.append(el('h3', 'sk-regel-kopf', abschnitt.kopf));
        for (const r of abschnitt.regeln) {
          const kasten = el('div', 'sk-regel');
          if (abschnitt.aus) kasten.dataset.aus = 'ja';
          kasten.append(el('p', 'sk-regel-titel', r.titel));
          kasten.append(el('p', 'sk-regel-gilt', r.gilt));
          kasten.append(el('p', 'sk-regel-text', r.text));
          if (r.zahl) kasten.append(el('p', 'sk-regel-zahl', r.zahl));
          d.append(kasten);
        }
      }
      d.append(el('p', 'notiz notiz--klein', 'Der Rechner spielt nicht nach diesen Regeln, '
        + 'sondern rechnet. Sie steuern, wie er eine gewürfelte Verteilung zu Ende spielt, '
        + 'und sie entscheiden, wenn zwei Karten rechnerisch gleichauf liegen.'));
      s.blatt({ titel: 'Regeln des Rechners', inhalt: d, aktionen: [{ text: 'Zu' }] });
    }

    function anleitung() {
      const d = el('div');
      d.append(el('p', 'notiz', 'Vier Leute, 32 Karten, jeder acht. Wer über die Runde 61 der '
        + '120 Augen holt, gewinnt: Sau 11, Zehner 10, König 4, Ober 3, Unter 2, der Rest nichts.'));
      d.append(el('p', 'notiz', 'Gespielt wird reihum im Uhrzeigersinn. Die angespielte Farbe '
        + 'muss bedient werden; wer sie nicht hat, darf stechen oder abwerfen. Der höchste '
        + 'Trumpf holt den Stich, ohne Trumpf die höchste Karte der angespielten Farbe.'));
      d.append(el('p', 'notiz', 'Trumpf sind beim Sauspiel und beim Solo alle acht Ober und '
        + 'Unter und dazu die ganze Trumpffarbe – beim Sauspiel Herz. Die Reihenfolge unter '
        + 'den Obern und Untern: Eichel, Gras, Herz, Schellen. Der Eichel-Ober ist die höchste '
        + 'Karte im Spiel. Beim Wenz sind nur die vier Unter Trumpf, beim Geier nur die vier Ober; '
        + 'in beiden Fällen laufen Ober und Unter sonst als gewöhnliche Farbkarten mit.'));
      d.append(el('p', 'notiz', 'Beim Sauspiel ruft der Spieler eine Sau, die er nicht hat – '
        + 'Eichel, Gras oder Schellen, und von der Farbe muss er selbst noch eine Karte halten. '
        + 'Wer die gerufene Sau hat, ist sein Partner und sagt nichts. Man merkt es erst, wenn '
        + 'sie fällt. Drei Regeln hängen daran: Wird die Farbe angespielt, muss die Sau fallen. '
        + 'Der Partner darf die Farbe nur anspielen, indem er die Sau legt – außer er hat vier '
        + 'davon, dann darf er davonlaufen. Und abwerfen darf er sie nie.'));
      d.append(el('p', 'notiz', 'Vor dem Spiel sagt jeder reihum an oder sagt weiter. Ein Solo '
        + 'sticht Wenz und Geier, die stechen das Sauspiel; bei gleichem Rang zählt, wer näher '
        + 'an der Vorhand sitzt. Mag keiner, wird neu gegeben.'));
      d.append(el('p', 'notiz', 'Abgerechnet wird mit dem üblichen Tarif: Sauspiel 10, '
        + 'Alleinspiel 50. Dazu 10 für Schneider – die Verliererpartei bleibt unter 31 Augen –, '
        + '10 für Schwarz, also gar kein Stich, und 10 je Laufendem. Laufende sind die obersten '
        + 'Trümpfe in ununterbrochener Reihe in einer Hand oder Partei; sie zählen ab drei, beim '
        + 'Wenz und Geier ab zwei. Der Alleinspieler bekommt oder zahlt das Ganze dreifach.'));
      d.append(el('p', 'notiz', '„Zug zurück" nimmt deine letzte Karte samt allem, was die drei '
        + 'darauf gelegt haben, wieder vom Tisch – ein halber Schritt brächte nichts, du '
        + 'stündest vor derselben Lage und wärst nur nicht am Zug. Zusammen mit dem Mitlesen '
        + 'ist das die eigentliche Übung: legen, das Urteil lesen, zurücknehmen, es besser '
        + 'machen. Die Rechner würfeln danach neu und antworten deshalb anders als vorher; '
        + 'wie oft du zurückgenommen hast, steht in der Statistik.'));
      d.append(el('p', 'notiz', 'Wichtig zum Verständnis der Hinweise: Die drei Mitspieler '
        + 'spielen nicht nach Merksätzen, sondern rechnen – und der Tipp benutzt genau '
        + 'dieselbe Rechnung, nur aus deiner Sicht. Merksätze stecken an zwei Stellen darin: '
        + 'Sie steuern, wie eine gewürfelte Verteilung zu Ende gespielt wird, und sie '
        + 'entscheiden, wenn zwei Karten rechnerisch gleichauf liegen. Der Satz, der dir '
        + 'den Zug erklärt, ist noch einmal etwas anderes: Er beschreibt die Lage, er liest '
        + 'nicht die Rechnung mit. Deshalb steht beim Tipp dabei, ob der Zug dem Merksatz '
        + 'folgt oder gegen ihn geht.'));
      d.append(el('p', 'notiz', 'Die drei Gegenspieler rechnen: aus dem, was sie sehen dürfen, '
        + 'würfeln sie zweihundert mögliche Verteilungen der fremden Karten, spielen jede zu '
        + 'Ende und nehmen die Karte, die am häufigsten reicht. Liegen nur noch wenige Karten, '
        + 'wird nicht mehr geschätzt, sondern exakt durchgerechnet. In die Karten schauen sie '
        + 'dir dabei nicht – so wenig wie der Hinweisgeber.'));
      s.blatt({ titel: 'Schafkopf', inhalt: d, aktionen: [{ text: 'Passt' }] });
    }

    /* --------------------------------------------------------------- Start */

    if (!stand.haende[0].length && !stand.haende[1].length) {
      geben();
    } else {
      zeichnen();
      if (stand.phase === 'ansage') ansageWeiter();
      else if (stand.phase === 'spiel') zugWeiter();
      else if (stand.phase === 'weiter') spaeter(geben, 1200);
    }

    return { ende: () => { uhrenAus(); sichern(); } };
  }

  /* ------------------------------------------------------------- Statistik */

  function auswertung(partien, hilfe) {
    const raus = [];
    const punkte = partien.reduce((s, p) => s + (typeof p.punkte === 'number' ? p.punkte : 0), 0);
    raus.push({ wert: (punkte > 0 ? '+' : '') + punkte, label: 'Punkte gesamt' });

    const selbst = partien.filter((p) => p.alsSpieler);
    if (selbst.length) {
      raus.push({
        wert: selbst.filter((p) => p.gewonnen).length + '/' + selbst.length,
        label: 'Siege als Spieler',
      });
    }
    const allein = partien.filter((p) => p.alsSpieler && p.spielart && p.spielart !== 'sau');
    if (allein.length) {
      raus.push({
        wert: allein.filter((p) => p.gewonnen).length + '/' + allein.length,
        label: 'Siege im Alleinspiel',
      });
    }
    const augen = partien.filter((p) => typeof p.augen === 'number').map((p) => p.augen);
    if (augen.length) {
      raus.push({
        wert: Math.round(augen.reduce((s, a) => s + a, 0) / augen.length) + '',
        label: 'Augen im Schnitt',
      });
    }
    /* Wie oft lag die eigene Karte auf der besten? Nur aus Partien, in denen
       das Mitlesen anlag – sonst wurde nichts gezählt. */
    const zurueck = partien.reduce((n, p) => n + (p.zurueck || 0), 0);
    if (zurueck) {
      raus.push({ wert: String(zurueck), label: zurueck === 1 ? 'Zug zurück' : 'Züge zurück' });
    }
    const gemessen = partien.filter((p) => p.gezaehlt > 0);
    if (gemessen.length) {
      const t = gemessen.reduce((s, p) => s + p.treffer, 0);
      const g = gemessen.reduce((s, p) => s + p.gezaehlt, 0);
      raus.push({ wert: hilfe.prozent(t, g), label: 'beste Karte' });
    }
    return raus;
  }

  Rahmen.anmelden({
    id: 'schafkopf',
    name: 'Schafkopf',
    unter: 'Bayrisch, zu viert, mit Lehrer.',
    farbe: '#8C5A2E',
    symbol: '<path d="M6.5 8.5c0-2 2.5-3.5 5.5-3.5s5.5 1.5 5.5 3.5z"/>'
      + '<path d="M7 8.5h10c0 5.7-2 9.8-5 9.8s-5-4.1-5-9.8z"/>',
    starten,
    auswertung,
  });
})();
