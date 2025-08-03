
import type { ImageSourcePropType } from 'react-native';

export type Category = 'Must-See Spots' | 'Food & Taste' | 'Art & Culture';

export interface Place {
  id: string;
  title: string;
  category: Category;
  coords: { lat: number; lng: number };
  coordText: string;      
  description: string;
  why: string;
  image?: ImageSourcePropType; 

}

export const CATEGORIES: Category[] = [
  'Must-See Spots',
  'Food & Taste',
  'Art & Culture',
];


export const PLACES: Place[] = [
  {
    id: 'st-marks-basilica',
    title: 'St. Mark’s Basilica',
    category: 'Must-See Spots',
    coords: { lat: 45.4342, lng: 12.3397 },
    coordText: '45.4342° N, 12.3397° E',
    description:
      "St. Mark’s Basilica is not just a cathedral — it’s a symbol of Venice's spiritual heart and a fusion of cultures. Constructed in the 11th century and enriched over centuries with spoils from Venice’s trade and conquests, the basilica glows with golden mosaics depicting biblical scenes and saints. Each dome tells its own story. The Pala d’Oro — a gold altarpiece encrusted with gems — is a jewel of Byzantine art. Intricate marble floors, onion-shaped domes, and carved horses above the entrance (replicas; the originals are preserved inside) make this place breathtaking inside and out.",
    why:
      'To stand in awe under the golden domes of a sacred monument that weaves together religion, politics, and the power of the Venetian Republic like no other building in the city.',
    image: require('../assets/st_marks_basilica.png'),
  },
  {
    id: 'doges-palace',
    title: 'Doge’s Palace',
    category: 'Must-See Spots',
    coords: { lat: 45.4336, lng: 12.3403 },
    coordText: '45.4336° N, 12.3403° E',
    description:
      'The Doge’s Palace, or Palazzo Ducale, is where the pulse of Venetian authority beat for centuries. With its pink-and-white marble Gothic façade, the palace hides a complex interior of opulent chambers, grand staircases, secret rooms, and harsh prison cells. Visitors can walk through the Sala del Maggior Consiglio, one of the largest rooms in Europe not supported by columns, decorated with immense canvases by Tintoretto. The infamous Bridge of Sighs connects the palace to the prison — legend says prisoners sighed at their last view of Venice through its narrow windows.',
    why:
      'To enter the political and judicial soul of ancient Venice and feel the sharp contrast between splendor and suffering across the Bridge of Sighs.',
    image: require('../assets/doges_palace.png'),
  },
  {
    id: 'rialto-bridge',
    title: 'Rialto Bridge',
    category: 'Must-See Spots',
    coords: { lat: 45.4380, lng: 12.3358 },
    coordText: '45.4380° N, 12.3358° E',
    description:
      'Built in 1591, the Rialto Bridge is a remarkable single-span stone bridge that replaced earlier wooden versions. It arches elegantly over the Grand Canal, its design balancing beauty and function — with arcades full of small shops once occupied by merchants and today offering souvenirs and jewelry. On either side, the bustling Rialto district hums with life, echoing centuries of trade and voices in many languages. The view from the top is timeless: gondolas below, palazzos reflected in water, and the feeling of being at the heart of Venetian commerce.',
    why:
      'To walk the same path as traders, lovers, and poets — and to capture that perfect Venice photo framed by centuries-old charm.',
    image: require('../assets/rialto_bridge.png'),
  },
  {
    id: 'santa-maria-della-salute',
    title: 'Santa Maria della Salute',
    category: 'Must-See Spots',
    coords: { lat: 45.43, lng: 12.331 },
    coordText: '45.4300° N, 12.3310° E',
    description:
      'Standing majestically at the edge of the Grand Canal, this Baroque church was built in the 17th century as a votive offering after a devastating plague. Its grand dome dominates the skyline from almost every southern viewpoint in Venice. Inside, the church is filled with light, white marble, and artworks by Titian and Tintoretto. The floor itself is a mosaic marvel of geometric design.',
    why:
      'To step into one of Venice’s most striking silhouettes and reflect on how art and architecture were used to honor survival and hope.',
    image: require('../assets/santa_maria_della_salute.png'),
  },
  {
    id: 'campo-santa-margherita',
    title: 'Campo Santa Margherita',
    category: 'Must-See Spots',
    coords: { lat: 45.4339, lng: 12.3233 },
    coordText: '45.4339° N, 12.3233° E',
    description:
      'This spacious square in the Dorsoduro district is one of the few areas in Venice that feels like a real neighborhood — with locals chatting, kids playing football, and students sipping spritz. Surrounded by cafés, bakeries, and small bookshops, it’s lively by day and buzzing in the evening.',
    why:
      'To enjoy an authentic slice of daily Venetian life outside the main tourist flow, where tradition and youth coexist.',
    image: require('../assets/campo_santa_margherita.png'),
  },
  {
    id: 'libreria-acqua-alta',
    title: 'Libreria Acqua Alta',
    category: 'Must-See Spots',
    coords: { lat: 45.4393, lng: 12.3431 },
    coordText: '45.4393° N, 12.3431° E',
    description:
      'One of the most unique bookstores in the world, Libreria Acqua Alta stores its books in gondolas, bathtubs, and waterproof bins — a creative solution to the constant threat of flooding. The quirky shop is filled with vintage postcards, cats lounging on piles of books, and a staircase made entirely of old encyclopedias.',
    why:
      'To discover a whimsical place where literature, water, and Venice’s absurd charm meet in the most Instagrammable corners.',
    image: require('../assets/libreria_acqua_alta.png'),
  },
  {
    id: 'osteria-alle-testiere',
    title: 'Osteria alle Testiere',
    category: 'Food & Taste',
    coords: { lat: 45.4354, lng: 12.3401 },
    coordText: '45.4354° N, 12.3401° E',
    description:
      'A secret culinary gem with only a handful of tables, Osteria alle Testiere offers an ever-changing menu based on what the lagoon provides that day. Located near Campo Santa Maria Formosa, the restaurant champions simplicity, letting the freshness of the seafood shine — whether it\'s razor clams with citrus zest, spider crab pasta, or branzino with aromatic herbs. The chefs are known for their respect for ingredients, and the wine list is curated to highlight small Italian producers.',
    why:
      'To savor a true Venetian meal prepared with mastery and intimacy — a rare experience far from tourist menus and into the soul of local cuisine.',
     image: require('../assets/osteria_alle_testiere.png'),
  },
  {
    id: 'rialto-market',
    title: 'Rialto Market',
    category: 'Food & Taste',
    coords: { lat: 45.4382, lng: 12.3372 },
    coordText: '45.4382° N, 12.3372° E',
    description:
      'Venice’s oldest and liveliest market, dating back to 1097, lies just beside the Rialto Bridge. Early in the morning, the Pescheria (fish market) buzzes with vendors arranging gleaming silver fish, squid, and octopus on crushed ice, while the produce section overflows with artichokes, cherries, herbs, and citrus. The sounds, smells, and colors are a living performance of Venetian life. You might spot local chefs selecting ingredients for the day’s menu.',
    why:
      'To immerse yourself in real Venetian daily rhythms, and understand how cuisine is rooted in tradition, geography, and the tides.',
   image: require('../assets/rialto_market_food.png'),
  },
  {
    id: 'torrefazione-cannaregio',
    title: 'Torrefazione Cannaregio',
    category: 'Food & Taste',
    coords: { lat: 45.4445, lng: 12.3243 },
    coordText: '45.4445° N, 12.3243° E',
    description:
      'In the peaceful Cannaregio district, this historic coffee roaster exudes the smell of roasted beans onto the canal. Operating since 1930, it retains a warm, wood-paneled interior where beans are ground and brewed with care. Locals pop in for quick espressos, while visitors sip cappuccino alongside gondoliers and students.',
    why:
      'To experience coffee as Venetians do — unhurried but purposeful — and to support a rare surviving artisan space in a city of franchises.',
   image: require('../assets/torrefazione_cannaregio.png'),
  },
  {
    id: 'cantina-do-spade',
    title: 'Cantina Do Spade',
    category: 'Food & Taste',
    coords: { lat: 45.4381, lng: 12.3366 },
    coordText: '45.4381° N, 12.3366° E',
    description:
      'Hidden in a narrow alley near the Rialto Market, this traditional bacaro (Venetian wine bar) dates back to the 15th century and once hosted Casanova. It serves classic cicchetti — small bites like baccalà mantecato, crostini with anchovies, and fried seafood. The cozy atmosphere, friendly staff, and local wine create a truly Venetian experience.',
    why:
      'To enjoy affordable, flavorful bites the way Venetians have for centuries — standing with a glass of wine among locals.',
   image: require('../assets/cantina_do_spade.png'),
  },
  {
    id: 'peggy-guggenheim-collection',
    title: 'Peggy Guggenheim Collection',
    category: 'Art & Culture',
    coords: { lat: 45.4304, lng: 12.3318 },
    coordText: '45.4304° N, 12.3318° E',
    description:
      'Housed in the Palazzo Venier dei Leoni on the Grand Canal, this museum was once the home of Peggy Guggenheim herself. A patron of modern art, she collected works by Picasso, Pollock, Duchamp, Kandinsky, and many more. The sculpture garden features works by Marino Marini and Giacometti, and the museum layout feels intimate and personal. Temporary exhibits often focus on women in art and overlooked modernists.',
    why:
      'To stand face-to-face with works that revolutionized art — in a house that once entertained the artists themselves, overlooking the most poetic canal in the world.',
   image: require('../assets/peggy_guggenheim_collection.png'),
  },
  {
    id: 'la-fenice-opera-house',
    title: 'La Fenice Opera House',
    category: 'Art & Culture',
    coords: { lat: 45.4331, lng: 12.3335 },
    coordText: '45.4331° N, 12.3335° E',
    description:
      '“La Fenice” means “The Phoenix,” a fitting name for this opera house that has burned and been reborn more than once. Rebuilt in 2003 after a devastating fire, the interior faithfully recreates its 19th-century splendor: golden balconies, deep red velvet, and intricate frescos. It remains one of Italy’s premier venues for opera, ballet, and orchestral music.',
    why:
      'To hear the soul of Venice in its most passionate form — through music, spectacle, and the resilience of beauty against time.',
    image: require('../assets/la_fenice_opera_house.png'),
  },
  {
    id: 'scuola-grande-di-san-rocco',
    title: 'Scuola Grande di San Rocco',
    category: 'Art & Culture',
    coords: { lat: 45.4351, lng: 12.3262 },
    coordText: '45.4351° N, 12.3262° E',
    description:
      'This Renaissance building was home to a lay brotherhood dedicated to charity and public service. It became famous because of one man: Tintoretto. Over 20 years, he filled the walls and ceilings with vast, dramatic canvases illustrating biblical stories with light, shadow, and movement unlike anything else in Venetian art. The effect is total immersion in a visual drama.',
    why:
      'To feel overwhelmed in the best possible way — by paint, light, and the ambition of a single artist who turned an entire building into a theatre of the divine.',
  image: require('../assets/scuola_grande_di_san_rocco.png'),
  },
  {
    id: 'ca-rezzonico',
    title: 'Ca’ Rezzonico – Museum of 18th-Century Venice',
    category: 'Art & Culture',
    coords: { lat: 45.4320, lng: 12.3267 },
    coordText: '45.4320° N, 12.3267° E',
    description:
      'This grand palazzo on the Grand Canal transports you into the opulent world of 18th-century Venice. Rooms are filled with Rococo furnishings, Murano chandeliers, frescoed ceilings, and paintings by Canaletto and Longhi. The ballroom, with its painted sky and gold accents, feels lifted from a masquerade.',
    why:
      "To dive deep into the refined and extravagant lifestyle of Venice's final golden century — one of powdered wigs, velvet, and wit.",
   image: require('../assets/ca_rezzonico.png'),
  },
  {
    id: 'palazzo-grimani',
    title: 'Palazzo Grimani',
    category: 'Art & Culture',
    coords: { lat: 45.4359, lng: 12.3408 },
    coordText: '45.4359° N, 12.3408° E',
    description:
      'A hidden Renaissance treasure, Palazzo Grimani once belonged to a cultured and art-loving Doge. The palace’s rooms feature mythological ceiling frescoes, Roman sculptures, and symmetrical beauty inspired by classical ideals. It was designed to impress and enlighten.',
    why:
      'To experience Venice through the eyes of a philosopher-doge — where every room was a stage for knowledge and aesthetic pleasure.',
    image: require('../assets/palazzo_grimani.png'),
  },
];

export function getPlacesByCategory(cat: Category): Place[] {
  return PLACES.filter(p => p.category === cat);
}
