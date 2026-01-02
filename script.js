// ======================================
// BILAN CARBONE ENTREPRISE – VERSION STABLE
// ======================================
  
const MAX_TRIALS = 3;

// Initialiser si inexistant
if (!localStorage.getItem("trialCount")) {
  localStorage.setItem("trialCount", "0");
}


console.log("✅ Script Bilan Carbone chargé");

// graphique global
let chartCO2 = null;

// lecture sécurisée d'un nombre
function val(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.error("ID manquant :", id);
    return 0;
  }
  return Number(el.value) || 0;
}

// ======================================
// CALCUL PRINCIPAL
// ======================================


function calculate() {

  let trials = Number(localStorage.getItem("trialCount"));

  if (trials >= MAX_TRIALS) {
    document.getElementById("trialMessage").innerText =
      "Limite de 3 essais atteinte. Contactez-nous pour un accès complet.";
    return;
  }

  // Incrémenter le compteur
  trials++;
  localStorage.setItem("trialCount", trials);

  document.getElementById("trialMessage").innerText =
    `Essai ${trials} / ${MAX_TRIALS}`;



  console.log("▶ Calcul lancé");

  // -------- INFOS GÉNÉRALES --------
  const company = document.getElementById("companyName")?.value || "Entreprise";
  const employees = val("employees");

  // -------- SCOPE 1 --------
  const fuel = val("fuel");               // litres/an
  const companyCarsKm = val("companyCarsKm");
  const gaz = val("gaz");                 // kg/an

  // -------- SCOPE 2 --------
  const electricity = val("electricity"); // kWh/an
  const heating = val("heating");         // kWh/an

  // -------- SCOPE 3 --------
  const commuteKm = val("commuteKm");     // km/jour
  const commuteType = document.getElementById("commuteType")?.value || "car";
  const carTravel = val("carTravel");     // km/an
  const planeTravel = val("planeTravel"); // km/an
  const meals = val("meals");
  const mealType = document.getElementById("mealType")?.value || "mixte";
  const purchases = val("purchases");
  const waste = val("waste");
  const water = val("water");

  // -------- FACTEURS D’ÉMISSION (kg CO2e) --------
  const FE = {
    fuel: 2.68,
    gaz: 1300,
    carKm: 0.192,
    electricity: 0.056,
    heating: 0.20,
    commute: {
      car: 0.192,
      public: 0.05,
      bike: 0
    },
    plane: 0.25,
    meals: {
      viande: 2.0,
      mixte: 1.2,
      vegetarien: 0.5
    },
    purchases: 0.5,
    waste: 0.3,
    water: 0.0003
  };

  // -------- CALCULS --------
  const scope1 =
    fuel * FE.fuel +
    gaz * FE.gaz +
    companyCarsKm * FE.carKm;

  const scope2 =
    electricity * FE.electricity +
    heating * FE.heating;

  const commuteEmission =
    commuteKm *
    FE.commute[commuteType] *
    employees *
    220; // jours travaillés/an

  const scope3 =
    commuteEmission +
    carTravel * FE.carKm +
    planeTravel * FE.plane +
    meals * FE.meals[mealType] +
    purchases * FE.purchases +
    waste * FE.waste +
    water * FE.water;

  const total = scope1 + scope2 + scope3;

  // -------- SCORE CARBONE --------
  let score = "E – Critique";
  if (total < 5000) score = "A – Excellent";
  else if (total < 15000) score = "B – Faible";
  else if (total < 30000) score = "C – Moyen";
  else if (total < 60000) score = "D – Élevé";

  // -------- AFFICHAGE --------
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <h3> Résultats – ${company}</h3>
    <p><strong>Scope 1 :</strong> ${scope1.toFixed(2)} kg CO₂e / an</p>
    <p><strong>Scope 2 :</strong> ${scope2.toFixed(2)} kg CO₂e / an</p>
    <p><strong>Scope 3 :</strong> ${scope3.toFixed(2)} kg CO₂e / an</p>
    <hr>
    <p><strong>Total :</strong> ${total.toFixed(2)} kg CO₂e / an</p>
    <p><strong>Score carbone :</strong> ${score}</p>
  `;

  // -------- GRAPHIQUE --------
  const canvas = document.getElementById("graphCO2");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (chartCO2) chartCO2.destroy();

  chartCO2 = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Scope 1", "Scope 2", "Scope 3"],
      datasets: [{
        data: [scope1, scope2, scope3],
        backgroundColor: ["#e74c3c", "#3498db", "#f1c40f"]
      }]
    },
    options: {
      responsive: true
    }
  });
}

// ======================================
// PDF
// ======================================
