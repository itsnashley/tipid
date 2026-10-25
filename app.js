/* Tipid — Budget Splitter + Meal Planner. Both use 0/1 knapsack dynamic programming. */
const $ = (s, r = document) => r.querySelector(s);
const peso = (n) => "₱" + Math.round(n).toLocaleString("en-PH");
const sum = (a, k) => a.reduce((s, x) => s + (+x[k] || 0), 0);
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const COLORS = ["#2F6FED", "#FFC93C", "#1FAE7A", "#8B5CF6", "#F0932B", "#E4483D", "#5B9CFF", "#D6408C"];
const ICONS = {
  budget: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 7H5a1 1 0 0 1 0-2h14V3H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm-3 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>',
  meal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"/></svg>',
  gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94a7.07 7.07 0 0 0 .06-.94c0-.32-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54A.49.49 0 0 0 13.9 2h-3.84a.49.49 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.68 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.07.63-.07.94s.03.63.07.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.12.22.37.3.6.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.25.42.49.42h3.84c.24 0 .45-.18.49-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.09.48 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
};


/* Food database: common and uncommon Filipino foods, typical price per serving (estimates, editable after filling).
   [name, cost ₱, protein g, calories kcal, category, search tags] */
const FOODS = [
  // Breakfast
  ["Plain rice (1 cup)",12,4,205,"Breakfast","kanin rice"],["Garlic fried rice (sinangag)",18,4,280,"Breakfast","kanin"],
  ["Egg and rice",35,14,400,"Breakfast","itlog"],["Fried egg",12,6,90,"Breakfast","itlog"],["Boiled egg",10,6,78,"Breakfast","itlog nilaga"],
  ["Salted egg with tomato",25,7,100,"Breakfast","itlog na maalat"],["Tapsilog",85,24,650,"Breakfast","beef tapa egg"],["Longsilog",70,18,640,"Breakfast","longganisa egg"],
  ["Tosilog",70,16,620,"Breakfast","tocino egg"],["Hotsilog",55,13,560,"Breakfast","hotdog egg"],["Bangsilog",80,24,600,"Breakfast","bangus milkfish egg"],
  ["Dangsilog",70,24,520,"Breakfast","daing egg fish"],["Spamsilog",80,16,650,"Breakfast","spam egg"],["Cornsilog",60,15,580,"Breakfast","corned beef egg"],
  ["Chicksilog",75,26,640,"Breakfast","chicken manok egg"],["Porksilog",80,22,640,"Breakfast","pork chop egg"],["Tocino and rice",60,14,560,"Breakfast","sweet pork"],
  ["Pandesal (3 pcs)",12,7,240,"Breakfast","bread"],["Pandesal with egg",25,13,320,"Breakfast","bread itlog"],["Pandesal with peanut butter",20,9,330,"Breakfast","bread"],
  ["Loaf bread with margarine (2 slices)",8,5,180,"Breakfast","tinapay sandwich"],["Pan de coco",10,3,200,"Breakfast","bread"],["Ensaymada",25,5,300,"Breakfast","bread"],
  ["Monay",8,3,150,"Breakfast","bread"],["Champorado",25,6,300,"Breakfast","chocolate rice porridge"],["Champorado with tuyo",40,14,360,"Breakfast","chocolate rice dried fish"],
  ["Lugaw with egg",30,8,260,"Breakfast","rice porridge"],["Arroz caldo",40,12,320,"Breakfast","chicken porridge"],["Goto",40,10,300,"Breakfast","tripe porridge"],
  ["Oatmeal cup",20,5,150,"Breakfast","oats"],
  // Ulam: meat
  ["Chicken adobo and rice",70,28,550,"Ulam","manok"],["Pork adobo and rice",75,22,620,"Ulam","baboy"],["Adobong sitaw and rice",30,4,300,"Ulam","string beans"],
  ["Fried chicken and rice",75,26,640,"Ulam","manok chickenjoy"],["Pork sinigang and rice",80,22,520,"Ulam","baboy sour soup"],["Chicken tinola and rice",75,26,480,"Ulam","manok soup"],["Chicken afritada and rice",75,24,540,"Ulam","manok"],
  ["Chicken curry and rice",75,24,580,"Ulam","manok"],["Chicken inasal and rice",90,28,580,"Ulam","manok bacolod grilled"],["Chicken barbecue and rice",80,26,560,"Ulam","manok bbq grilled"],
  ["Lechon manok (1/4) and rice",110,30,700,"Ulam","roast chicken"],["Pork barbecue (2 sticks) and rice",60,16,540,"Ulam","bbq baboy grilled"],
  ["Inihaw na liempo and rice",85,20,700,"Ulam","grilled pork belly"],["Lechon kawali and rice",90,20,720,"Ulam","crispy pork"],["Pork sisig and rice",90,22,720,"Ulam","pampanga"],
  ["Pork chop and rice",75,22,620,"Ulam","baboy"],["Pork humba and rice",90,18,700,"Ulam","braised pork visayas"],["Pork giniling and rice",60,18,560,"Ulam","ground pork"],
  ["Menudo and rice",70,18,580,"Ulam","pork"],["Mechado and rice",85,22,600,"Ulam","beef"],["Beef kaldereta and rice",100,24,640,"Ulam","kalderetang baka goat"],
  ["Beef pares and rice",80,22,620,"Ulam","beef stew"],["Beef nilaga and rice",90,24,520,"Ulam","boiled beef soup"],["Kare-kare and rice",110,26,680,"Ulam","oxtail peanut"],
  ["Bulalo and rice",150,30,700,"Ulam","beef marrow soup tagaytay"],["Dinuguan and rice",65,18,540,"Ulam","pork blood stew"],["Bopis and rice",60,18,520,"Ulam","spicy lungs"],
  ["Bicol express and rice",75,16,640,"Ulam","spicy coconut pork"],["Embutido (2 slices) and rice",45,10,420,"Ulam","meatloaf"],["Lumpiang shanghai (5 pcs)",40,8,300,"Ulam","spring rolls"],
  ["Tortang giniling and rice",45,14,440,"Ulam","omelet"],["Corned beef and rice",55,14,560,"Ulam","carne norte"],["Spam and rice",70,14,600,"Ulam","luncheon meat"],
  ["Hotdog (2 pcs) and rice",40,8,520,"Ulam","tender juicy"],["Longganisa (3 pcs) and rice",55,12,560,"Ulam","sausage vigan lucban"],["Chicharon (small pack)",15,5,160,"Ulam","pork rind snack"],
  // Ulam: fish and seafood
  ["Sardines and rice",45,18,480,"Seafood","canned fish"],["Ginisang sardinas with egg and rice",55,22,520,"Seafood","canned fish itlog"],["Canned tuna and rice",50,17,450,"Seafood","fish"],
  ["Tuyo and rice",35,14,380,"Seafood","dried fish"],["Danggit and rice",55,18,430,"Seafood","dried rabbitfish cebu"],["Tinapa and rice",50,18,430,"Seafood","smoked fish"],
  ["Daing na bangus and rice",70,26,520,"Seafood","milkfish"],["Bangus belly and rice",90,24,640,"Seafood","milkfish"],["Fried tilapia and rice",65,24,470,"Seafood","fish isda"],
  ["Fried galunggong and rice",55,20,430,"Seafood","round scad fish isda"],["Fried dilis and rice",30,10,380,"Seafood","anchovies"],["Paksiw na isda and rice",55,20,420,"Seafood","vinegar fish"],
  ["Escabeche and rice",75,22,500,"Seafood","sweet sour fish"],["Sarciado and rice",65,20,480,"Seafood","fish egg tomato"],["Ginataang tilapia and rice",70,22,560,"Seafood","coconut milk fish"],
  ["Sinigang na bangus and rice",80,22,430,"Seafood","sour soup fish"],["Sinigang na hipon and rice",100,20,420,"Seafood","sour soup shrimp"],["Adobong pusit and rice",80,20,520,"Seafood","squid"],
  ["Inihaw na pusit",90,18,200,"Seafood","grilled squid"],["Kinilaw na tanigue",90,22,180,"Seafood","raw fish ceviche visayas"],["Ginataang kuhol and rice",50,12,420,"Seafood","snails coconut"],
  // Vegetables and tofu
  ["Tokwa and rice",40,15,420,"Veggies","tofu"],["Tokwa't baboy",55,16,380,"Veggies","tofu pork"],["Fried tokwa",20,10,180,"Veggies","tofu"],
  ["Ginisang monggo and rice",45,14,430,"Veggies","mung beans"],["Pinakbet and rice",45,8,360,"Veggies","vegetables gulay ilocos"],["Dinengdeng and rice",45,8,380,"Veggies","vegetables ilocos"],
  ["Chopsuey and rice",50,9,380,"Veggies","vegetables gulay"],["Laing and rice",45,6,430,"Veggies","taro leaves coconut bicol"],["Ginataang kalabasa at sitaw and rice",40,6,380,"Veggies","squash coconut"],
  ["Adobong kangkong and rice",30,5,320,"Veggies","water spinach"],["Ginisang repolyo and rice",30,3,300,"Veggies","cabbage"],["Tortang talong and rice",40,9,380,"Veggies","eggplant omelet"],
  ["Ginisang ampalaya with egg and rice",40,10,360,"Veggies","bitter gourd"],["Ensaladang talong",25,3,150,"Veggies","grilled eggplant salad"],
  // Noodles
  ["Pancit canton",25,8,350,"Noodles","instant noodles"],["Pancit canton with egg",35,14,440,"Noodles","instant noodles itlog"],["Pancit bihon",40,10,380,"Noodles","rice noodles"],
  ["Pancit palabok",60,12,440,"Noodles","shrimp sauce"],["Pancit malabon",70,14,500,"Noodles","seafood"],["Pancit habhab",45,8,380,"Noodles","lucban quezon"],
  ["Sotanghon soup",45,10,380,"Noodles","glass noodles"],["Mami",60,14,380,"Noodles","chicken noodle soup"],["Lomi",55,14,520,"Noodles","thick noodle soup batangas"],
  ["Batchoy",70,16,420,"Noodles","la paz iloilo"],["Filipino spaghetti",45,10,450,"Noodles","pasta sweet"],["Arroz valenciana",80,16,620,"Noodles","sticky rice"],
  // Street food
  ["Fishballs (10 pcs)",20,4,150,"Street","street food"],["Kikiam (5 pcs)",20,5,200,"Street","street food"],["Squidballs (10 pcs)",20,5,150,"Street","street food"],
  ["Kwek-kwek (4 pcs)",20,8,260,"Street","quail egg orange"],["Tokneneng (3 pcs)",15,6,200,"Street","duck egg"],["Isaw (3 sticks)",18,6,180,"Street","chicken intestine"],
  ["Betamax (3 sticks)",15,5,130,"Street","blood cubes"],["Adidas (3 sticks)",20,8,200,"Street","chicken feet"],["Hotdog on a stick",15,4,200,"Street","tuhog"],
  ["Balut",25,13,190,"Street","duck embryo egg"],["Boiled peanuts",20,8,200,"Street","mani"],["Boiled corn",20,3,130,"Street","mais"],
  ["Siomai (4 pcs)",40,10,180,"Street","dumpling"],["Siomai rice",50,12,450,"Street","dumpling"],["Siopao asado",35,10,320,"Street","bun"],
  ["Shawarma",55,15,420,"Street","wrap"],["Burger sandwich",35,10,320,"Street","hamburger"],["Empanada",25,6,300,"Street","pastry"],
  ["Lumpiang togue (3 pcs)",20,3,180,"Street","bean sprouts"],["Dirty ice cream",10,1,100,"Street","sorbetes"],
  // Merienda and kakanin
  ["Banana cue",15,1,230,"Merienda","saging fried"],["Camote cue",10,1,180,"Merienda","sweet potato fried"],["Turon",15,1,200,"Merienda","banana spring roll"],
  ["Maruya",15,1,230,"Merienda","banana fritter"],["Puto (3 pcs)",15,3,210,"Merienda","kakanin rice cake"],["Kutsinta (3 pcs)",15,1,200,"Merienda","kakanin"],
  ["Suman",15,2,200,"Merienda","kakanin sticky rice"],["Bibingka",30,4,250,"Merienda","kakanin rice cake"],["Biko (slice)",20,3,260,"Merienda","kakanin sticky rice"],
  ["Sapin-sapin",20,2,220,"Merienda","kakanin"],["Palitaw",15,2,160,"Merienda","kakanin"],["Hopia mongo",10,2,160,"Merienda","pastry bean"],
  ["Ginataang bilo-bilo",30,2,320,"Merienda","coconut rice balls"],["Ginataang halo-halo",35,3,350,"Merienda","coconut"],["Boiled camote",15,2,115,"Merienda","sweet potato"],
  ["Boiled cassava",15,1,160,"Merienda","kamoteng kahoy"],["Peanuts (small pack)",10,7,160,"Merienda","mani"],["Polvoron",5,1,100,"Merienda","sweet"],
  ["Pastillas (3 pcs)",10,1,90,"Merienda","milk candy"],
  // Desserts and drinks
  ["Halo-halo",60,5,380,"Dessert","shaved ice"],["Mais con yelo",35,2,220,"Dessert","corn ice"],["Leche flan (slice)",25,5,230,"Dessert","custard"],
  ["Ube halaya",25,2,210,"Dessert","purple yam"],["Taho",15,5,150,"Drink","soy pudding tofu"],["Sago't gulaman",15,0,110,"Drink","tapioca jelly"],
  ["Buko juice",20,0,70,"Drink","coconut"],["Calamansi juice",15,0,60,"Drink","lemon"],["Iced tea",15,0,90,"Drink","juice"],
  ["Soft drink (1 bottle)",20,0,100,"Drink","soda coke"],["Milk",30,8,150,"Drink","gatas"],["Soy milk",20,6,100,"Drink","toyo"],
  ["Milo (3-in-1)",8,2,100,"Drink","chocolate"],["3-in-1 coffee",8,1,70,"Drink","kape"],["Milk tea (regular)",90,2,350,"Drink","boba"],
  ["Yakult",12,1,50,"Drink","probiotic"],
  // Supplements (typical Philippine online/store prices per serving, rough estimates)
  ["Whey protein (1 scoop)",80,24,120,"Supplement","protein powder shake"],["Whey isolate (1 scoop)",110,27,110,"Supplement","protein powder shake"],
  ["Casein protein (1 scoop)",95,24,120,"Supplement","protein powder night"],["Plant protein powder (1 scoop)",90,20,130,"Supplement","vegan pea soy protein powder"],
  ["Mass gainer (1 serving)",110,30,550,"Supplement","protein powder bulk weight gain"],["Ready-to-drink protein shake",90,20,150,"Supplement","protein drink"],
  ["Protein bar",70,15,200,"Supplement","snack"],["Collagen powder (1 scoop)",40,9,40,"Supplement","protein skin"],
  ["Creatine monohydrate (5 g)",12,0,0,"Supplement","gym workout"],["BCAA / EAA (1 scoop)",40,0,20,"Supplement","amino acids workout"],
  ["Pre-workout (1 scoop)",60,0,10,"Supplement","gym energy caffeine"],["Electrolyte sachet",25,0,15,"Supplement","hydration"],
  ["Fish oil (1 softgel)",10,0,10,"Supplement","omega-3 omega 3 dha epa"],["Omega-3 fish oil (2 softgels)",20,0,20,"Supplement","fish oil dha epa"],
  ["Multivitamin (1 tablet)",8,0,0,"Supplement","vitamins centrum"],["Vitamin C 500 mg",5,0,0,"Supplement","ascorbic acid"],["Vitamin D3",10,0,0,"Supplement","sunshine vitamin"],
  ["B-complex",8,0,0,"Supplement","vitamin b"],["Calcium + vitamin D",8,0,0,"Supplement","bones"],["Magnesium",12,0,0,"Supplement","mineral"],["Zinc",6,0,0,"Supplement","mineral"],
  // Fruit
  ["Banana (saba)",10,1,90,"Fruit","saging"],["Banana (lakatan)",8,1,100,"Fruit","saging"],["Apple",25,1,95,"Fruit","mansanas"],
  ["Orange",15,1,62,"Fruit","dalandan"],["Mango (ripe)",30,1,200,"Fruit","mangga"],["Green mango with bagoong",25,1,100,"Fruit","hilaw"],
  ["Papaya slice",15,1,60,"Fruit","papaya"],["Pineapple slice",20,1,80,"Fruit","pinya"],["Watermelon slice",20,1,60,"Fruit","pakwan"],
  ["Guava",10,1,50,"Fruit","bayabas"],["Jackfruit (langka)",30,3,150,"Fruit","nangka"],["Avocado",40,2,230,"Fruit","abokado"],
  ["Chico",10,1,80,"Fruit","sapodilla"]
].map(([name, cost, protein, calories, cat, tags]) => ({ name, cost, protein, calories, cat, tags }));

