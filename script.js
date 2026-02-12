// --- BANCO DE DADOS ALIMENTAR (DIRTY BULK PREFERENCES) ---
// Kcal aproximadas por 100g ou unidade padrão
const FOOD_DB = {
    breakfast: [
        { name: "Pão Francês c/ Manteiga e Ovo", kcalPerUnit: 250, unit: "unidade(s)", type: "solid" },
        { name: "Tapioca de Carne Seca c/ Queijo", kcalPerUnit: 400, unit: "unidade(s)", type: "solid" },
        { name: "Mingau de Aveia c/ Pasta de Amendoim", kcalPerUnit: 500, unit: "tigela(s)", type: "solid" },
        { name: "Vitamina de Banana, Leite e Nescau", kcalPerUnit: 300, unit: "copo(s) 300ml", type: "liquid" },
        { name: "Cuscuz com Ovo e Queijo", kcalPerUnit: 350, unit: "porção", type: "solid" },
        { name: "Panqueca Americana c/ Mel", kcalPerUnit: 200, unit: "disco(s)", type: "solid" }
    ],
    lunch_dinner: [
        { name: "Macarrão à Bolonhesa (Carne Gorda)", kcalPer100g: 180, unit: "g", type: "meal" },
        { name: "Strogonoff de Frango c/ Batata Palha", kcalPer100g: 220, unit: "g", type: "meal" },
        { name: "Arroz, Feijão e Bife Acebolado", kcalPer100g: 160, unit: "g", type: "meal" },
        { name: "Hambúrguer Caseiro (Pão Brioche+Carne+Queijo)", kcalPerUnit: 550, unit: "unidade(s)", type: "fast" },
        { name: "Pizza de Calabresa/Frango", kcalPerUnit: 300, unit: "fatia(s)", type: "fast" },
        { name: "Lasanha Bolonhesa", kcalPer100g: 200, unit: "g", type: "meal" },
        { name: "Pratão de Pedreiro (Arroz/Feijão/Macarrão/Carne)", kcalPer100g: 190, unit: "g", type: "meal" }
    ],
    snacks_sweets: [
        { name: "Açaí Completo (Leite Ninho/Paçoca)", kcalPerUnit: 400, unit: "copo(s) 300ml", priority: "high" },
        { name: "Chocolate Snickers/Semelhante", kcalPerUnit: 250, unit: "barra(s)", priority: "med" },
        { name: "Paçoca", kcalPerUnit: 100, unit: "rolha(s)", priority: "med" },
        { name: "Doce de Leite (Colherada)", kcalPerUnit: 60, unit: "colher(es)", priority: "high" },
        { name: "Sorvete de Creme/Chocolate", kcalPerUnit: 200, unit: "bola(s)", priority: "med" },
        { name: "Bolo de Cenoura c/ Chocolate", kcalPerUnit: 350, unit: "fatia(s)", priority: "high" },
        { name: "Cheesecake ou Torta Doce", kcalPerUnit: 400, unit: "fatia(s)", priority: "med" }
    ]
};

// --- ESTADO GLOBAL ---
let userProfile = JSON.parse(localStorage.getItem('bulkProfile')) || null;
let dailyPlan = JSON.parse(localStorage.getItem('bulkDailyPlan')) || null;

// --- ROTEAMENTO ---
function router(view) {
    const app = document.getElementById('app');
    app.innerHTML = '';
    
    if (view === 'profile' || !userProfile) renderProfile(app);
    else if (view === 'plan') renderMealPlan(app);
    else if (view === 'snacks') renderSnackAttack(app);
    
    updateHeader();
}

function updateHeader() {
    const el = document.getElementById('header-kcal');
    if (userProfile) {
        el.innerText = `${userProfile.targetKcal} kcal`;
    }
}

