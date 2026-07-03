import { calculateBill, getApplianceDecayRate } from "./tariffCalculator";
import type { ApplianceItem } from "./tariffCalculator";

export interface AuditRecommendation {
  id: string;
  title: string;
  description: string;
  yearlySavings: number;
  action: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface AuditInsight {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

export interface AuditResult {
  score: number;
  status: "Excellent" | "Good" | "Average" | "Needs Improvement";
  statusColor: string;
  statusBg: string;
  totalUnits: number;
  totalBill: number;
  hogs: {
    id: string;
    name: string;
    category: string;
    watts: number;
    quantity: number;
    hours: number;
    monthlyKwh: number;
    percent: number;
  }[];
  insights: AuditInsight[];
  recommendations: AuditRecommendation[];
  solarAdvice: {
    sizeKw: number;
    offsetPercent: number;
    description: string;
    estimatedCost: number;
    yearlySavings: number;
  };
}

export const runHomeAudit = (
  appliances: ApplianceItem[],
  customWattages: Record<string, number> = {},
  tariffState: string = "ap",
  customFlatRate: number = 7.5
): AuditResult => {
  // 1. Filter and sanitize input appliances
  const sanitized = appliances
    .filter(
      (app) =>
        app.quantity > 0 &&
        app.hours > 0 &&
        (customWattages[app.id] !== undefined ? customWattages[app.id] : app.watts) > 0
    )
    // De-duplicate if any
    .reduce((acc: ApplianceItem[], current) => {
      const existing = acc.find((item) => item.id === current.id);
      if (existing) {
        // Merge quantity and calculate weighted hours
        const totalQty = existing.quantity + current.quantity;
        const weightedHours =
          (existing.hours * existing.quantity + current.hours * current.quantity) / totalQty;
        existing.quantity = totalQty;
        existing.hours = weightedHours;
      } else {
        acc.push({ ...current });
      }
      return acc;
    }, []);

  // 2. Calculate individual consumption
  let totalUnits = 0;
  const breakdown = sanitized.map((app) => {
    const watt = customWattages[app.id] !== undefined ? customWattages[app.id] : app.watts;
    const decayRate = getApplianceDecayRate(app.id);
    let monthlyKwh = 0;
    let sumEffectiveWattsHours = 0;
    let sumHours = 0;
    
    if (decayRate > 0) {
      for (let i = 0; i < app.quantity; i++) {
        const uHours = app.unitHours?.[i] ?? app.hours ?? 0;
        const uAge = app.unitAges?.[i] ?? app.age ?? 0;
        const effectiveWatts = watt * (1 + uAge * decayRate);
        monthlyKwh += (effectiveWatts / 1000) * uHours * 30;
        sumEffectiveWattsHours += effectiveWatts * uHours;
        sumHours += uHours;
      }
    } else {
      monthlyKwh = (watt * app.quantity * app.hours * 30) / 1000;
    }
    
    const avgEffectiveWatts = decayRate > 0 && sumHours > 0 ? (sumEffectiveWattsHours / sumHours) : watt;
    totalUnits += monthlyKwh;
    
    return {
      id: app.id,
      name: app.name,
      category: app.category,
      watts: Math.round(avgEffectiveWatts),
      quantity: app.quantity,
      hours: app.hours,
      monthlyKwh
    };
  });

  // Calculate percentages
  const totalUnitsSafe = totalUnits || 1;
  const hogs = breakdown
    .map((item) => ({
      ...item,
      percent: Math.round((item.monthlyKwh / totalUnitsSafe) * 100)
    }))
    .sort((a, b) => b.monthlyKwh - a.monthlyKwh);

  // 3. Current Bill Estimation
  const currentBillResult = calculateBill(totalUnits, tariffState, customFlatRate);
  const totalBill = currentBillResult.netEnergyCharge;

  // Helper to calculate bill delta for a specific consumption decrease
  const getYearlySavingsForReduction = (reducedKwh: number): number => {
    const newUnits = Math.max(0, totalUnits - reducedKwh);
    const newBillResult = calculateBill(newUnits, tariffState, customFlatRate);
    const monthlySavings = Math.max(0, totalBill - newBillResult.netEnergyCharge);
    return Math.round(monthlySavings * 12);
  };

  // 4. Inefficiencies Detection & Scoring
  let score = 100;
  const insights: AuditInsight[] = [];
  const recommendations: AuditRecommendation[] = [];

  // Appliance Lifecycle & Efficiency Decay Tracker
  const unitUpgradeCosts: Record<string, number> = {
    ac: 40000,
    fridge: 25000,
    fan: 3500
  };
  const unitUpgradeWatts: Record<string, number> = {
    ac: 1200,
    fridge: 130,
    fan: 28
  };

  sanitized.forEach((app) => {
    const decayRate = getApplianceDecayRate(app.id);
    if (decayRate > 0) {
      const ages = app.unitAges || Array(app.quantity).fill(app.age || 0);
      const oldUnitsIndices = ages.reduce((acc: number[], age, idx) => {
        if (age >= 5) acc.push(idx);
        return acc;
      }, []);

      if (oldUnitsIndices.length > 0) {
        const maxAge = Math.max(...ages);
        const percentLoss = Math.round(maxAge * decayRate * 100);
        
        insights.push({
          title: `Efficiency Decay: Old ${app.name}`,
          description: `Your ${app.name} (${oldUnitsIndices.length} unit${oldUnitsIndices.length > 1 ? 's' : ''}) is up to ${maxAge} years old and has lost ~${percentLoss}% efficiency due to mechanical wear.`,
          impact: maxAge >= 10 ? "high" : "medium"
        });

        // Scoring penalty for efficiency loss
        score -= Math.min(12, oldUnitsIndices.length * 2 + Math.round(maxAge * 0.5));

        // Payback / Upgrade Recommendation
        let currentOldKwh = 0;
        let newUpgradedKwh = 0;
        const targetWatts = unitUpgradeWatts[app.id];
        const watt = customWattages[app.id] !== undefined ? customWattages[app.id] : app.watts;

        oldUnitsIndices.forEach((idx) => {
          const uHours = app.unitHours?.[idx] ?? app.hours ?? 0;
          const uAge = ages[idx];
          const effectiveWatts = watt * (1 + uAge * decayRate);
          currentOldKwh += (effectiveWatts / 1000) * uHours * 30;
          newUpgradedKwh += (targetWatts / 1000) * uHours * 30;
        });

        const savedKwh = Math.max(0, currentOldKwh - newUpgradedKwh);
        const yearlySavings = getYearlySavingsForReduction(savedKwh);

        if (yearlySavings > 120) {
          const totalInvestment = oldUnitsIndices.length * unitUpgradeCosts[app.id];
          const paybackYears = Math.round((totalInvestment / yearlySavings) * 10) / 10;

          recommendations.push({
            id: `upgrade_${app.id}`,
            title: `Replace Old ${app.name}`,
            description: `Upgrading ${oldUnitsIndices.length} old ${app.name}(s) (up to ${maxAge} yrs old) to new BEE 5-star models saves ₹${yearlySavings.toLocaleString("en-IN")}/yr. Est. payback: ${paybackYears} years.`,
            yearlySavings: yearlySavings,
            action: `Upgrade to 5-star ${app.name} (Cost: ₹${totalInvestment.toLocaleString("en-IN")}, Payback: ${paybackYears} yrs).`,
            difficulty: paybackYears <= 6 ? "Medium" : "Hard"
          });
        }
      }
    }
  });


  // Consumption excess penalty
  // Base average similar household baseline is 250 kWh
  if (totalUnits > 250) {
    const excess = totalUnits - 250;
    const penalty = Math.min(30, Math.round(excess * 0.1));
    score -= penalty;
    insights.push({
      title: "Above Baseline Consumption",
      description: `Your monthly usage of ${Math.round(totalUnits)} kWh is above the regional baseline of 250 kWh, increasing your unit slab rate.`,
      impact: "medium"
    });
  }

  // AC Inefficiency
  const ac = hogs.find((h) => h.id === "ac");
  if (ac) {
    if (ac.hours > 5) {
      score -= 10;
      insights.push({
        title: "Extended AC Usage Patterns",
        description: `Your Air Conditioner runs for ${ac.hours.toFixed(1)} hrs/day. Cooling accounts for ${ac.percent}% of your total electricity consumption.`,
        impact: "high"
      });
    }

    // Recommendation 1: Reduce AC usage hours
    const acKwhReduction = (ac.watts * ac.quantity * 1.5 * 30) / 1000; // if they reduce by 1.5 hours
    const acHoursSavings = getYearlySavingsForReduction(acKwhReduction);
    if (acHoursSavings > 200) {
      recommendations.push({
        id: "ac_hours_reduction",
        title: "Optimize AC Running Schedule",
        description: `Reducing AC usage by just 1.5 hours daily across units can save up to ₹${acHoursSavings.toLocaleString("en-IN")}/year.`,
        yearlySavings: acHoursSavings,
        action: "Set a sleep timer or raise temperature to 24-26°C.",
        difficulty: "Easy"
      });
    }

    // Recommendation 2: 5-Star inverter replacement suggestion
    if (ac.watts > 1200) {
      // Suggesting upgrading standard to 5-star inverter (saves ~25% power)
      const acUpgradeKwhReduction = (ac.watts * 0.25 * ac.quantity * ac.hours * 30) / 1000;
      const acUpgradeSavings = getYearlySavingsForReduction(acUpgradeKwhReduction);
      if (acUpgradeSavings > 500) {
        recommendations.push({
          id: "ac_upgrade",
          title: "Upgrade to 5-Star Inverter AC",
          description: `Replacing old/non-inverter ACs with 5-star inverter models cuts consumption by 25%, saving ₹${acUpgradeSavings.toLocaleString("en-IN")}/year.`,
          yearlySavings: acUpgradeSavings,
          action: "Replace high-load ACs with Bureau of Energy Efficiency (BEE) 5-star models.",
          difficulty: "Hard"
        });
      }
    }
  }

  // Refrigerator Load
  const fridge = hogs.find((h) => h.id === "fridge");
  if (fridge) {
    // Refrigerator runs 24/7. Standard double door might use 220W, but 5-star inverter uses ~140W
    if (fridge.watts > 180) {
      score -= 5;
      insights.push({
        title: "Continuous Refrigerator Load",
        description: "Refrigerators run 24 hours a day. Your model has a relatively high power draw, indicating potential star-rating inefficiency.",
        impact: "medium"
      });

      // Recommendation: Upgrade fridge to 5-star inverter
      const fridgeUpgradeKwhReduction = ((fridge.watts - 130) * fridge.quantity * 24 * 30) / 1000;
      const fridgeSavings = getYearlySavingsForReduction(fridgeUpgradeKwhReduction);
      if (fridgeSavings > 300) {
        recommendations.push({
          id: "fridge_upgrade",
          title: "Install BEE 5-Star Refrigerator",
          description: `Switching to a 5-star inverter model cuts continuous draw, saving ₹${fridgeSavings.toLocaleString("en-IN")}/year.`,
          yearlySavings: fridgeSavings,
          action: "Choose an inverter compressor refrigerator and check door seals regularly.",
          difficulty: "Medium"
        });
      }
    }
  }

  // Water Heater / Geyser
  const geyser = hogs.find((h) => h.id === "water_heater");
  if (geyser) {
    if (geyser.hours > 1.5) {
      score -= 8;
      insights.push({
        title: "High Geyser Heating Cycle",
        description: `Water heaters consume massive power (~2000W). Running geysers for ${geyser.hours.toFixed(1)} hrs/day consumes considerable energy.`,
        impact: "high"
      });
    }

    // Recommendation: Reduce geyser heating duration
    const geyserKwhReduction = (geyser.watts * geyser.quantity * 0.5 * 30) / 1000; // reduce by 30 mins
    const geyserSavings = getYearlySavingsForReduction(geyserKwhReduction);
    if (geyserSavings > 150) {
      recommendations.push({
        id: "geyser_management",
        title: "Limit Water Heater Runtime",
        description: `Reducing geyser pre-heating by 30 minutes daily saves ₹${geyserSavings.toLocaleString("en-IN")}/year.`,
        yearlySavings: geyserSavings,
        action: "Install a timer switch or switch off geysers immediately after heating.",
        difficulty: "Easy"
      });
    }
  }

  // Ceiling Fan
  const fan = hogs.find((h) => h.id === "fan");
  if (fan) {
    // If they have conventional fans (typically 75W vs BLDC 28W)
    if (fan.watts > 40 && fan.hours > 8) {
      const fanBldcKwhReduction = ((fan.watts - 28) * fan.quantity * fan.hours * 30) / 1000;
      const fanSavings = getYearlySavingsForReduction(fanBldcKwhReduction);
      if (fanSavings > 200) {
        recommendations.push({
          id: "fan_bldc_upgrade",
          title: "Replace with BLDC Ceiling Fans",
          description: `Upgrading conventional ceiling fans to 28W BLDC fans saves up to ₹${fanSavings.toLocaleString("en-IN")}/year.`,
          yearlySavings: fanSavings,
          action: "Replace standard induction fans with Brushless DC (BLDC) motor fans.",
          difficulty: "Medium"
        });
      }
    }
  }

  // Standby Loads / Phantom loads
  // Router, TVs, Desktop, Console in standby
  const standbyCount = sanitized.filter((item) =>
    ["tv", "desktop", "router", "gaming_console", "printer", "microwave"].includes(item.id)
  ).length;
  if (standbyCount >= 3) {
    score -= 4;
    insights.push({
      title: "Standby Phantom Loads",
      description: "Multiple media and networking devices are connected. Standby phantom loads contribute silently to your base grid draw.",
      impact: "low"
    });

    // Estimate standby draw at 8W per device for 20 hours/day
    const standbyReductionKwh = (8 * standbyCount * 20 * 30) / 1000;
    const standbySavings = getYearlySavingsForReduction(standbyReductionKwh);
    if (standbySavings > 100) {
      recommendations.push({
        id: "eliminate_standby",
        title: "Eliminate Standby Phantom Loads",
        description: `Unplugging electronics or using smart power strips to cut off standby draws saves ₹${standbySavings.toLocaleString("en-IN")}/year.`,
        yearlySavings: standbySavings,
        action: "Unplug chargers, gaming devices, and TVs from the wall when not in use.",
        difficulty: "Easy"
      });
    }
  }

  // Lighting Replacement
  const lights = hogs.find((h) => h.id === "lights");
  if (lights && lights.watts > 12) {
    const lightsReduction = ((lights.watts - 9) * lights.quantity * lights.hours * 30) / 1000;
    const lightsSavings = getYearlySavingsForReduction(lightsReduction);
    if (lightsSavings > 100) {
      recommendations.push({
        id: "led_conversion",
        title: "Upgrade to 9W LED Bulbs",
        description: `Converting conventional bulbs to 9W LEDs saves ₹${lightsSavings.toLocaleString("en-IN")}/year.`,
        yearlySavings: lightsSavings,
        action: "Replace standard incandescent or CFL bulbs with BEE-rated 9W LEDs.",
        difficulty: "Easy"
      });
    }
  }

  const tube = hogs.find((h) => h.id === "lights_tube");
  if (tube && tube.watts > 18) {
    const tubeReduction = ((tube.watts - 18) * tube.quantity * tube.hours * 30) / 1000;
    const tubeSavings = getYearlySavingsForReduction(tubeReduction);
    if (tubeSavings > 100) {
      recommendations.push({
        id: "tube_led_conversion",
        title: "Upgrade to T5 LED Tube Lights",
        description: `Upgrading conventional tube lights to 18W T5 LED tube lights saves ₹${tubeSavings.toLocaleString("en-IN")}/year.`,
        yearlySavings: tubeSavings,
        action: "Replace standard 40W tube lights with slim T5 LED tubes.",
        difficulty: "Easy"
      });
    }
  }

  // Check if any appliance uses more than 20% of total
  const majorHog = hogs.find((h) => h.percent > 20);
  if (majorHog) {
    insights.push({
      title: `Dominant Consumer: ${majorHog.name}`,
      description: `Your ${majorHog.name} is responsible for ${majorHog.percent}% of your total monthly bill. Focus efficiency measures here first.`,
      impact: "high"
    });
  }

  // Ensure score is within valid limits [10, 100]
  score = Math.max(10, Math.min(100, score));

  // Determine status and status colors
  let status: "Excellent" | "Good" | "Average" | "Needs Improvement" = "Excellent";
  let statusColor = "text-green-600 dark:text-primary-green";
  let statusBg = "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/40";

  if (score < 50) {
    status = "Needs Improvement";
    statusColor = "text-red-500 dark:text-red-400";
    statusBg = "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40";
  } else if (score < 70) {
    status = "Average";
    statusColor = "text-orange-500 dark:text-warning-orange";
    statusBg = "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40";
  } else if (score < 85) {
    status = "Good";
    statusColor = "text-blue-500 dark:text-blue-400";
    statusBg = "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40";
  }

  // 5. Solar ROI suggestion engine
  const kwNeeded = Math.max(1, Math.round((totalUnits / 120) * 2) / 2); // 1 kW produces ~120 units
  const solarGen = kwNeeded * 120;
  const offsetPercent = Math.min(100, Math.round((solarGen / totalUnitsSafe) * 100));

  // Estimating solar cost (₹55,000 per kW after subsidy)
  const estimatedCost = kwNeeded * 55000;
  
  // Calculate yearly savings if solar covers offsetPercent of total
  const offsetUnits = Math.min(totalUnits, solarGen);
  const yearlySolarSavings = getYearlySavingsForReduction(offsetUnits);

  const solarAdvice = {
    sizeKw: kwNeeded,
    offsetPercent,
    estimatedCost,
    yearlySavings: yearlySolarSavings,
    description: `Based on your consumption of ${Math.round(totalUnits)} kWh, a ${kwNeeded.toFixed(1)} kW solar system can offset ${offsetPercent}% of your electricity grid dependency, saving about ₹${yearlySolarSavings.toLocaleString("en-IN")}/year.`
  };

  // If no appliances, default fallback
  if (sanitized.length === 0) {
    return {
      score: 100,
      status: "Excellent",
      statusColor: "text-green-600 dark:text-primary-green",
      statusBg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/40",
      totalUnits: 0,
      totalBill: 0,
      hogs: [],
      insights: [
        {
          title: "Audit Pending",
          description: "Select appliances on Step 1 of the Home Audit Wizard to generate your Energy Health Score.",
          impact: "low"
        }
      ],
      recommendations: [],
      solarAdvice: {
        sizeKw: 0,
        offsetPercent: 0,
        estimatedCost: 0,
        yearlySavings: 0,
        description: "Add appliances to receive customized rooftop solar sizing recommendations."
      }
    };
  }

  return {
    score,
    status,
    statusColor,
    statusBg,
    totalUnits,
    totalBill,
    hogs,
    insights,
    recommendations: recommendations.sort((a, b) => b.yearlySavings - a.yearlySavings),
    solarAdvice
  };
};