function foodSearch(q) {
  q = q.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/);
  return FOODS.map((f) => ({ f, hay: (f.name + " " + f.cat + " " + f.tags).toLowerCase() }))
    .filter((x) => words.every((w) => x.hay.includes(w)))
    .sort((a, b) => (b.f.name.toLowerCase().startsWith(q) - a.f.name.toLowerCase().startsWith(q)) || a.f.name.localeCompare(b.f.name))
    .slice(0, 20).map((x) => x.f);
}

function knapsack(items, cap) {
  const dp = new Array(cap + 1).fill(0);
  const keep = items.map(() => new Uint8Array(cap + 1));
  items.forEach((it, i) => {
    for (let w = cap; w >= it.cost; w--) {
      const v = dp[w - it.cost] + it.value;
      if (v > dp[w]) { dp[w] = v; keep[i][w] = 1; }
    }
  });
  const picked = [];
  let w = cap;
  for (let i = items.length - 1; i >= 0; i--) {
    if (keep[i][w]) { picked.push(i); w -= items[i].cost; }
  }
  return { picked: picked.reverse(), value: dp[cap] };
}

const ratio = (x) => x.value / (x.cost || 0.01);

/* Fractional knapsack: take items by best value per peso; the last one may be taken partially. */
function fractional(items, cap) {
  const order = items.map((_, i) => i).sort((a, b) => ratio(items[b]) - ratio(items[a]));
  let left = cap;
  const parts = [];
  for (const i of order) {
    if (left <= 0) break;
    const c = items[i].cost;
    if (c <= left) { parts.push({ i, frac: 1 }); left -= c; }
    else { parts.push({ i, frac: left / c }); left = 0; }
  }
  return parts;
}