// --- PERFIL E CÁLCULOS CIENTÍFICOS ---
function renderProfile(container) {
    container.innerHTML = `
    <div class="fade-in pb-20">
        <h2 class="text-2xl font-bold mb-4 text-orange-500">Configuração de Bulking</h2>
        <div class="card">
            <label class="text-xs text-gray-400">Peso (kg)</label>
            <input type="number" id="weight" class="input-dark" placeholder="Ex: 75" value="${userProfile?.weight || ''}">
            
            <label class="text-xs text-gray-400">Altura (cm)</label>
            <input type="number" id="height" class="input-dark" placeholder="Ex: 180" value="${userProfile?.height || ''}">
            
            <label class="text-xs text-gray-400">Idade</label>
            <input type="number" id="age" class="input-dark" placeholder="Ex: 25" value="${userProfile?.age || ''}">
            
            <label class="text-xs text-gray-400">Nível de Atividade (Futebol/Academia)</label>
            <select id="activity" class="input-dark">
                <option value="1.55" ${userProfile?.activity == 1.55 ? 'selected' : ''}>Moderado (3-5 dias)</option>
                <option value="1.725" ${userProfile?.activity == 1.725 ? 'selected' : ''}>Intenso (6-7 dias - Futebol+Gym)</option>
                <option value="1.9" ${userProfile?.activity == 1.9 ? 'selected' : ''}>Atleta (2x por dia)</option>
            </select>

            <button onclick="calculateAndSave()" class="btn-primary mt-4">CALCULAR META DE BULKING</button>
        </div>
        
        ${userProfile ? `
        <div class="card border-orange-500/30">
            <h3 class="font-bold text-lg mb-2">Seus Números</h3>
            <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p class="text-xs text-gray-400">Basal (BMR)</p>
                    <p class="text-xl font-bold">${userProfile.bmr}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-400">Gasto Total (TDEE)</p>
                    <p class="text-xl font-bold">${userProfile.tdee}</p>
                </div>
            </div>
            <div class="mt-4 text-center bg-orange-900/20 p-4 rounded border border-orange-500">
                <p class="text-sm text-orange-300">META DIÁRIA (Dirty Bulk)</p>
                <p class="text-4xl font-black text-orange-500">${userProfile.targetKcal}</p>
                <p class="text-xs text-gray-400 mt-1">Superávit Calórico Incluso</p>
            </div>
        </div>
        ` : ''}
    </div>`;
}

function calculateAndSave() {
    const w = parseFloat(document.getElementById('weight').value);
    const h = parseFloat(document.getElementById('height').value);
    const a = parseFloat(document.getElementById('age').value);
    const act = parseFloat(document.getElementById('activity').value);

    if (!w || !h || !a) return alert("Preencha tudo!");

    // Equação Mifflin-St Jeor (Padrão Ouro)
    const bmr = Math.round((10 * w) + (6.25 * h) - (5 * a) + 5);
    const tdee = Math.round(bmr * act);
    
    // Superávit para Dirty Bulk (Agressivo para recuperação de Futebol+Academia)
    const targetKcal = tdee + 600; 

    userProfile = { weight: w, height: h, age: a, activity: act, bmr, tdee, targetKcal };
    localStorage.setItem('bulkProfile', JSON.stringify(userProfile));
    
    // Gerar novo plano automaticamente ao salvar
    generateDailyPlan();
    router('plan');
}

// --- GERADOR DE DIETA (LÓGICA MATEMÁTICA) ---
function generateDailyPlan() {
    if (!userProfile) return;

    // Divisão de Calorias (Priorizando recuperação pós treino/jogo)
    const dist = {
        breakfast: 0.20, // 20%
        lunch: 0.30,     // 30%
        snack: 0.20,     // 20% (Doces/Lanches)
        dinner: 0.30     // 30%
    };

    const targets = {
        breakfast: Math.round(userProfile.targetKcal * dist.breakfast),
        lunch: Math.round(userProfile.targetKcal * dist.lunch),
        snack: Math.round(userProfile.targetKcal * dist.snack),
        dinner: Math.round(userProfile.targetKcal * dist.dinner)
    };

    // Função para pegar 3 itens aleatórios do DB
    const getRandomOptions = (arr, count) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    dailyPlan = {
        date: new Date().toDateString(),
        targets: targets,
        meals: {
            breakfast: getRandomOptions(FOOD_DB.breakfast, 3),
            lunch: getRandomOptions(FOOD_DB.lunch_dinner, 3),
            dinner: getRandomOptions(FOOD_DB.lunch_dinner, 3),
            snacks: getRandomOptions(FOOD_DB.snacks_sweets, 3) // Lanches doces
        }
    };
    
    localStorage.setItem('bulkDailyPlan', JSON.stringify(dailyPlan));
}

// --- RENDERIZAÇÃO DAS REFEIÇÕES ---

function renderMealPlan(container) {
    // Se mudou o dia, gera novo plano
    if (!dailyPlan || dailyPlan.date !== new Date().toDateString()) {
        generateDailyPlan();
    }

    let html = `<div class="fade-in pb-20">
        <h2 class="text-2xl font-bold mb-2 text-white">Cardápio do Dia</h2>
        <p class="text-sm text-gray-400 mb-6">Sugestões calculadas para seus ${userProfile.targetKcal} kcal.</p>`;

    // Café da Manhã
    html += renderMealSection("Café da Manhã", dailyPlan.targets.breakfast, dailyPlan.meals.breakfast);
    
    // Almoço
    html += renderMealSection("Almoço (Pré/Pós Treino)", dailyPlan.targets.lunch, dailyPlan.meals.lunch);
    
    // Jantar
    html += renderMealSection("Jantar (Recuperação)", dailyPlan.targets.dinner, dailyPlan.meals.dinner);

    html += `<button onclick="generateDailyPlan(); router('plan')" class="w-full py-3 mt-4 text-sm text-gray-500 border border-gray-700 rounded hover:text-white">Gerar Novas Opções ↻</button>
    </div>`;

    container.innerHTML = html;
}

