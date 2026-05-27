// All calibration passages with keyword scoring
// difficulty: 'easy' | 'medium' | 'hard' | 'long'
// stage: 'demo' | 'baseline' | 'ramp' | 'confirm'

const PASSAGES = [
  // ─── GERMAN DEMO (stage: demo) ────────────────────────────────────────────
  {
    id: 'de_demo_1', lang: 'de', stage: 'demo', difficulty: 'easy',
    text: 'Die Katze schläft auf dem Sofa. Draußen scheint die Sonne hell. Vögel singen im Garten. Der Hund liegt neben der Tür. Es ist ein ruhiger Morgen.',
    keywords: ['katze', 'sofa', 'sonne', 'hund', 'morgen'], targetWpm: 150,
  },

  // ─── GERMAN BASELINE – easy (stage: baseline, tested at 150/200/250/300) ──
  {
    id: 'de_bl_1', lang: 'de', stage: 'baseline', difficulty: 'easy',
    text: 'Die Bäckerei öffnet jeden Morgen um sechs Uhr. Der Duft von frischem Brot zieht durch die Straße. Menschen stehen Schlange für Brötchen und Croissants. Das Brot wird aus Mehl, Wasser und Hefe gebacken.',
    keywords: ['bäckerei', 'brot', 'mehl', 'hefe'], targetWpm: 150,
  },
  {
    id: 'de_bl_2', lang: 'de', stage: 'baseline', difficulty: 'easy',
    text: 'Im Herbst fallen die Blätter von den Bäumen. Das Laub färbt sich rot, orange und gelb. Kinder spielen in großen Laubhaufen. Der Wind trägt die Blätter weit durch die Luft.',
    keywords: ['herbst', 'blätter', 'laubhaufen', 'wind'], targetWpm: 200,
  },
  {
    id: 'de_bl_3', lang: 'de', stage: 'baseline', difficulty: 'easy',
    text: 'Fahrräder sind ein umweltfreundliches Verkehrsmittel. In vielen Städten gibt es eigene Fahrradwege. Das Fahrrad wurde im 19. Jahrhundert erfunden. Radfahren ist gut für Gesundheit und Umwelt.',
    keywords: ['fahrrad', 'städten', 'erfunden', 'gesundheit'], targetWpm: 250,
  },
  {
    id: 'de_bl_4', lang: 'de', stage: 'baseline', difficulty: 'easy',
    text: 'Schwimmen ist eine der gesündesten Sportarten überhaupt. Es trainiert fast alle Muskeln des Körpers gleichzeitig. Wasser trägt das Körpergewicht und schont die Gelenke. Selbst ältere Menschen können problemlos schwimmen.',
    keywords: ['schwimmen', 'muskeln', 'gelenke', 'körper'], targetWpm: 300,
  },

  // ─── GERMAN RAMP – medium (stage: ramp, 25-40 words each) ─────────────────
  {
    id: 'de_r_1', lang: 'de', stage: 'ramp', difficulty: 'medium',
    text: 'Wasser bedeckt etwa 71 Prozent der Erdoberfläche. Die Ozeane enthalten 97 Prozent des gesamten Wassers. Süßwasser ist eine seltene und wertvolle Ressource für alle Lebewesen.',
    keywords: ['wasser', 'ozeane', 'süßwasser', 'prozent'], targetWpm: 300,
  },
  {
    id: 'de_r_2', lang: 'de', stage: 'ramp', difficulty: 'medium',
    text: 'Bienen bestäuben jährlich Pflanzen im Wert von Milliarden Euro. Ohne Bestäubung würde ein Drittel unserer Nahrungsmittel wegfallen. Der Rückgang der Bienenpopulation bedroht die globale Landwirtschaft ernsthaft.',
    keywords: ['bienen', 'bestäubung', 'nahrungsmittel', 'landwirtschaft'], targetWpm: 325,
  },
  {
    id: 'de_r_3', lang: 'de', stage: 'ramp', difficulty: 'medium',
    text: 'Das menschliche Gehirn besteht aus etwa 86 Milliarden Nervenzellen. Diese Neuronen bilden Billionen von Verbindungen untereinander. Das Gehirn verbraucht 20 Prozent der Energie des gesamten Körpers.',
    keywords: ['gehirn', 'milliarden', 'neuronen', 'energie'], targetWpm: 350,
  },
  {
    id: 'de_r_4', lang: 'de', stage: 'ramp', difficulty: 'medium',
    text: 'Kaffee ist das meistkonsumierte Getränk nach Wasser weltweit. Brasilien produziert rund ein Drittel des gesamten Kaffees. Das Koffein im Kaffee blockiert Adenosinrezeptoren im Gehirn und wirkt so wachmachend.',
    keywords: ['kaffee', 'brasilien', 'koffein', 'adenosin'], targetWpm: 375,
  },
  {
    id: 'de_r_5', lang: 'de', stage: 'ramp', difficulty: 'medium',
    text: 'Schlaf ist für die Gedächtniskonsolidierung unerlässlich. Während des Tiefschlafs überträgt das Gehirn Informationen vom Kurz- ins Langzeitgedächtnis. Schlafmangel beeinträchtigt Konzentration, Reaktionszeit und Immunsystem.',
    keywords: ['schlaf', 'gedächtnis', 'tiefschlaf', 'immunsystem'], targetWpm: 400,
  },
  {
    id: 'de_r_6', lang: 'de', stage: 'ramp', difficulty: 'medium',
    text: 'Musik aktiviert nahezu alle Bereiche des menschlichen Gehirns gleichzeitig. Das Erlernen eines Instruments verändert die Gehirnstruktur nachweislich. Musiktherapie hilft bei Depressionen, Demenz und chronischen Schmerzen.',
    keywords: ['musik', 'instrument', 'gehirnstruktur', 'musiktherapie'], targetWpm: 425,
  },
  {
    id: 'de_r_7', lang: 'de', stage: 'ramp', difficulty: 'hard',
    text: 'Quantenverschränkung ermöglicht instantane Korrelationen zwischen Teilchen unabhängig von ihrer Entfernung. Einstein bezeichnete dies als spukhafte Fernwirkung und bezweifelte ihre Realität. Bell-Tests haben die Existenz der Verschränkung experimentell bestätigt.',
    keywords: ['quantenverschränkung', 'teilchen', 'einstein', 'bell'], targetWpm: 450,
  },
  {
    id: 'de_r_8', lang: 'de', stage: 'ramp', difficulty: 'hard',
    text: 'Neuronale Netzwerke ahmen die Struktur biologischer Gehirne nach. Backpropagation passt Gewichte durch Gradientenabstieg an die Verlustfunktion an. Transformer-Architekturen revolutionieren seit 2017 die Sprachverarbeitung fundamental.',
    keywords: ['netzwerke', 'backpropagation', 'transformer', 'sprachverarbeitung'], targetWpm: 475,
  },
  {
    id: 'de_r_9', lang: 'de', stage: 'ramp', difficulty: 'hard',
    text: 'Die Relativitätstheorie postuliert, dass Raum und Zeit ein vierdimensionales Kontinuum bilden. Massive Objekte krümmen die Raumzeit und erzeugen dadurch Gravitation. GPS-Satelliten müssen relativistische Zeitkorrekturen berücksichtigen.',
    keywords: ['relativitätstheorie', 'raumzeit', 'gravitation', 'gps'], targetWpm: 500,
  },
  {
    id: 'de_r_10', lang: 'de', stage: 'ramp', difficulty: 'hard',
    text: 'Schwarze Löcher entstehen aus dem Kollaps massereicher Sterne am Ende ihrer Lebenszeit. Die Ereignishorizontfläche eines Schwarzen Lochs kodiert alle Informationen seines Inhalts nach dem Holographieprinzip.',
    keywords: ['schwarze', 'sterne', 'ereignishorizont', 'holographie'], targetWpm: 525,
  },
  {
    id: 'de_r_11', lang: 'de', stage: 'ramp', difficulty: 'hard',
    text: 'Die CRISPR-Cas9-Methode erlaubt präzises Editieren von DNA-Sequenzen in lebenden Organismen. Wissenschaftlerinnen konnten damit bereits Erbkrankheiten in Keimbahnzellen korrigieren. Ethische Debatten betreffen insbesondere die Keimbahntherapie am Menschen.',
    keywords: ['crispr', 'dna', 'erbkrankheiten', 'keimbahn'], targetWpm: 550,
  },
  {
    id: 'de_r_12', lang: 'de', stage: 'ramp', difficulty: 'hard',
    text: 'Bewusstsein bleibt eines der tiefsten ungelösten Probleme der Wissenschaft. Das sogenannte Hard Problem fragt, warum physikalische Prozesse subjektive Erfahrungen erzeugen. Theorien reichen von panpsychistischen Ansätzen bis zu rein funktionalistischen Erklärungen.',
    keywords: ['bewusstsein', 'hard problem', 'panpsychismus', 'funktionalismus'], targetWpm: 575,
  },

  // ─── GERMAN CONFIRM – long passages (stage: confirm, ~130 words) ───────────
  {
    id: 'de_c_1', lang: 'de', stage: 'confirm', difficulty: 'long',
    text: 'Johannes Gutenberg erfand um 1450 den Buchdruck mit beweglichen Lettern aus Blei. Diese Erfindung veränderte die Welt grundlegend und beendete das Zeitalter handgeschriebener Bücher. Innerhalb weniger Jahrzehnte entstanden in Europa Tausende von Druckereien. Bücher wurden erschwinglich und erreichten erstmals breite Bevölkerungsschichten. Die Alphabetisierungsrate stieg dramatisch an. Die Reformation Martin Luthers wäre ohne den Buchdruck undenkbar gewesen. Luthers Thesen verbreiteten sich in wenigen Wochen durch ganz Deutschland. Auch die Wissenschaftliche Revolution profitierte enorm vom Buchdruck. Wissenschaftler konnten Ergebnisse schnell und präzise verbreiten. Das Wissen war nicht länger Privileg von Klöstern und Universitäten. Gutenbergs Erfindung gilt als eine der bedeutendsten der Menschheitsgeschichte. Sie ebnete den Weg für Demokratie, Aufklärung und die moderne Informationsgesellschaft.',
    keywords: ['gutenberg', 'buchdruck', 'luther', 'alphabetisierung', 'reformation'], targetWpm: 300,
  },
  {
    id: 'de_c_2', lang: 'de', stage: 'confirm', difficulty: 'long',
    text: 'Charles Darwin entwickelte die Evolutionstheorie nach einer fünfjährigen Forschungsreise auf dem Schiff Beagle. Er beobachtete auf den Galapagos-Inseln, wie verschiedene Finkenarten unterschiedliche Schnabelformen entwickelt hatten. Jede Form war perfekt an die verfügbare Nahrung angepasst. 1859 veröffentlichte er sein Hauptwerk Über die Entstehung der Arten. Darin beschrieb er das Prinzip der natürlichen Selektion. Individuen mit vorteilhaften Merkmalen überleben häufiger und geben ihre Gene weiter. Über Generationen entstehen so neue Arten. Die Theorie revolutionierte die Biologie und das Weltbild der Menschheit. Sie widersprach dem damals vorherrschenden religiösen Schöpfungsglauben fundamental. Heute ist die Evolutionstheorie durch fossile Funde und Genetik bestens belegt. Darwin wird als einer der einflussreichsten Wissenschaftler aller Zeiten betrachtet.',
    keywords: ['darwin', 'evolution', 'galapagos', 'selektion', 'arten'], targetWpm: 350,
  },
  {
    id: 'de_c_3', lang: 'de', stage: 'confirm', difficulty: 'long',
    text: 'Albert Einstein veröffentlichte 1905 die spezielle Relativitätstheorie, sein sogenanntes Annus Mirabilis. Er zeigte, dass Zeit und Raum relativ sind und von der Geschwindigkeit des Beobachters abhängen. Die berühmte Formel E gleich mc Quadrat beschreibt die Äquivalenz von Masse und Energie. Ein einziges Gramm Materie enthält enorme Energiemengen. 1915 folgte die allgemeine Relativitätstheorie, die Gravitation als Krümmung der Raumzeit erklärt. Eddingtons Sonnenfinsternis-Expedition von 1919 bestätigte die Ablenkung des Lichts durch Gravitation. Einstein erhielt 1921 den Nobelpreis, allerdings für seine Erklärung des Photoeffekts. Er verbrachte seine späten Jahre mit der Suche nach einer vereinheitlichten Feldtheorie, die alle Naturkräfte beschreibt. Obwohl er dabei scheiterte, bleibt er der bedeutendste Physiker des 20. Jahrhunderts.',
    keywords: ['einstein', 'relativität', 'energie', 'gravitation', 'nobelpreis'], targetWpm: 380,
  },
  {
    id: 'de_c_4', lang: 'de', stage: 'confirm', difficulty: 'long',
    text: 'Ludwig van Beethoven gilt als einer der größten Komponisten der Musikgeschichte. Er wurde 1770 in Bonn geboren und zog als junger Mann nach Wien. Bereits in seinen Zwanzigern begann er, sein Gehör zu verlieren, was für einen Musiker eine Katastrophe darstellt. Trotz seiner zunehmenden Taubheit komponierte er weiterhin und schrieb seine bedeutendsten Werke in dieser Zeit. Die Neunte Sinfonie, sein letztes großes Orchesterwerk, schrieb er bereits vollständig taub. Bei der Uraufführung konnte er den Jubel des Publikums nicht hören. Jemand musste ihn zum Zuhörerraum drehen, damit er die stehenden Ovationen sehen konnte. Seine Eroica-Sinfonie brach mit allen bis dahin gültigen musikalischen Konventionen. Beethoven stand an der Schnittstelle zwischen Klassik und Romantik und prägte beide Epochen nachhaltig.',
    keywords: ['beethoven', 'bonn', 'taubheit', 'neunte', 'sinfonie'], targetWpm: 350,
  },
  {
    id: 'de_c_5', lang: 'de', stage: 'confirm', difficulty: 'long',
    text: 'Der Klimawandel ist die größte Herausforderung des 21. Jahrhunderts. Seit der Industrialisierung hat die durchschnittliche Erdtemperatur um etwa 1,2 Grad Celsius zugenommen. Hauptursache ist der Ausstoß von Treibhausgasen wie CO2 und Methan durch Verbrennung fossiler Brennstoffe. Die Folgen sind bereits spürbar: häufigere Extremwetterereignisse, steigende Meeresspiegel und schwindende Gletscher. Das Pariser Klimaabkommen von 2015 setzt das Ziel, die Erwärmung auf 1,5 Grad zu begrenzen. Um dieses Ziel zu erreichen, müssten die globalen CO2-Emissionen bis 2050 auf Netto-Null sinken. Erneuerbare Energien wie Solar und Wind sind bereits heute die günstigsten Stromquellen. Die Herausforderung liegt in der Geschwindigkeit des Umbaus des Energiesystems. Ohne sofortiges Handeln werden die Konsequenzen für kommende Generationen dramatisch sein.',
    keywords: ['klimawandel', 'treibhausgase', 'paris', 'temperatur', 'erneuerbare'], targetWpm: 380,
  },

  // ─── GERMAN EXTRA EASY (for ramp start / variety) ────────────────────────
  {
    id: 'de_e_1', lang: 'de', stage: 'ramp', difficulty: 'easy',
    text: 'Katzen schlafen durchschnittlich 15 Stunden pro Tag. Im Schlaf jagen sie in Träumen Mäuse. Hauskatzen sind trotz Jahrtausenden der Domestizierung Einzelgänger geblieben.',
    keywords: ['katzen', 'stunden', 'träumen', 'domestizierung'], targetWpm: 200,
  },
  {
    id: 'de_e_2', lang: 'de', stage: 'ramp', difficulty: 'easy',
    text: 'Der Amazonas-Regenwald bedeckt etwa 40 Prozent Südamerikas. Er wird als Lunge der Erde bezeichnet. Täglich werden jedoch Flächen so groß wie tausende Fußballfelder abgeholzt.',
    keywords: ['amazonas', 'südamerika', 'lunge', 'abgeholzt'], targetWpm: 225,
  },
  {
    id: 'de_e_3', lang: 'de', stage: 'ramp', difficulty: 'easy',
    text: 'Die Tomate stammt ursprünglich aus Südamerika. Azteken kultivierten sie vor mehr als 500 Jahren. Nach Europa gelangte die Tomate erst im 16. Jahrhundert durch spanische Seefahrer.',
    keywords: ['tomate', 'südamerika', 'azteken', 'spanische'], targetWpm: 250,
  },
  {
    id: 'de_e_4', lang: 'de', stage: 'ramp', difficulty: 'easy',
    text: 'Honigbienen kommunizieren durch den Schwänzeltanz. Mit diesem Tanz teilen sie der Kolonie den Weg zu Futterquellen mit. Die Richtung zeigt an, in welchem Winkel zur Sonne die Nahrung liegt.',
    keywords: ['honigbienen', 'schwänzeltanz', 'kolonie', 'futterquellen'], targetWpm: 275,
  },

  // ─── ENGLISH DEMO ─────────────────────────────────────────────────────────
  {
    id: 'en_demo_1', lang: 'en', stage: 'demo', difficulty: 'easy',
    text: 'The cat sits by the window watching birds. Outside the sun is shining brightly. Clouds drift slowly across the blue sky. A gentle breeze moves the curtains. It is a peaceful afternoon.',
    keywords: ['cat', 'window', 'birds', 'sun', 'breeze'], targetWpm: 150,
  },

  // ─── ENGLISH BASELINE ─────────────────────────────────────────────────────
  {
    id: 'en_bl_1', lang: 'en', stage: 'baseline', difficulty: 'easy',
    text: 'Bread is one of the oldest foods known to humanity. It has been made for thousands of years across many cultures. The basic ingredients are flour, water, yeast, and salt. Each region has developed its own unique style of bread.',
    keywords: ['bread', 'flour', 'yeast', 'cultures'], targetWpm: 150,
  },
  {
    id: 'en_bl_2', lang: 'en', stage: 'baseline', difficulty: 'easy',
    text: 'In autumn, trees shed their leaves to survive the winter. The leaves change colour before falling, turning red, orange and yellow. This process is called senescence. The leaf colours come from pigments revealed as chlorophyll breaks down.',
    keywords: ['autumn', 'leaves', 'senescence', 'chlorophyll'], targetWpm: 200,
  },
  {
    id: 'en_bl_3', lang: 'en', stage: 'baseline', difficulty: 'easy',
    text: 'Bicycles are one of the most efficient forms of human transport. They convert human energy into motion more efficiently than any other machine. Cycling is good for health, the environment, and urban traffic. The first true bicycle was invented in the 1880s.',
    keywords: ['bicycles', 'efficient', 'cycling', 'invented'], targetWpm: 250,
  },
  {
    id: 'en_bl_4', lang: 'en', stage: 'baseline', difficulty: 'easy',
    text: 'Swimming exercises almost every muscle group in the human body. The water supports body weight, reducing stress on joints. This makes swimming ideal for people of all ages and fitness levels. Regular swimming improves cardiovascular health significantly.',
    keywords: ['swimming', 'muscles', 'joints', 'cardiovascular'], targetWpm: 300,
  },

  // ─── ENGLISH RAMP ─────────────────────────────────────────────────────────
  {
    id: 'en_r_1', lang: 'en', stage: 'ramp', difficulty: 'medium',
    text: 'The oceans cover about 71 percent of Earth\'s surface and contain 97 percent of all water. Freshwater is therefore an extremely scarce and precious resource. Only about 3 percent of water on Earth is fresh, and most is locked in glaciers.',
    keywords: ['oceans', 'freshwater', 'glaciers', 'percent'], targetWpm: 300,
  },
  {
    id: 'en_r_2', lang: 'en', stage: 'ramp', difficulty: 'medium',
    text: 'Honeybees pollinate crops worth billions of dollars each year. Without bees, one third of the world\'s food supply would disappear. Colony collapse disorder has caused alarming declines in bee populations globally over the past two decades.',
    keywords: ['honeybees', 'pollinate', 'colony', 'collapse'], targetWpm: 325,
  },
  {
    id: 'en_r_3', lang: 'en', stage: 'ramp', difficulty: 'medium',
    text: 'The human brain contains around 86 billion neurons connected by trillions of synapses. Despite weighing only 1.4 kilograms, the brain consumes 20 percent of the body\'s energy. Neuroplasticity allows the brain to reorganise itself throughout life.',
    keywords: ['neurons', 'synapses', 'kilograms', 'neuroplasticity'], targetWpm: 350,
  },
  {
    id: 'en_r_4', lang: 'en', stage: 'ramp', difficulty: 'medium',
    text: 'Brazil produces roughly one third of the world\'s coffee supply. Coffee is the second most traded commodity on Earth after oil. The caffeine in coffee works by blocking adenosine receptors in the brain, preventing drowsiness.',
    keywords: ['brazil', 'coffee', 'commodity', 'adenosine'], targetWpm: 375,
  },
  {
    id: 'en_r_5', lang: 'en', stage: 'ramp', difficulty: 'medium',
    text: 'Sleep is essential for memory consolidation and learning. During deep sleep the brain transfers information from short-term to long-term memory. Chronic sleep deprivation impairs cognition, immune function, and emotional regulation.',
    keywords: ['sleep', 'consolidation', 'cognition', 'deprivation'], targetWpm: 400,
  },
  {
    id: 'en_r_6', lang: 'en', stage: 'ramp', difficulty: 'medium',
    text: 'Music activates nearly every region of the brain simultaneously, making it uniquely powerful. Learning an instrument physically changes brain structure and improves executive function. Music therapy has demonstrated benefits for dementia, depression, and chronic pain.',
    keywords: ['music', 'instrument', 'therapy', 'executive'], targetWpm: 425,
  },
  {
    id: 'en_r_7', lang: 'en', stage: 'ramp', difficulty: 'hard',
    text: 'Quantum entanglement produces instantaneous correlations between particles regardless of the distance separating them. Einstein called this spooky action at a distance and believed it indicated an incomplete theory. Bell inequality tests have since confirmed the reality of entanglement experimentally.',
    keywords: ['entanglement', 'particles', 'einstein', 'bell'], targetWpm: 450,
  },
  {
    id: 'en_r_8', lang: 'en', stage: 'ramp', difficulty: 'hard',
    text: 'Neural networks are trained using backpropagation to minimise a loss function via gradient descent. Transformer architectures introduced in 2017 have fundamentally changed natural language processing. Attention mechanisms allow models to weigh the relevance of different input tokens simultaneously.',
    keywords: ['backpropagation', 'transformer', 'attention', 'gradient'], targetWpm: 475,
  },
  {
    id: 'en_r_9', lang: 'en', stage: 'ramp', difficulty: 'hard',
    text: 'General relativity describes gravity as the curvature of spacetime caused by mass and energy. GPS satellites must apply relativistic time corrections to maintain accuracy. The bending of light by gravity was confirmed during the 1919 solar eclipse expedition led by Eddington.',
    keywords: ['relativity', 'spacetime', 'gps', 'eddington'], targetWpm: 500,
  },
  {
    id: 'en_r_10', lang: 'en', stage: 'ramp', difficulty: 'hard',
    text: 'Black holes form when massive stars collapse at the end of their lives. The event horizon marks the boundary beyond which nothing, including light, can escape. Hawking radiation predicts that black holes slowly evaporate through quantum effects.',
    keywords: ['black holes', 'collapse', 'hawking', 'event horizon'], targetWpm: 525,
  },
  {
    id: 'en_r_11', lang: 'en', stage: 'ramp', difficulty: 'hard',
    text: 'CRISPR-Cas9 acts as molecular scissors that allow precise editing of DNA sequences in living organisms. It has been used to correct mutations responsible for inherited diseases. The ethical debate centres on germline editing, which would affect future generations.',
    keywords: ['crispr', 'dna', 'germline', 'inherited'], targetWpm: 550,
  },
  {
    id: 'en_r_12', lang: 'en', stage: 'ramp', difficulty: 'hard',
    text: 'Consciousness remains one of the most profound unsolved problems in science. The hard problem asks why subjective experience arises from physical brain processes at all. Competing theories range from integrated information theory to global workspace theory.',
    keywords: ['consciousness', 'subjective', 'integrated', 'global workspace'], targetWpm: 575,
  },

  // ─── ENGLISH EXTRA EASY ───────────────────────────────────────────────────
  {
    id: 'en_e_1', lang: 'en', stage: 'ramp', difficulty: 'easy',
    text: 'Cats sleep an average of fifteen hours per day. They are crepuscular, meaning most active at dawn and dusk. Despite thousands of years of domestication, cats remain largely solitary hunters.',
    keywords: ['cats', 'sleep', 'crepuscular', 'solitary'], targetWpm: 200,
  },
  {
    id: 'en_e_2', lang: 'en', stage: 'ramp', difficulty: 'easy',
    text: 'The Amazon rainforest covers about 40 percent of South America. It is often called the lungs of the Earth because it produces vast amounts of oxygen. Deforestation threatens thousands of species that live nowhere else on the planet.',
    keywords: ['amazon', 'oxygen', 'deforestation', 'species'], targetWpm: 225,
  },
  {
    id: 'en_e_3', lang: 'en', stage: 'ramp', difficulty: 'easy',
    text: 'The tomato originally comes from South America. Aztecs cultivated it over 500 years ago. Spanish sailors brought it to Europe in the 16th century, where it was initially thought to be poisonous.',
    keywords: ['tomato', 'aztecs', 'spanish', 'poisonous'], targetWpm: 250,
  },
  {
    id: 'en_e_4', lang: 'en', stage: 'ramp', difficulty: 'easy',
    text: 'Bees communicate through the waggle dance to share the location of food sources. The direction of the dance indicates the angle to the sun where flowers can be found. The duration signals the distance to the food.',
    keywords: ['bees', 'waggle', 'direction', 'distance'], targetWpm: 275,
  },

  // ─── ENGLISH CONFIRM – long passages ─────────────────────────────────────
  {
    id: 'en_c_1', lang: 'en', stage: 'confirm', difficulty: 'long',
    text: 'Johannes Gutenberg invented movable type printing around 1450 in Mainz, Germany. His invention transformed the spread of knowledge across Europe and eventually the world. Within decades, printing presses appeared in cities across Europe, producing thousands of books. The cost of books dropped dramatically, making them accessible to people beyond monasteries and universities. Literacy rates began to rise for the first time in centuries. Martin Luther\'s Reformation would have been impossible without the printing press. His 95 Theses spread across Germany within weeks thanks to printing technology. The Scientific Revolution similarly benefited, allowing scientists to share findings rapidly and precisely. Gutenberg\'s invention is widely regarded as one of the most transformative in human history. It laid the groundwork for the Enlightenment, democratic thought, and the modern information society.',
    keywords: ['gutenberg', 'printing', 'luther', 'literacy', 'reformation'], targetWpm: 300,
  },
  {
    id: 'en_c_2', lang: 'en', stage: 'confirm', difficulty: 'long',
    text: 'Charles Darwin developed his theory of evolution during a five-year voyage on HMS Beagle. On the Galapagos Islands, he observed finches with different beak shapes adapted to different food sources. This observation was crucial to his later thinking. In 1859 he published On the Origin of Species, describing natural selection as the mechanism of evolution. Individuals with favourable traits survive more often and pass their genes to the next generation. Over many generations, populations change and new species emerge. The theory revolutionised biology and challenged prevailing religious views of creation. Today evolution is supported by an overwhelming body of evidence from palaeontology, genetics, and direct observation. Darwin is considered one of the most influential scientists in the history of biology and human thought.',
    keywords: ['darwin', 'galapagos', 'selection', 'species', 'evolution'], targetWpm: 325,
  },
  {
    id: 'en_c_3', lang: 'en', stage: 'confirm', difficulty: 'long',
    text: 'Albert Einstein published the special theory of relativity in 1905, one of four landmark papers written in a single year. He showed that time and space are relative and depend on the observer\'s velocity. The famous equation E equals mc squared reveals that mass and energy are equivalent. A tiny amount of mass contains an enormous amount of energy. His general theory of relativity in 1915 reinterpreted gravity as the curvature of spacetime caused by mass. Arthur Eddington confirmed this in 1919 by observing the bending of starlight around the Sun during a solar eclipse. Einstein received the Nobel Prize in 1921, though for his explanation of the photoelectric effect rather than relativity. He spent his final decades searching for a unified field theory to reconcile all forces of nature.',
    keywords: ['einstein', 'relativity', 'eddington', 'gravity', 'nobel'], targetWpm: 350,
  },
  {
    id: 'en_c_4', lang: 'en', stage: 'confirm', difficulty: 'long',
    text: 'Ludwig van Beethoven was born in Bonn in 1770 and moved to Vienna as a young man. He studied briefly under Joseph Haydn and quickly became one of the most celebrated composers in Europe. In his late twenties he began to lose his hearing, a devastating condition for any musician. Despite worsening deafness, he continued composing and produced some of his greatest works. His Fifth Symphony, with its famous four-note motif, became one of the most recognised pieces in classical music. The Ninth Symphony, his final complete symphony, was composed when Beethoven was entirely deaf. At its premiere he had to be turned around to see the audience applauding because he could not hear the ovation. Beethoven stands at the bridge between the Classical and Romantic eras, having profoundly influenced both.',
    keywords: ['beethoven', 'bonn', 'deaf', 'ninth', 'symphony'], targetWpm: 350,
  },
  {
    id: 'en_c_5', lang: 'en', stage: 'confirm', difficulty: 'long',
    text: 'Climate change is the defining challenge of the 21st century. Since industrialisation began, average global temperatures have risen by approximately 1.2 degrees Celsius. The primary cause is the emission of greenhouse gases such as carbon dioxide and methane from burning fossil fuels. The consequences are already visible: more frequent extreme weather events, rising sea levels, and melting glaciers. The Paris Agreement of 2015 set the goal of limiting warming to 1.5 degrees above pre-industrial levels. Achieving this would require global carbon emissions to reach net zero by 2050. Renewable energy sources such as solar and wind are now cheaper than fossil fuels in many markets. The challenge is the speed of transition across all sectors of the global economy. Without rapid and sustained action, the consequences for future generations will be irreversible.',
    keywords: ['climate', 'celsius', 'paris', 'fossil', 'renewable'], targetWpm: 380,
  },

  // ─── ADDITIONAL GERMAN MEDIUM (for variety in ramp) ──────────────────────
  {
    id: 'de_m_1', lang: 'de', stage: 'ramp', difficulty: 'medium',
    text: 'Der Amazonas ist der wasserreichste Fluss der Welt. Er transportiert etwa 20 Prozent des weltweiten Flusswasserabflusses ins Meer. In seinem Einzugsgebiet leben mehr als drei Millionen Tier- und Pflanzenarten.',
    keywords: ['amazonas', 'fluss', 'millionen', 'arten'], targetWpm: 300,
  },
  {
    id: 'de_m_2', lang: 'de', stage: 'ramp', difficulty: 'medium',
    text: 'Impfungen sind eine der wirksamsten Methoden der modernen Medizin. Sie haben Pocken ausgerottet und Polio fast vollständig eliminiert. Das Immunsystem wird trainiert, Krankheitserreger ohne echte Infektion zu erkennen.',
    keywords: ['impfungen', 'pocken', 'polio', 'immunsystem'], targetWpm: 325,
  },
  {
    id: 'de_m_3', lang: 'de', stage: 'ramp', difficulty: 'medium',
    text: 'Solarenergie ist heute die günstigste Stromquelle der Geschichte. In den letzten zehn Jahren sind die Kosten um über 90 Prozent gesunken. Deutschland hat 2023 erstmals mehr als die Hälfte seines Stroms aus erneuerbaren Quellen gewonnen.',
    keywords: ['solar', 'kosten', 'deutschland', 'erneuerbare'], targetWpm: 350,
  },
  {
    id: 'de_m_4', lang: 'de', stage: 'ramp', difficulty: 'medium',
    text: 'Es gibt etwa 7000 lebende Sprachen auf der Welt. Jede zweite Woche stirbt statistisch eine Sprache aus. Mandarin ist die meistgesprochene Muttersprache, Englisch die verbreitetste Weltsprache insgesamt.',
    keywords: ['sprachen', 'mandarin', 'englisch', 'aussterben'], targetWpm: 375,
  },
  {
    id: 'de_m_5', lang: 'de', stage: 'ramp', difficulty: 'medium',
    text: 'Das Oktopus-Gehirn ist verblüffend komplex für ein Wirbelloses. Zwei Drittel seiner Neuronen befinden sich nicht im Gehirn, sondern in den Armen. Oktopusse können Werkzeuge benutzen, Rätsel lösen und sich in Spiegel erkennen.',
    keywords: ['oktopus', 'neuronen', 'arme', 'werkzeuge'], targetWpm: 400,
  },
  {
    id: 'de_m_6', lang: 'de', stage: 'ramp', difficulty: 'medium',
    text: 'Die Internationales Raumstation ISS umkreist die Erde in 400 Kilometern Höhe. Sie bewegt sich mit 28.000 Kilometern pro Stunde und umrundet die Erde 16 Mal täglich. Astronauten erleben dadurch täglich 16 Sonnenaufgänge.',
    keywords: ['raumstation', 'iss', 'kilometer', 'sonnenaufgänge'], targetWpm: 425,
  },

  // ─── ADDITIONAL ENGLISH MEDIUM (for variety in ramp) ─────────────────────
  {
    id: 'en_m_1', lang: 'en', stage: 'ramp', difficulty: 'medium',
    text: 'The Amazon River carries about 20 percent of the world\'s total river discharge into the ocean. Its basin hosts more than three million species of animals and plants. Deforestation threatens this extraordinary reservoir of biodiversity.',
    keywords: ['amazon', 'discharge', 'species', 'biodiversity'], targetWpm: 300,
  },
  {
    id: 'en_m_2', lang: 'en', stage: 'ramp', difficulty: 'medium',
    text: 'Vaccines are among the most effective tools in modern medicine. They have eradicated smallpox and nearly eliminated polio worldwide. The immune system is trained to recognise pathogens without causing actual disease, preventing future infections.',
    keywords: ['vaccines', 'smallpox', 'polio', 'immune'], targetWpm: 325,
  },
  {
    id: 'en_m_3', lang: 'en', stage: 'ramp', difficulty: 'medium',
    text: 'Solar energy is now the cheapest source of electricity in history. Costs have fallen by over 90 percent in the past decade. Many countries now generate more electricity from solar panels than from coal or gas during sunny months.',
    keywords: ['solar', 'cheapest', 'electricity', 'coal'], targetWpm: 350,
  },
  {
    id: 'en_m_4', lang: 'en', stage: 'ramp', difficulty: 'medium',
    text: 'There are approximately 7000 living languages in the world today. On average one language disappears every two weeks. Mandarin is the most spoken mother tongue, while English is the most widely used second language globally.',
    keywords: ['languages', 'mandarin', 'english', 'disappears'], targetWpm: 375,
  },
  {
    id: 'en_m_5', lang: 'en', stage: 'ramp', difficulty: 'medium',
    text: 'Octopus brains are remarkably complex for invertebrates. Two thirds of their neurons are located in their arms rather than their central brain. Octopuses can use tools, solve puzzles, and have shown signs of self-recognition in mirrors.',
    keywords: ['octopus', 'neurons', 'arms', 'tools'], targetWpm: 400,
  },
  {
    id: 'en_m_6', lang: 'en', stage: 'ramp', difficulty: 'medium',
    text: 'The International Space Station orbits Earth at an altitude of 400 kilometres. It travels at 28,000 kilometres per hour, completing 16 orbits of Earth every day. Astronauts aboard experience 16 sunrises and sunsets within a single 24-hour period.',
    keywords: ['space station', 'orbits', 'sunrises', 'kilometres'], targetWpm: 425,
  },

  // ─── ADDITIONAL GERMAN HARD (for high-speed ramp) ─────────────────────────
  {
    id: 'de_h_1', lang: 'de', stage: 'ramp', difficulty: 'hard',
    text: 'Thermodynamik beschreibt den Zusammenhang zwischen Wärme, Arbeit und Energie. Der zweite Hauptsatz besagt, dass die Entropie eines abgeschlossenen Systems nie abnimmt. Dies erklärt die Zeitrichtung vieler physikalischer Prozesse.',
    keywords: ['thermodynamik', 'entropie', 'energie', 'zeitrichtung'], targetWpm: 600,
  },
  {
    id: 'de_h_2', lang: 'de', stage: 'ramp', difficulty: 'hard',
    text: 'Sprachphilosophie untersucht das Verhältnis zwischen Sprache, Bedeutung und Wirklichkeit. Wittgensteins Privatsprachen-Argument zeigt, dass rein private Bedeutungen logisch unmöglich sind. Bedeutung entsteht immer durch den sozialen Gebrauch in Sprachspielen.',
    keywords: ['sprachphilosophie', 'wittgenstein', 'bedeutung', 'sprachspiele'], targetWpm: 625,
  },
  {
    id: 'de_h_3', lang: 'de', stage: 'ramp', difficulty: 'hard',
    text: 'Künstliche Superintelligenz, sofern realisierbar, könnte das Alignment-Problem aufwerfen. Ein System mit erheblich größeren kognitiven Fähigkeiten als Menschen muss korrekt auf menschliche Werte ausgerichtet sein. Unkontrolliertes Optimieren auf falsche Ziele wäre katastrophal.',
    keywords: ['superintelligenz', 'alignment', 'werte', 'optimieren'], targetWpm: 650,
  },

  // ─── ADDITIONAL ENGLISH HARD ──────────────────────────────────────────────
  {
    id: 'en_h_1', lang: 'en', stage: 'ramp', difficulty: 'hard',
    text: 'Thermodynamics describes the relationship between heat, work, and energy. The second law states that entropy in an isolated system never decreases over time. This asymmetry explains the arrow of time and why many physical processes are irreversible.',
    keywords: ['thermodynamics', 'entropy', 'isolated', 'irreversible'], targetWpm: 600,
  },
  {
    id: 'en_h_2', lang: 'en', stage: 'ramp', difficulty: 'hard',
    text: 'Philosophy of language examines the relationship between language, meaning, and reality. Wittgenstein\'s private language argument demonstrates that purely private meanings are logically incoherent. Meaning emerges through shared social practice within what he called language games.',
    keywords: ['wittgenstein', 'private', 'meaning', 'language games'], targetWpm: 625,
  },
  {
    id: 'en_h_3', lang: 'en', stage: 'ramp', difficulty: 'hard',
    text: 'Artificial superintelligence, if achievable, raises the alignment problem. A system with vastly greater cognitive capacity than humans must be correctly aligned with human values. Unconstrained optimisation toward misspecified goals could produce catastrophic outcomes.',
    keywords: ['superintelligence', 'alignment', 'values', 'optimisation'], targetWpm: 650,
  },
];