function greedy(items, cap) {
  const order = items.map((_, i) => i).sort((a, b) => ratio(items[b]) - ratio(items[a]));
  let left = cap, value = 0;
  for (const i of order) {
    if (items[i].cost <= left) { left -= items[i].cost; value += items[i].value; }
  }
  return { value };
}

const TOOLS = [
  {
    id: "budget", tab: "Budget Splitter", title: "Make every peso count.",
    blurb: "List your expenses and rank what matters most. Tipid finds the strongest combination that fits your allowance.",
    capLabel: "Total allowance (₱)", cap: 800, method: "knapsack", unit: "funding", whole: "expenses", splitNote: "you can't always pay for just part of an expense",
    methods: [
      ["knapsack", "0/1 Knapsack", "Each expense is fully paid or skipped. Best when you can't pay in parts."],
      ["fractional", "Fractional Knapsack", "An expense can be partly funded, which gives the highest possible importance."]
    ], editorTitle: "Your expenses",
    cols: [["name", "Expense name", "text"], ["cost", "Cost (₱)", "number"], ["value", "Importance (1–10)", "number"], ["must", "Must-have", "checkbox"]],
    rows: [
      { name: "Transport", cost: 120, value: 9, must: true }, { name: "Lunch money", cost: 250, value: 9 },
      { name: "School project supplies", cost: 180, value: 8 }, { name: "Savings", cost: 200, value: 7 },
      { name: "Mobile load", cost: 100, value: 6 }, { name: "Snacks", cost: 90, value: 4 },
      { name: "Game top-up", cost: 150, value: 3 }, { name: "Milk tea", cost: 120, value: 3 }
    ],
    val: (r) => +r.value || 0,
    metrics: [["Importance", "value", "points"]],
    goalLabel: () => "importance points"
  },
  {
    id: "meal", tab: "Meal Planner", title: "Eat well, spend wisely.",
    blurb: "Add meal options with their price and nutrition. Tipid builds a day’s plan that makes the most of your food budget.",
    capLabel: "Daily food budget (₱)", capLabels: { daily: "Daily food budget (₱)", weekly: "Weekly food budget (₱)" }, cap: 150, periods: true, period: "daily", maxPer: 3, goal: "protein", method: "knapsack", db: true, unit: "serving", whole: "servings", splitNote: "you can't always buy part of a meal",
    methods: [
      ["knapsack", "0/1 Knapsack", "Each food is taken whole or skipped. Best for real meals you can't split."],
      ["fractional", "Fractional Knapsack", "Foods can be split into partial servings, which gives the highest possible total."]
    ], editorTitle: "Your meal options",
    goals: [["protein", "Most protein"], ["calories", "Most calories"]],
    cols: [["name", "Meal name", "text"], ["cost", "Cost (₱)", "number"], ["protein", "Protein (g)", "number"], ["calories", "Calories", "number"], ["must", "Must-have", "checkbox"]],
    rows: [
      { name: "Egg and rice", cost: 35, protein: 14, calories: 400 }, { name: "Chicken adobo and rice", cost: 70, protein: 28, calories: 550 },
      { name: "Sardines and rice", cost: 45, protein: 18, calories: 480 }, { name: "Tapsilog", cost: 85, protein: 24, calories: 650 },
      { name: "Tokwa and rice", cost: 40, protein: 15, calories: 420 }, { name: "Siomai rice", cost: 50, protein: 12, calories: 450 },
      { name: "Pancit canton", cost: 25, protein: 8, calories: 350 }, { name: "Milk", cost: 30, protein: 8, calories: 150 },
      { name: "Banana", cost: 10, protein: 1, calories: 90 }
    ],
    val(r) { return +r[this.goal] || 0; },
    metrics: [["Protein", "protein", "g"], ["Calories", "calories", "kcal"]],
    goalLabel() { return this.goal === "protein" ? "g of protein" : "kcal"; }
  }
];