function renderMealSection(title, targetKcal, options) {
    let html = `<div class="mb-8">
        <div class="flex justify-between items-end mb-2">
            <h3 class="text-lg font-bold text-orange-400">${title}</h3>
            <span class="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-white">Meta: ~${targetKcal} kcal</span>
        </div>
        <div class="space-y-3">`;

    options.forEach(opt => {
        // CÁLCULO DA PORÇÃO "SMART"
        // Se tem kcalPer100g, calculamos as gramas. Se é por unidade, calculamos unidades.
        let portion = "";
        if (opt.kcalPer100g) {
            const grams = Math.round((targetKcal / opt.kcalPer100g) * 100);
            portion = `${grams}g`;
        } else {
            const units = (targetKcal / opt.kcalPerUnit).toFixed(1);
            portion = `${units} ${opt.unit}`;
        }

        html += `
        <div class="card p-4 flex justify-between items-center group active:scale-95 transition">
            <div>
                <p class="font-bold text-white text-lg leading-tight">${opt.name}</p>
                <p class="text-xs text-gray-500 mt-1">Base: ${opt.kcalPer100g ? opt.kcalPer100g + 'kcal/100g' : opt.kcalPerUnit + 'kcal/unid'}</p>
            </div>
            <div class="text-right min-w-[80px]">
                <p class="text-xs text-orange-300 uppercase font-bold mb-1">Comer</p>
                <p class="text-xl font-black text-white bg-gray-800 rounded px-2 py-1">${portion}</p>
            </div>
        </div>`;
    });

    html += `</div></div>`;
    return html;
}

// --- ABA DE LANCHES E DOCES (O PEDIDO ESPECIAL) ---
function renderSnackAttack(container) {
    if (!dailyPlan) generateDailyPlan();

    const target = dailyPlan.targets.snack;
    
    // Vamos dividir a meta de lanches em 2 (Manhã/Tarde ou Tarde/Noite)
    const snack1Target = Math.round(target * 0.4);
    const snack2Target = Math.round(target * 0.6);

    // Pegar opções doces
    const sweets = dailyPlan.meals.snacks; 

    let html = `<div class="fade-in pb-20">
        <div class="bg-gradient-to-r from-orange-600 to-red-600 p-6 -mx-4 -mt-4 mb-6 shadow-lg">
            <h2 class="text-3xl font-black text-white italic">SNACK ATTACK</h2>
            <p class="text-white/80 text-sm">Bulking não precisa ser triste. Coma o que gosta.</p>
        </div>

        <div class="mb-8">
            <h3 class="text-xl font-bold text-white mb-2">Lanche Rápido (Tarde)</h3>
            <p class="text-xs text-gray-400 mb-4">Meta Energética: ${snack1Target} kcal</p>
            ${renderSingleSnackCard(sweets[0], snack1Target)}
        </div>

        <div class="mb-8">
            <h3 class="text-xl font-bold text-white mb-2">Ceia / Pós-Jantar (Noite)</h3>
            <p class="text-xs text-gray-400 mb-4">Meta Energética: ${snack2Target} kcal</p>
            <p class="text-xs text-green-400 mb-2">★ Recomendado para sono e anabolismo</p>
            ${renderSingleSnackCard(sweets[1], snack2Target)}
        </div>
        
        <div class="mb-8">
             <h3 class="text-xl font-bold text-gray-500 mb-2">Opção Extra (Se ainda tiver fome)</h3>
             ${renderSingleSnackCard(sweets[2], 250)}
        </div>

        <button onclick="generateDailyPlan(); router('snacks')" class="btn-primary">QUERO OUTROS DOCES</button>
    </div>`;

    container.innerHTML = html;
}

function renderSingleSnackCard(food, targetKcal) {
    let portion = "";
     if (food.kcalPer100g) {
        const grams = Math.round((targetKcal / food.kcalPer100g) * 100);
        portion = `${grams}g`;
    } else {
        const units = (targetKcal / food.kcalPerUnit).toFixed(1);
        portion = `${units} ${food.unit}`;
    }

    return `
    <div class="card border-l-4 border-l-orange-500">
        <div class="flex justify-between items-center">
            <div class="flex-1">
                <h4 class="font-bold text-xl text-white">${food.name}</h4>
                <p class="text-sm text-gray-400">Fonte de energia rápida</p>
            </div>
            <div class="text-right">
                <span class="block text-2xl font-black text-orange-400">${portion}</span>
            </div>
        </div>
    </div>`;
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se já tem perfil
    if(userProfile) router('plan');
    else router('profile');
});