// Build index for fast lookup
const byLang = {};
const byStage = {};
const byDifficulty = {};

for (const p of PASSAGES) {
  if (!byLang[p.lang]) byLang[p.lang] = [];
  byLang[p.lang].push(p);

  const sk = `${p.lang}:${p.stage}`;
  if (!byStage[sk]) byStage[sk] = [];
  byStage[sk].push(p);

  const dk = `${p.lang}:${p.stage}:${p.difficulty}`;
  if (!byDifficulty[dk]) byDifficulty[dk] = [];
  byDifficulty[dk].push(p);
}

export function getPassagesForStage(lang, stage, difficulty) {
  const key = `${lang}:${stage}:${difficulty}`;
  return (byDifficulty[key] || byStage[`${lang}:${stage}`] || byLang[lang] || PASSAGES).slice();
}

export function getDemoPassage(lang) {
  return byStage[`${lang}:demo`]?.[0] || byStage['de:demo'][0];
}

export function getBaselinePassages(lang) {
  // Returns 4 passages for the 4 speed levels [150, 200, 250, 300]
  const pool = byStage[`${lang}:baseline`] || byStage['de:baseline'] || [];
  // Ensure at least 4; cycle if needed
  const result = [];
  for (let i = 0; i < 4; i++) result.push(pool[i % pool.length]);
  return result;
}

export function getConfirmPassage(lang, exclude = []) {
  const pool = (byStage[`${lang}:confirm`] || byStage['de:confirm'] || [])
    .filter(p => !exclude.includes(p.id));
  if (pool.length === 0) return (byStage[`${lang}:confirm`] || byStage['de:confirm'] || [])[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

export { PASSAGES };