function renderResult(t) {
  const box = $(`#${t.id} .result-body`);
  const items = t.rows.filter((r) => r.name.trim())
    .map((r) => ({ ...r, cost: Math.max(0, Math.floor(+r.cost || 0)), value: t.val(r) }));
  const cap = Math.max(0, Math.floor(+t.cap || 0));
  const weekly = !!t.periods && t.period === "weekly";
  const mustMult = weekly ? 7 : 1;                       // must-have foods are eaten every day of the week
  const maxPer = weekly ? Math.max(1, Math.floor(+t.maxPer || 1)) : 1; // other foods repeat up to this many times
  const W = (a, k) => a.reduce((s, x) => s + (+x[k] || 0) * x.frac, 0); // weighted by servings taken
  const must = items.filter((r) => r.must).map((r) => ({ ...r, frac: mustMult }));
  const pool = items.filter((r) => !r.must);
  const left = cap - W(must, "cost");
  const n1 = (n) => (Math.round(n * 10) / 10).toLocaleString();

  if (!items.length) {
    box.innerHTML = '<div class="empty-state"><p class="muted">Add an item to see your recommended plan.</p></div>';
    return;
  }
  if (left < 0) {
    box.innerHTML = `<div class="empty-state"><p class="warn">Your must-haves cost ${peso(W(must, "cost"))}, which exceeds your ${peso(cap)} budget.</p><p class="muted">Raise the budget or uncheck a must-have.</p></div>`;
    return;
  }

  const isFrac = t.method === "fractional";
  // Weekly plans may repeat a food, so each food becomes up to maxPer identical copies.
  const copies = pool.flatMap((r, src) => Array.from({ length: maxPer }, () => ({ ...r, src })));
  const gather = (list) => {
    const m = new Map();
    list.forEach(({ src, f }) => m.set(src, (m.get(src) || 0) + f));
    return [...m].map(([src, f]) => ({ ...pool[src], src, frac: f }));
  };
  const combos = copies.length > 52 ? "an astronomical number of" : (2 ** copies.length).toLocaleString();
  let chosen, skipped, altTotal, cmpTitle, altLabel, note;
  const mustVal = W(must, "value");
  if (isFrac) {
    const picked = gather(fractional(copies, left).map((p) => ({ src: copies[p.i].src, f: p.frac })));
    const taken = new Set(picked.map((x) => x.src));
    chosen = [...must, ...picked];
    skipped = pool.filter((_, i) => !taken.has(i));
    altTotal = mustVal + knapsack(copies, left).value;
    cmpTitle = `Compare with whole ${t.whole} (0/1 knapsack)`;
    altLabel = `0/1 Knapsack, whole ${t.whole} only`;
    note = `The fractional method sorted ${copies.length} servings by value per peso and filled the budget, so it needed no table at all.`;
  } else {
    const dp = knapsack(copies, left);
    const picked = gather(dp.picked.map((i) => ({ src: copies[i].src, f: 1 })));
    const taken = new Set(picked.map((x) => x.src));
    chosen = [...must, ...picked];
    skipped = pool.filter((_, i) => !taken.has(i));
    altTotal = mustVal + greedy(copies, left).value;
    cmpTitle = "Compare with the greedy method";
    altLabel = "Greedy by value per peso";
    note = `The calculation used ${(copies.length * (left + 1)).toLocaleString()} table cells instead of checking all ${combos} combinations.`;
  }
  const spent = W(chosen, "cost");
  const total = W(chosen, "value");
  const diff = isFrac ? total - altTotal : total - altTotal;
  const used = cap ? Math.round((spent / cap) * 100) : 0;
  const segs = chosen.map((r, i) => `<span title="${esc(r.name)}: ${peso(r.cost * r.frac)}" style="flex:${Math.max(r.cost * r.frac, 0.0001)};background:${COLORS[i % COLORS.length]}">${esc(r.name)}</span>`).join("");
  const tag = (r) => weekly ? `${r.must ? "<i>Must</i>" : ""}<i class="part">${n1(r.frac)}× / week</i>` : r.must ? "<i>Must</i>" : r.frac < 1 ? `<i class="part">${Math.round(r.frac * 100)}% ${t.unit}</i>` : "";
  const cmpText = isFrac
    ? (diff > 0.05 ? `Splitting gives ${n1(diff)} more ${t.goalLabel()} than whole ${t.whole} only. Fractional is the upper limit for this budget, but ${t.splitNote}.` : "Both methods tied here, because whole ${t.whole} already fit the budget.")
    : (diff > 0 ? `Tipid found ${n1(diff)} more ${t.goalLabel()} than the greedy shortcut.` : "Both methods tied here. Change the numbers to find a case where greedy falls short.");

  box.innerHTML = `
    <div class="spent"><span class="big">${peso(spent)}</span><span class="of">of ${peso(cap)} allocated</span></div>
    <div class="strip" role="img" aria-label="${used}% of budget allocated">${segs}<span class="rest" style="flex:${Math.max(cap - spent, 0.0001)}"></span></div>
    <p class="allocation-caption">${used}% allocated · ${peso(cap - spent)} left unspent${t.methods ? ` · ${isFrac ? "Fractional" : "0/1"} method` : ""}${weekly ? " · weekly plan" : ""}</p>
    <div class="metrics">${t.metrics.map(([l, k, u]) => `<div><b>${Math.round(W(chosen, k)).toLocaleString()}</b><small>${l} (${u})</small></div>`).join("")}</div>
    ${weekly ? `<p class="allocation-caption avg">≈ ${t.metrics.map(([l, k, u]) => `${Math.round(W(chosen, k) / 7).toLocaleString()} ${u}${u === "kcal" || u === "points" ? "" : " " + l.toLowerCase()}`).join(" · ")} per day on average</p>` : ""}
    <h3>Selected for your plan</h3>
    <ul class="picked">${chosen.map((r, i) => `<li><span class="pl"><span class="sw" style="background:${COLORS[i % COLORS.length]}"></span>${esc(r.name)}${tag(r)}</span><b>${peso(r.cost * r.frac)}</b></li>`).join("") || '<li class="muted">Nothing fits yet. Try a bigger budget.</li>'}</ul>
    ${skipped.length ? `<h3>Not included</h3><p class="muted left-out">${skipped.map((r) => esc(r.name)).join(", ")}</p>` : ""}
    <details class="comparison">
      <summary>${cmpTitle}</summary>
      <div class="vs"><div class="${diff > 0.05 ? "win" : ""}"><b>${n1(total)}</b><small>${isFrac ? "Fractional" : "Tipid optimization"}, ${t.goalLabel()}</small></div><div><b>${n1(altTotal)}</b><small>${altLabel}</small></div></div>
      <p class="muted">${cmpText} ${note}</p>
    </details>`;
}

const noun = (t) => (t.id === "meal" ? "meal" : "expense");

function renderRows(t) {
  $(`#${t.id} .items`).innerHTML = t.rows.length
    ? t.rows.map((r, i) => `<li><button type="button" class="item-name" data-edit="${i}" aria-label="Edit ${esc(r.name) || `item ${i + 1}`}">${esc(r.name) || "Untitled"}${r.must ? '<i class="must-tag">Must</i>' : ""}</button><button class="x" type="button" data-del="${i}" aria-label="Remove ${esc(r.name) || `item ${i + 1}`}">${ICONS.trash}</button></li>`).join("")
    : `<li class="empty-list">Nothing here yet. Add your first ${noun(t)}.</li>`;
  $(`#${t.id} .item-count`).textContent = `${t.rows.length} ${t.rows.length === 1 ? "item" : "items"}`;
}

function formHTML(t) {
  const field = ([k, label, type]) => type === "text"
    ? `<label>${label}<input name="${k}" type="text" maxlength="40" autocomplete="off" placeholder="${t.id === "meal" ? "e.g. Egg and rice" : "e.g. School supplies"}"></label>`
    : type === "number"
      ? `<label>${label}<input name="${k}" type="number" inputmode="decimal" min="${k === "value" ? 1 : 0}" ${k === "value" ? 'max="10"' : ""}></label>`
      : `<label class="check"><input name="${k}" type="checkbox"><span><b>${label}</b><small>${t.id === "meal" ? "Always included in your plan first" : "Always funded first"}</small></span></label>`;
  const of = (ty) => t.cols.filter((c) => c[2] === ty).map(field).join("");
  const search = t.db ? `<div class="food-search-box"><label>Search food database<input type="search" class="food-search" maxlength="40" autocomplete="off" placeholder="e.g. adobo, itlog, banana"></label><ul class="food-results" hidden></ul></div>` : "";
  return `<dialog class="modal" aria-labelledby="${t.id}-mt"><div class="modal-body">
    <h2 id="${t.id}-mt"></h2><p class="sub">${t.db ? "Search a food to fill it in automatically, or type your own." : "Fill in the details, then add it to your list."}</p>
    <form novalidate>${search}${of("text")}<div class="fields2">${of("number")}</div>${of("checkbox")}
      <p class="form-err" role="alert"></p>
      <div class="modal-actions"><button type="button" class="btn-cancel">Cancel</button><button type="submit" class="btn-save"></button></div>
    </form></div></dialog>`;
}

function openForm(t, i) {
  const dlg = $(`#${t.id} dialog`), f = dlg.querySelector("form");
  const r = i == null ? null : t.rows[i];
  t.editing = i;
  f.reset();
  t.cols.forEach(([k, , ty]) => {
    if (ty === "checkbox") f.elements[k].checked = !!(r && r[k]);
    else f.elements[k].value = r ? r[k] : "";
  });
  dlg.querySelector("h2").textContent = `${r ? "Edit" : "Add"} ${noun(t)}`;
  dlg.querySelector(".btn-save").textContent = r ? "Save changes" : `Add ${noun(t)}`;
  dlg.querySelector(".form-err").textContent = "";
  const fr = dlg.querySelector(".food-results");
  if (fr) fr.hidden = true;
  dlg.showModal();
  (dlg.querySelector(".food-search") || f.elements[t.cols[0][0]]).focus();
}


function showFoods(s, q) {
  const ul = s.querySelector(".food-results");
  const hits = foodSearch(q);
  ul.hidden = !q.trim();
  ul.innerHTML = hits.length
    ? hits.map((f) => `<li><button type="button" class="food-opt" data-food="${FOODS.indexOf(f)}"><b>${esc(f.name)}</b><small>${f.cat} · ${peso(f.cost)} · ${f.protein} g protein · ${f.calories} kcal</small></button></li>`).join("")
    : '<li class="food-none">No match. Type the details below yourself.</li>';
}

function fillFood(s, food) {
  const f = s.querySelector("form");
  ["name", "cost", "protein", "calories"].forEach((k) => { f.elements[k].value = food[k]; });
  f.querySelector(".food-search").value = "";
  f.querySelector(".food-results").hidden = true;
  f.querySelector(".form-err").textContent = "";
  f.elements["name"].focus();
}

function settingsHTML(t) {
  if (!t.methods) return "";
  return `<dialog class="modal settings-modal" aria-labelledby="${t.id}-st"><div class="modal-body">
    <h2 id="${t.id}-st">Settings</h2><p class="sub">Choose how Tipid builds your plan.</p>
    ${t.periods ? `<fieldset class="method-group"><legend>Plan period</legend>
      <label class="opt"><input type="radio" name="${t.id}-period" value="daily"${t.period === "daily" ? " checked" : ""}><span><b>Daily</b><small>Plan one day of meals.</small></span></label>
      <label class="opt"><input type="radio" name="${t.id}-period" value="weekly"${t.period === "weekly" ? " checked" : ""}><span><b>Weekly</b><small>Plan 7 days. Must-have foods are eaten every day, and other foods can repeat up to the limit below.</small></span></label>
      <label class="max-field"${t.period === "weekly" ? "" : " hidden"}>Max servings of each food per week<input type="number" class="max-per" min="1" max="7" inputmode="numeric" value="${t.maxPer}"></label>
    </fieldset>` : ""}<fieldset class="method-group"><legend>Method</legend>${t.methods.map(([k, l, d]) => `<label class="opt"><input type="radio" name="${t.id}-method" value="${k}"${t.method === k ? " checked" : ""}><span><b>${l}</b><small>${d}</small></span></label>`).join("")}</fieldset>
    <div class="modal-actions"><button type="button" class="btn-save settings-done">Done</button></div>
  </div></dialog>`;
}

function build(t, first) {
  const s = document.createElement("section");
  s.id = t.id;
  s.hidden = !first;
  s.setAttribute("aria-labelledby", `${t.id}-title`);
  s.innerHTML = `
    <div class="intro"><span class="tile" aria-hidden="true">${ICONS[t.id]}</span><div><h1 id="${t.id}-title">${t.title}</h1><p>${t.blurb}</p></div>${t.methods ? `<button type="button" class="settings-btn" aria-haspopup="dialog">${ICONS.gear}<span>Settings</span></button>` : ""}</div>
    <div class="grid">
      <div class="card editor">
        <div class="editor-header"><h2>${t.editorTitle}</h2><span class="item-count"></span></div>
        <div class="top">
          <label><span class="cap-text">${t.capLabel}</span><input class="cap" type="number" min="0" inputmode="decimal" value="${t.cap}"></label>
          ${t.goals ? `<label>Optimize for<select class="goal">${t.goals.map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select></label>` : ""}
        </div>
        <ul class="items"></ul>
        <button class="add" type="button">${ICONS.plus} Add ${noun(t)}</button>
      </div>
      <div class="card result">
        <div class="result-header"><h2>Recommended plan</h2><span class="live-label">Live result</span></div>
        <div class="result-body"></div>
      </div>
    </div>${formHTML(t)}${settingsHTML(t)}`;
  $("#app").append(s);
  renderRows(t);
  renderResult(t);

  const dlg = s.querySelector("dialog"), f = dlg.querySelector("form");
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.querySelector(".btn-cancel").onclick = () => dlg.close();
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const row = {};
    t.cols.forEach(([k, , ty]) => { row[k] = ty === "checkbox" ? f.elements[k].checked : f.elements[k].value.trim(); });
    const err = !row.name ? "Enter a name."
      : row.cost === "" || +row.cost < 0 ? "Enter a cost of 0 or more."
      : t.id === "budget" && (+row.value < 1 || +row.value > 10) ? "Pick an importance from 1 to 10." : "";
    dlg.querySelector(".form-err").textContent = err;
    if (err) return;
    if (t.editing == null) t.rows.push(row); else t.rows[t.editing] = row;
    dlg.close();
    renderRows(t);
    renderResult(t);
  });

  s.addEventListener("input", (e) => {
    const el = e.target;
    if (el.classList.contains("cap")) t.cap = el.value;
    else if (el.classList.contains("goal")) t.goal = el.value;
    else if (el.classList.contains("max-per")) t.maxPer = Math.min(7, Math.max(1, Math.floor(+el.value) || 1));
    else if (el.classList.contains("food-search")) { showFoods(s, el.value); return; }
    else return;
    renderResult(t);
  });
  // Enter in the search box picks the first match instead of submitting the form
  s.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.classList.contains("food-search")) {
      e.preventDefault();
      const first = foodSearch(e.target.value)[0];
      if (first) fillFood(s, first);
    }
  });
  const sdlg = s.querySelector(".settings-modal");
  if (sdlg) {
    sdlg.addEventListener("click", (e) => { if (e.target === sdlg) sdlg.close(); });
    sdlg.addEventListener("change", (e) => {
      if (e.target.name === `${t.id}-method`) { t.method = e.target.value; renderResult(t); }
      if (e.target.name === `${t.id}-period`) {
        const wk = e.target.value === "weekly";
        if (wk === (t.period === "weekly")) return;
        t.period = e.target.value;
        t.cap = wk ? Math.round((+t.cap || 0) * 7) : Math.round((+t.cap || 0) / 7); // keep the budget in step with the period
        s.querySelector(".cap").value = t.cap;
        s.querySelector(".cap-text").textContent = t.capLabels[t.period];
        sdlg.querySelector(".max-field").hidden = !wk;
        renderResult(t);
      }
    });
  }
  s.addEventListener("click", (e) => {
    if (e.target.closest(".settings-btn")) sdlg.showModal();
    if (e.target.closest(".settings-done")) sdlg.close();
    const fo = e.target.closest("[data-food]");
    if (fo) fillFood(s, FOODS[+fo.dataset.food]);
    if (e.target.closest(".add")) openForm(t, null);
    const ed = e.target.closest("[data-edit]");
    if (ed) openForm(t, +ed.dataset.edit);
    const d = e.target.closest("[data-del]");
    if (d) { t.rows.splice(+d.dataset.del, 1); renderRows(t); renderResult(t); }
  });
}

TOOLS.forEach((t, i) => {
  build(t, i === 0);
  const b = document.createElement("button");
  b.type = "button";
  b.innerHTML = `${ICONS[t.id]}<span>${t.tab}</span>`;
  b.className = i === 0 ? "on" : "";
  b.setAttribute("aria-pressed", String(i === 0));
  b.onclick = () => {
    TOOLS.forEach((x) => { $(`#${x.id}`).hidden = x.id !== t.id; });
    document.querySelectorAll("#tabs button").forEach((n) => {
      n.classList.toggle("on", n === b);
      n.setAttribute("aria-pressed", String(n === b));
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  $("#tabs").append(b);
});
