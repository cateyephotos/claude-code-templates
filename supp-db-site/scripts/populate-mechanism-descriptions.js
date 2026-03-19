#!/usr/bin/env node
'use strict';

/**
 * Populate Mechanism Descriptions
 *
 * Fills in summary and relevance fields for all mechanisms in data/mechanisms.js.
 * Descriptions are written for a college-educated audience with no biology background.
 *
 * Usage: node scripts/populate-mechanism-descriptions.js
 */

const fs = require('fs');
const path = require('path');

// ── Description Database ─────────────────────────────────────────────────────
// Each entry: [summary, relevance]
// Summary: 2-3 sentences explaining what the mechanism is and how it works
// Relevance: 1 sentence starting with "Supplements targeting this mechanism..."

const DESCRIPTIONS = {
  // ═══════════════════════════════════════════════════════════════════════════
  // NEUROTRANSMITTER SYSTEMS
  // ═══════════════════════════════════════════════════════════════════════════

  "5-HT3 receptor antagonism": [
    "5-HT3 receptors are one type of serotonin receptor found in the brain and gut. Blocking these receptors can reduce nausea and modulate how the nervous system processes pain and anxiety signals.",
    "Supplements targeting this mechanism may help reduce nausea, calm digestive distress, and support mood balance."
  ],
  "Acetylcholine production increase": [
    "Acetylcholine is a neurotransmitter essential for memory, learning, and muscle control. Increasing its production means the brain has more of this chemical messenger available at nerve connections, strengthening signal transmission.",
    "Supplements targeting this mechanism may enhance memory formation, sharpen focus, and support overall cognitive performance."
  ],
  "Acetylcholine synthesis support": [
    "This mechanism provides the raw building blocks — primarily choline — that the brain needs to manufacture acetylcholine, a key neurotransmitter for thinking and memory. Without adequate precursors, the brain cannot produce enough acetylcholine to meet demand.",
    "Supplements targeting this mechanism may support sustained cognitive function, especially during periods of high mental demand."
  ],
  "Acetylcholinesterase inhibition": [
    "Acetylcholinesterase is an enzyme that breaks down acetylcholine after it delivers its signal between nerve cells. By slowing this enzyme, more acetylcholine remains active in the brain for longer periods, amplifying memory and learning signals.",
    "Supplements targeting this mechanism may improve memory retention, attention span, and information processing speed."
  ],
  "Adenosine receptor antagonism": [
    "Adenosine is a brain chemical that accumulates during waking hours and promotes sleepiness. Blocking adenosine receptors prevents this drowsiness signal from taking effect, keeping you alert and mentally sharp.",
    "Supplements targeting this mechanism may increase wakefulness, reduce perceived fatigue, and enhance mental alertness."
  ],
  "Adenosine receptor interaction": [
    "Adenosine receptors regulate the balance between alertness and sleepiness in the brain. Compounds that interact with these receptors can either promote relaxation or prevent drowsiness, depending on how they bind.",
    "Supplements targeting this mechanism may help regulate sleep-wake cycles and modulate energy levels throughout the day."
  ],
  "Adenosine receptor modulation": [
    "Rather than simply blocking adenosine receptors, modulation involves fine-tuning how these receptors respond to adenosine signals. This can create a more balanced effect on alertness without the sharp on/off of pure blocking.",
    "Supplements targeting this mechanism may provide smoother, more sustained energy without the jitteriness associated with strong stimulants."
  ],
  "Adenylyl cyclase activation": [
    "Adenylyl cyclase is an enzyme that produces cyclic AMP (cAMP), a molecular messenger that amplifies signals inside cells. When activated, it triggers a cascade of cellular responses including enhanced metabolism, memory consolidation, and neurotransmitter release.",
    "Supplements targeting this mechanism may boost cellular energy production, support long-term memory formation, and enhance neural signaling."
  ],
  "Adrenaline stimulation": [
    "Adrenaline (epinephrine) is the hormone responsible for the 'fight or flight' response — it increases heart rate, blood flow to muscles, and mental alertness. Stimulating its release triggers a burst of energy and heightened awareness.",
    "Supplements targeting this mechanism may provide short-term energy boosts, improve physical performance, and sharpen reaction time."
  ],
  "Alpha brain wave enhancement": [
    "Alpha brain waves (8-13 Hz) are associated with a state of calm alertness — the relaxed-but-focused mental state experienced during meditation or creative flow. Enhancing alpha wave activity promotes this balanced mental state without sedation.",
    "Supplements targeting this mechanism may promote relaxed focus, reduce anxiety without drowsiness, and support creative thinking."
  ],
  "Alpha brain wave promotion": [
    "Alpha brain waves represent a frequency pattern in the brain linked to relaxed concentration and reduced stress. Promoting these waves helps shift the brain from an anxious, overactive state into a calm, attentive mode.",
    "Supplements targeting this mechanism may help achieve a meditative-like calm while maintaining mental clarity and alertness."
  ],
  "AMPA receptor positive modulation": [
    "AMPA receptors are the brain's primary fast-acting excitatory receptors, responsible for most moment-to-moment neural communication. Positive modulation makes these receptors more responsive to glutamate signals, speeding up information processing and strengthening synaptic connections.",
    "Supplements targeting this mechanism may enhance learning speed, improve cognitive processing, and support synaptic plasticity."
  ],
  "cAMP elevation": [
    "Cyclic AMP (cAMP) is a universal 'second messenger' molecule that amplifies signals inside cells. When cAMP levels rise, it activates protein kinases that enhance metabolism, gene expression, memory formation, and cellular energy production.",
    "Supplements targeting this mechanism may boost cellular energy, support memory consolidation, and enhance the body's response to hormonal signals."
  ],
  "Cholinergic signaling enhancement": [
    "The cholinergic system uses acetylcholine to transmit signals involved in attention, memory, and muscle activation. Enhancing this system means improving the overall efficiency of acetylcholine-based communication throughout the brain and nervous system.",
    "Supplements targeting this mechanism may improve attention, working memory, and the brain's ability to form new memories."
  ],
  "Cortisol regulation": [
    "Cortisol is the body's primary stress hormone — essential in small amounts but harmful when chronically elevated. Regulation means helping the body maintain healthy cortisol rhythms: high in the morning for energy, tapering in the evening for sleep.",
    "Supplements targeting this mechanism may help manage stress responses, improve sleep quality, and protect against the long-term effects of chronic stress."
  ],
  "Dopamine enhancement": [
    "Dopamine is the neurotransmitter driving motivation, reward, pleasure, and movement control. Enhancement can mean increasing dopamine production, reducing its breakdown, or making receptors more sensitive — all resulting in improved mood and drive.",
    "Supplements targeting this mechanism may boost motivation, improve mood, and support the brain's reward and pleasure circuits."
  ],
  "Dopamine receptor sensitivity": [
    "Dopamine receptors are proteins on nerve cells that detect dopamine signals. When these receptors become more sensitive, the brain responds more strongly to the same amount of dopamine, amplifying feelings of motivation and reward.",
    "Supplements targeting this mechanism may help restore motivation, counter anhedonia (inability to feel pleasure), and improve response to natural rewards."
  ],
  "Dopamine synthesis support": [
    "The brain manufactures dopamine through a multi-step process requiring the amino acid tyrosine, iron, vitamin B6, and other cofactors. Supporting this synthesis pathway ensures the brain has adequate raw materials to produce sufficient dopamine.",
    "Supplements targeting this mechanism may support sustained motivation and mental energy by ensuring the brain can produce enough dopamine."
  ],
  "GABA receptor agonism": [
    "GABA (gamma-aminobutyric acid) is the brain's primary calming neurotransmitter, acting like a brake pedal on neural activity. GABA receptor agonists mimic or enhance GABA's calming effect, reducing neuronal excitability and promoting relaxation.",
    "Supplements targeting this mechanism may reduce anxiety, promote calmness, improve sleep onset, and help manage stress."
  ],
  "GABA signaling enhancement": [
    "The GABAergic system is the brain's main inhibitory network — it prevents neurons from firing too rapidly or chaotically. Enhancing GABA signaling strengthens this calming network, helping to quiet overactive brain circuits.",
    "Supplements targeting this mechanism may help reduce anxiety, calm racing thoughts, and support restful sleep."
  ],
  "GABAergic activity": [
    "GABAergic neurons release GABA to inhibit neural excitability throughout the nervous system. Increased GABAergic activity creates a general calming effect, counterbalancing the excitatory glutamate system to maintain neural equilibrium.",
    "Supplements targeting this mechanism may promote overall nervous system calm, reduce hyperexcitability, and support balanced brain function."
  ],
  "Glutamate modulation": [
    "Glutamate is the brain's primary excitatory neurotransmitter — essential for learning and memory but potentially toxic in excess. Modulation means keeping glutamate within a healthy range: enough for cognitive function, not so much that it damages neurons.",
    "Supplements targeting this mechanism may protect against excitotoxicity while preserving the brain's ability to learn and form memories."
  ],
  "HPA axis modulation": [
    "The HPA (hypothalamic-pituitary-adrenal) axis is the body's central stress response system. It controls cortisol release, energy mobilization, and the fight-or-flight response. Modulation means keeping this system responsive but not overactive.",
    "Supplements targeting this mechanism may help the body respond appropriately to stress without becoming chronically activated."
  ],
  "Melatonin receptor agonism": [
    "Melatonin receptors in the brain respond to melatonin, the hormone that signals darkness and triggers sleepiness. Agonists activate these receptors, mimicking melatonin's effect and helping to initiate sleep and reset circadian rhythms.",
    "Supplements targeting this mechanism may improve sleep onset, help with jet lag recovery, and support healthy circadian rhythm maintenance."
  ],
  "Monoamine oxidase inhibition": [
    "Monoamine oxidase (MAO) is an enzyme that breaks down neurotransmitters like serotonin, dopamine, and norepinephrine. Inhibiting this enzyme keeps more of these mood-regulating chemicals active in the brain for longer periods.",
    "Supplements targeting this mechanism may elevate mood, increase motivation, and support emotional resilience by preserving key neurotransmitters."
  ],
  "Neurotransmitter synthesis support": [
    "The brain requires specific amino acids, vitamins, and minerals to manufacture neurotransmitters like serotonin, dopamine, and GABA. This mechanism ensures the availability of these precursors and cofactors for healthy neurotransmitter production.",
    "Supplements targeting this mechanism may support balanced mood, cognitive function, and overall brain chemical health."
  ],
  "NMDA receptor modulation": [
    "NMDA receptors are specialized brain receptors crucial for learning, memory formation, and synaptic plasticity (the brain's ability to strengthen frequently used connections). Modulation fine-tunes their activity for optimal cognitive function.",
    "Supplements targeting this mechanism may enhance learning capacity, support memory formation, and protect against age-related cognitive decline."
  ],
  "Norepinephrine modulation": [
    "Norepinephrine (noradrenaline) is a neurotransmitter that controls alertness, attention, and the body's stress response. Modulation keeps this system balanced — responsive enough for focus and vigilance without triggering anxiety.",
    "Supplements targeting this mechanism may improve attention, mental clarity, and the ability to concentrate under pressure."
  ],
  "Phosphodiesterase inhibition": [
    "Phosphodiesterases are enzymes that break down cyclic nucleotides (cAMP and cGMP), which are important signaling molecules inside cells. Inhibiting these enzymes allows these signals to persist longer, enhancing blood flow, cognitive function, and smooth muscle relaxation.",
    "Supplements targeting this mechanism may improve cerebral blood flow, support cognitive enhancement, and promote vascular relaxation."
  ],
  "Serotonin precursor": [
    "Serotonin is a neurotransmitter that regulates mood, sleep, appetite, and pain perception. Precursors are molecules the body converts into serotonin, such as tryptophan and 5-HTP, providing the raw material for serotonin synthesis.",
    "Supplements targeting this mechanism may help elevate mood, improve sleep quality, and support emotional well-being by boosting serotonin levels."
  ],
  "Serotonin synthesis": [
    "The body produces serotonin through a multi-step process starting with the amino acid tryptophan, which is converted to 5-HTP and then to serotonin. This process requires adequate B vitamins, iron, and other cofactors.",
    "Supplements targeting this mechanism may support healthy serotonin levels, contributing to mood stability, appetite regulation, and sleep quality."
  ],
  "Sleep-wake cycle regulation via melatonin precursor pathway": [
    "The body's sleep-wake cycle depends on melatonin production, which follows a pathway from tryptophan → serotonin → melatonin. Supporting this precursor pathway helps the body produce melatonin at the right time for natural sleep onset.",
    "Supplements targeting this mechanism may support healthy circadian rhythms and natural melatonin production for improved sleep timing."
  ],
  "Sleep-wake cycle regulation via GABAergic interneurons": [
    "Sleep transitions are controlled partly by GABAergic interneurons in the brain that inhibit wake-promoting circuits. When these neurons become active, they quiet the arousal centers, allowing the brain to transition smoothly into sleep.",
    "Supplements targeting this mechanism may promote natural sleep onset by supporting the brain's built-in sleep-switching circuits."
  ],
  "Synaptic plasticity enhancement": [
    "Synaptic plasticity is the brain's ability to strengthen or weaken connections between neurons based on experience — it's the cellular basis of learning and memory. Enhancement means making these connections form more easily and persist longer.",
    "Supplements targeting this mechanism may improve learning speed, memory retention, and the brain's ability to adapt to new information."
  ],
  "Tyrosine hydroxylase activation": [
    "Tyrosine hydroxylase is the rate-limiting enzyme in dopamine and norepinephrine production — it converts the amino acid tyrosine into L-DOPA, the first step in catecholamine synthesis. Activating this enzyme increases the brain's capacity to produce these energizing neurotransmitters.",
    "Supplements targeting this mechanism may support dopamine and norepinephrine production for improved motivation, focus, and mental energy."
  ],
  "Voltage-gated calcium channel modulation": [
    "Voltage-gated calcium channels control the flow of calcium ions into neurons, which triggers neurotransmitter release at synapses. Modulating these channels fine-tunes how much neurotransmitter is released with each nerve signal.",
    "Supplements targeting this mechanism may help regulate neural excitability, pain signaling, and neurotransmitter balance."
  ],

  // Catch-all for remaining neurotransmitter mechanisms
  "Catecholamine modulation": [
    "Catecholamines (dopamine, norepinephrine, epinephrine) are a family of neurotransmitters that control alertness, motivation, and the stress response. Modulation keeps their levels and activity within optimal ranges for mental performance.",
    "Supplements targeting this mechanism may support balanced energy, mood, and stress responses."
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // ANTIOXIDANT & CELLULAR PROTECTION
  // ═══════════════════════════════════════════════════════════════════════════

  "Antioxidant activity": [
    "Antioxidants neutralize free radicals — unstable molecules that damage cells, proteins, and DNA through a process called oxidative stress. By donating electrons to stabilize these free radicals, antioxidants prevent chain reactions of cellular damage.",
    "Supplements targeting this mechanism may protect cells from oxidative damage, slow aging processes, and reduce the risk of chronic diseases."
  ],
  "Antioxidant neuroprotection": [
    "The brain is especially vulnerable to oxidative damage because it consumes 20% of the body's oxygen while having relatively few antioxidant defenses. Neuroprotective antioxidants specifically target brain tissue to shield neurons from free radical damage.",
    "Supplements targeting this mechanism may protect brain cells from age-related degeneration and support long-term cognitive health."
  ],
  "Antioxidant enzyme upregulation": [
    "Rather than acting as antioxidants directly, some compounds stimulate the body's own antioxidant defense system by increasing production of enzymes like superoxide dismutase (SOD), catalase, and glutathione peroxidase.",
    "Supplements targeting this mechanism may strengthen the body's endogenous antioxidant defenses for more sustained cellular protection."
  ],
  "ATP regeneration": [
    "ATP (adenosine triphosphate) is the universal energy currency of cells. ATP regeneration involves recycling spent ADP back into ATP, primarily through the mitochondria's electron transport chain, keeping cellular energy supply constant.",
    "Supplements targeting this mechanism may combat fatigue, support high-energy tissues like brain and muscle, and improve exercise endurance."
  ],
  "Autophagy induction": [
    "Autophagy is the cell's self-cleaning process — it identifies and recycles damaged proteins, broken organelles, and accumulated waste. This 'cellular housekeeping' is essential for maintaining cell health and preventing the buildup of toxic debris.",
    "Supplements targeting this mechanism may support cellular rejuvenation, slow aging processes, and help the body clear dysfunctional components."
  ],
  "Cell membrane stabilization": [
    "Cell membranes are the protective barriers around every cell, controlling what enters and exits. Stabilization strengthens these membranes against physical stress, oxidative damage, and inflammatory attack, maintaining proper cell function.",
    "Supplements targeting this mechanism may protect cells from environmental stressors and maintain healthy cellular communication."
  ],
  "Cell membrane fluidity": [
    "Cell membrane fluidity describes how easily molecules can move within the cell membrane. Optimal fluidity is essential for receptor function, nutrient transport, and cell signaling — too rigid or too fluid impairs these processes.",
    "Supplements targeting this mechanism may improve cellular communication, receptor sensitivity, and nutrient absorption."
  ],
  "DNA synthesis and repair": [
    "Cells constantly replicate their DNA during growth and repair damaged DNA caused by radiation, toxins, and normal metabolic processes. This mechanism supports the enzymes and raw materials needed for accurate DNA copying and damage correction.",
    "Supplements targeting this mechanism may support healthy cell division, tissue repair, and protection against mutations."
  ],
  "Free radical scavenging": [
    "Free radicals are chemically reactive molecules with unpaired electrons that steal electrons from nearby molecules, causing a chain reaction of damage. Scavengers neutralize these radicals by providing the missing electrons without becoming reactive themselves.",
    "Supplements targeting this mechanism may reduce oxidative damage to cells, proteins, and DNA throughout the body."
  ],
  "Glutathione synthesis support": [
    "Glutathione is often called the body's 'master antioxidant' — it protects cells from oxidative damage, detoxifies harmful substances, and supports immune function. The body synthesizes it from three amino acids: cysteine, glycine, and glutamate.",
    "Supplements targeting this mechanism may boost the body's most important internal antioxidant defense system."
  ],
  "Mitochondrial biogenesis": [
    "Mitochondria are the power plants inside cells that generate ATP energy. Mitochondrial biogenesis is the process of creating new mitochondria, increasing the cell's energy-producing capacity — especially important for high-energy tissues like brain, heart, and muscle.",
    "Supplements targeting this mechanism may increase cellular energy capacity, combat fatigue, and support the function of energy-demanding organs."
  ],
  "Mitochondrial electron transport chain optimization": [
    "The electron transport chain is a series of protein complexes inside mitochondria that converts nutrients into ATP energy. Optimization ensures electrons flow efficiently through this chain, maximizing energy output while minimizing wasteful free radical production.",
    "Supplements targeting this mechanism may improve cellular energy efficiency and reduce oxidative byproducts of energy production."
  ],
  "Mitochondrial function support": [
    "Mitochondria perform numerous functions beyond energy production, including calcium buffering, heat generation, and triggering programmed cell death when needed. Supporting overall mitochondrial health keeps these vital organelles functioning properly.",
    "Supplements targeting this mechanism may support sustained energy levels, healthy aging, and the function of metabolically active tissues."
  ],
  "Mitochondrial membrane potential maintenance": [
    "The mitochondrial membrane maintains an electrical charge difference (potential) that drives ATP production — like water pressure driving a turbine. When this potential drops, energy production fails and cells can initiate self-destruction.",
    "Supplements targeting this mechanism may protect cells from energy failure and support consistent mitochondrial ATP output."
  ],
  "NAD+ biosynthesis": [
    "NAD+ (nicotinamide adenine dinucleotide) is a coenzyme present in every living cell, essential for energy metabolism, DNA repair, and cellular signaling. Its levels decline with age, and boosting NAD+ biosynthesis may counteract some effects of aging.",
    "Supplements targeting this mechanism may support cellular energy production, DNA repair capacity, and healthy aging processes."
  ],
  "Nrf2 pathway activation": [
    "Nrf2 is a protein that acts as a master switch for the body's antioxidant and detoxification defenses. When activated, it enters the cell nucleus and turns on over 200 protective genes, dramatically boosting the cell's ability to neutralize threats.",
    "Supplements targeting this mechanism may activate the body's most powerful endogenous defense system against oxidative stress and toxins."
  ],
  "Oxidative stress reduction": [
    "Oxidative stress occurs when free radical production overwhelms the body's antioxidant defenses, leading to cumulative cellular damage. Reduction involves either decreasing free radical production, boosting antioxidant capacity, or both.",
    "Supplements targeting this mechanism may help restore the balance between oxidative damage and antioxidant protection throughout the body."
  ],
  "Reactive oxygen species neutralization": [
    "Reactive oxygen species (ROS) are oxygen-containing molecules with unpaired electrons that damage proteins, lipids, and DNA. Neutralization converts these harmful molecules into harmless water and oxygen before they can cause cellular injury.",
    "Supplements targeting this mechanism may protect cellular components from oxygen-derived free radical damage."
  ],
  "Sirtuin activation": [
    "Sirtuins are a family of proteins that regulate cellular health, DNA repair, inflammation, and metabolism. They act as cellular sensors for energy status and stress, activating protective pathways when resources are scarce — mimicking some benefits of caloric restriction.",
    "Supplements targeting this mechanism may promote healthy aging, metabolic efficiency, and cellular stress resistance."
  ],
  "Telomere protection": [
    "Telomeres are protective caps at the ends of chromosomes that shorten with each cell division — like the plastic tips on shoelaces that prevent fraying. When telomeres become too short, cells stop dividing or die, contributing to aging.",
    "Supplements targeting this mechanism may help preserve chromosome integrity and potentially slow aspects of cellular aging."
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // ANTI-INFLAMMATORY PATHWAYS
  // ═══════════════════════════════════════════════════════════════════════════

  "Anti-inflammatory activity": [
    "Inflammation is the body's defense response to injury or infection, but chronic low-grade inflammation damages tissues over time. Anti-inflammatory activity involves reducing the production of inflammatory signaling molecules (cytokines, prostaglandins) to prevent this chronic damage.",
    "Supplements targeting this mechanism may help manage chronic inflammation, reduce pain, and lower the risk of inflammation-related diseases."
  ],
  "Anti-inflammatory NF-κB pathway inhibition": [
    "NF-κB is a protein complex that acts as a master switch for inflammation — when activated, it turns on genes that produce inflammatory molecules. Inhibiting this pathway reduces the inflammatory cascade at its source.",
    "Supplements targeting this mechanism may reduce systemic inflammation by blocking one of the body's primary inflammatory signaling pathways."
  ],
  "COX-2 inhibition": [
    "COX-2 (cyclooxygenase-2) is an enzyme that produces prostaglandins — hormone-like substances that cause pain, swelling, and inflammation. Inhibiting COX-2 reduces prostaglandin production, providing anti-inflammatory and pain-relieving effects similar to ibuprofen.",
    "Supplements targeting this mechanism may reduce pain and inflammation, particularly in joints and muscles."
  ],
  "Cytokine modulation": [
    "Cytokines are signaling proteins that coordinate the immune response — some promote inflammation (pro-inflammatory) while others resolve it (anti-inflammatory). Modulation means shifting this balance toward resolution while preserving the immune system's ability to respond to threats.",
    "Supplements targeting this mechanism may help calm overactive inflammatory responses while maintaining healthy immune function."
  ],
  "NF-κB pathway inhibition": [
    "The NF-κB signaling pathway is one of the body's most important regulators of inflammation, immune response, and cell survival. When chronically activated, it drives persistent inflammation linked to aging, autoimmune conditions, and metabolic disorders.",
    "Supplements targeting this mechanism may reduce chronic inflammation at the transcriptional level, where inflammatory genes are activated."
  ],
  "Pro-inflammatory cytokine reduction": [
    "Pro-inflammatory cytokines like TNF-α, IL-1β, and IL-6 are signaling molecules that amplify inflammation throughout the body. Reducing their production or activity helps calm the inflammatory cascade and prevent tissue damage.",
    "Supplements targeting this mechanism may lower systemic inflammation markers and help manage conditions driven by excessive inflammatory signaling."
  ],
  "Prostaglandin synthesis inhibition": [
    "Prostaglandins are lipid compounds produced at sites of tissue damage that cause redness, swelling, pain, and fever. Inhibiting their synthesis — typically by blocking COX enzymes — reduces these inflammatory symptoms.",
    "Supplements targeting this mechanism may provide natural pain relief and reduce inflammatory swelling."
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // HORMONAL & ENDOCRINE
  // ═══════════════════════════════════════════════════════════════════════════

  "Adaptogenic stress response": [
    "Adaptogens are compounds that help the body resist and adapt to physical, chemical, and biological stressors. They work by normalizing the stress response — dampening it when overactive and boosting it when insufficient, promoting homeostasis.",
    "Supplements targeting this mechanism may improve stress resilience, reduce fatigue, and help the body maintain equilibrium under pressure."
  ],
  "Aromatase inhibition": [
    "Aromatase is an enzyme that converts testosterone into estrogen. Inhibiting this enzyme reduces estrogen production while preserving testosterone levels, which can be relevant for hormonal balance in both men and certain conditions in women.",
    "Supplements targeting this mechanism may help maintain healthy testosterone-to-estrogen ratios, particularly in aging men."
  ],
  "Insulin sensitivity improvement": [
    "Insulin is the hormone that signals cells to absorb glucose from the blood. When cells become less sensitive to insulin (insulin resistance), blood sugar rises and the pancreas must produce more insulin. Improving sensitivity means cells respond more efficiently to normal insulin levels.",
    "Supplements targeting this mechanism may help maintain healthy blood sugar levels and reduce the metabolic burden on the pancreas."
  ],
  "Testosterone support": [
    "Testosterone is the primary male sex hormone, also important in women at lower levels. It drives muscle growth, bone density, energy levels, libido, and mood. Support involves either increasing production or reducing conversion to other hormones.",
    "Supplements targeting this mechanism may support healthy testosterone levels, which can benefit muscle mass, energy, mood, and sexual health."
  ],
  "Thyroid function support": [
    "The thyroid gland produces hormones (T3 and T4) that regulate metabolism, energy production, and body temperature throughout the body. Support involves providing essential minerals like iodine and selenium needed for thyroid hormone synthesis.",
    "Supplements targeting this mechanism may support healthy metabolic rate, energy levels, and thermoregulation."
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // METABOLIC & ENERGY
  // ═══════════════════════════════════════════════════════════════════════════

  "AMPK pathway activation": [
    "AMPK (AMP-activated protein kinase) is a cellular energy sensor that activates when energy is low. When triggered, it switches on energy-producing pathways (fat burning, glucose uptake) and switches off energy-consuming processes (fat storage, cholesterol synthesis).",
    "Supplements targeting this mechanism may promote fat metabolism, improve insulin sensitivity, and mimic some metabolic benefits of exercise."
  ],
  "Blood sugar regulation": [
    "Blood sugar regulation involves maintaining glucose levels within a healthy range through balanced insulin secretion, glucose uptake by cells, and glycogen storage and release by the liver. Dysregulation leads to energy crashes, cravings, and long-term metabolic damage.",
    "Supplements targeting this mechanism may help stabilize energy levels, reduce sugar cravings, and support healthy glucose metabolism."
  ],
  "Creatine-phosphocreatine energy shuttle": [
    "The creatine-phosphocreatine system is a rapid energy buffer in muscles and brain. Phosphocreatine donates its phosphate group to regenerate ATP instantly during intense activity — faster than any other energy system, providing immediate power for short bursts.",
    "Supplements targeting this mechanism may improve high-intensity exercise performance, support brain energy during demanding cognitive tasks, and enhance power output."
  ],
  "Fat oxidation enhancement": [
    "Fat oxidation is the process of breaking down stored fat (triglycerides) into fatty acids and then burning them in mitochondria to produce ATP energy. Enhancement means increasing the rate at which the body converts fat stores into usable energy.",
    "Supplements targeting this mechanism may support fat loss, improve endurance by sparing glycogen, and provide sustained energy."
  ],
  "Glucose uptake enhancement": [
    "Glucose uptake is the process by which cells absorb glucose from the bloodstream, primarily driven by insulin signaling and glucose transporter proteins (GLUT4). Enhancement means more efficient glucose absorption, reducing blood sugar levels and improving energy delivery to cells.",
    "Supplements targeting this mechanism may improve blood sugar control and help cells access energy more efficiently."
  ],
  "Glycogen synthesis": [
    "Glycogen is the stored form of glucose in muscles and liver, serving as a rapid energy reserve. Glycogen synthesis is the process of converting blood glucose into glycogen for later use — essential for exercise performance and blood sugar maintenance between meals.",
    "Supplements targeting this mechanism may improve muscle energy storage, support exercise recovery, and help maintain stable blood sugar."
  ],
  "Metabolic rate enhancement": [
    "Metabolic rate is the speed at which the body burns calories to maintain basic functions and activity. Enhancement increases this rate through mechanisms like thermogenesis (heat production), increased mitochondrial activity, or activation of brown fat tissue.",
    "Supplements targeting this mechanism may increase daily calorie expenditure and support weight management efforts."
  ],
  "Phosphocreatine resynthesis": [
    "After phosphocreatine donates its phosphate group to regenerate ATP during intense activity, it must be rebuilt. Faster resynthesis means quicker recovery between bursts of effort, allowing more work to be performed in less time.",
    "Supplements targeting this mechanism may improve recovery between exercise sets and support repeated high-intensity performance."
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CARDIOVASCULAR & CIRCULATORY
  // ═══════════════════════════════════════════════════════════════════════════

  "ACE inhibition": [
    "ACE (angiotensin-converting enzyme) produces angiotensin II, a powerful hormone that constricts blood vessels and raises blood pressure. Inhibiting ACE relaxes blood vessels, lowers blood pressure, and reduces the heart's workload.",
    "Supplements targeting this mechanism may support healthy blood pressure levels and cardiovascular function."
  ],
  "Cerebral blood flow enhancement": [
    "The brain depends on constant blood flow for oxygen and glucose delivery. Enhancement involves dilating cerebral blood vessels, improving blood viscosity, or increasing cardiac output to the brain, resulting in better nutrient delivery to brain tissue.",
    "Supplements targeting this mechanism may improve cognitive performance, mental clarity, and brain health through better cerebral circulation."
  ],
  "Endothelial function improvement": [
    "The endothelium is the thin cell layer lining all blood vessels, controlling vessel dilation, blood clotting, and nutrient exchange. Healthy endothelial function is essential for maintaining flexible, responsive blood vessels and preventing cardiovascular disease.",
    "Supplements targeting this mechanism may support blood vessel health, improve circulation, and reduce cardiovascular risk."
  ],
  "Nitric oxide production enhancement": [
    "Nitric oxide (NO) is a gas molecule produced by blood vessel walls that signals surrounding smooth muscle to relax, dilating blood vessels and improving blood flow. Enhanced production means better circulation, lower blood pressure, and more efficient oxygen delivery.",
    "Supplements targeting this mechanism may improve blood flow, exercise performance, and cardiovascular health."
  ],
  "Vasodilation and improved blood flow": [
    "Vasodilation is the widening of blood vessels, which reduces resistance to blood flow and lowers blood pressure. Improved blood flow delivers more oxygen and nutrients to tissues while removing waste products more efficiently.",
    "Supplements targeting this mechanism may support healthy blood pressure, enhance exercise performance, and improve tissue oxygenation."
  ],
  "Vascular health improvement": [
    "Vascular health encompasses the structural integrity, flexibility, and function of blood vessels. Improvement involves strengthening vessel walls, reducing plaque buildup, maintaining elasticity, and supporting the endothelial lining.",
    "Supplements targeting this mechanism may protect against atherosclerosis, support blood vessel flexibility, and promote long-term cardiovascular health."
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // IMMUNE MODULATION
  // ═══════════════════════════════════════════════════════════════════════════

  "Immune system modulation": [
    "The immune system must be strong enough to fight infections but controlled enough to avoid attacking the body's own tissues. Modulation involves fine-tuning this balance — enhancing defense against pathogens while preventing overactive immune responses.",
    "Supplements targeting this mechanism may support balanced immune function, helping the body fight illness without triggering excessive inflammation."
  ],
  "Immunomodulatory effects": [
    "Immunomodulators can either stimulate or suppress immune function depending on the body's needs. They may enhance the activity of natural killer cells and T-cells when fighting infection, or calm overactive immune responses during allergic or autoimmune reactions.",
    "Supplements targeting this mechanism may help regulate immune responses appropriate to the body's current needs."
  ],
  "NK cell activation": [
    "Natural killer (NK) cells are immune cells that patrol the body and destroy virus-infected cells and early cancer cells. They act quickly without needing prior exposure to a pathogen, forming a crucial first line of defense.",
    "Supplements targeting this mechanism may strengthen innate immune surveillance against infections and abnormal cells."
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // STRUCTURAL & REPAIR
  // ═══════════════════════════════════════════════════════════════════════════

  "BDNF expression increase": [
    "BDNF (brain-derived neurotrophic factor) is a protein that acts as 'fertilizer' for neurons — it promotes the growth of new neurons, strengthens existing connections, and protects brain cells from damage. Higher BDNF levels are associated with better memory, mood, and brain resilience.",
    "Supplements targeting this mechanism may support brain plasticity, protect against neurodegeneration, and improve learning and memory."
  ],
  "Collagen synthesis support": [
    "Collagen is the most abundant protein in the body, providing structural strength to skin, bones, tendons, cartilage, and blood vessels. Synthesis requires vitamin C, amino acids (proline, glycine), and trace minerals to assemble collagen fibers properly.",
    "Supplements targeting this mechanism may support skin elasticity, joint flexibility, bone strength, and connective tissue repair."
  ],
  "Nerve growth factor stimulation": [
    "Nerve growth factor (NGF) is a protein that promotes the survival, development, and maintenance of neurons. It's essential for the growth of new nerve connections and the repair of damaged neural pathways.",
    "Supplements targeting this mechanism may support nervous system repair, maintain healthy nerve function, and protect against neurodegenerative changes."
  ],
  "Neurogenesis stimulation": [
    "Neurogenesis is the creation of new neurons in the brain — once thought impossible in adults but now known to occur primarily in the hippocampus, a brain region critical for learning and memory. Stimulating this process may enhance cognitive capacity.",
    "Supplements targeting this mechanism may support the brain's ability to generate new neurons, potentially improving memory and learning in adults."
  ],
  "mTOR pathway activation for protein synthesis": [
    "mTOR (mechanistic target of rapamycin) is a master regulator of cell growth that responds to nutrient availability, especially amino acids. When activated, it initiates protein synthesis — the process of building new proteins for muscle repair, growth, and cellular maintenance.",
    "Supplements targeting this mechanism may support muscle growth, exercise recovery, and tissue repair by stimulating protein synthesis."
  ],
  "Myelin sheath maintenance": [
    "The myelin sheath is an insulating layer of fat that wraps around nerve fibers, allowing electrical signals to travel quickly and efficiently — like insulation on electrical wires. Without healthy myelin, nerve signals slow down and become unreliable.",
    "Supplements targeting this mechanism may support fast, reliable nerve signal transmission and protect against demyelinating conditions."
  ],
  "Cartilage matrix preservation": [
    "Cartilage is the smooth, shock-absorbing tissue that cushions joints. Its matrix is a complex network of collagen fibers and proteoglycans (sugar-protein complexes) that gives cartilage its resilience. Preservation means protecting this matrix from enzymatic degradation.",
    "Supplements targeting this mechanism may help maintain joint cushioning, reduce cartilage breakdown, and support long-term joint health."
  ],
  "Proteoglycan synthesis stimulation": [
    "Proteoglycans are large molecules in cartilage and connective tissue that attract and hold water, providing cushioning and lubrication. Stimulating their production helps maintain the shock-absorbing properties of joint cartilage.",
    "Supplements targeting this mechanism may support joint cushioning, flexibility, and resistance to compressive forces."
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // GUT-BRAIN AXIS
  // ═══════════════════════════════════════════════════════════════════════════

  "Gut microbiome modulation": [
    "The gut microbiome is a complex community of trillions of bacteria, fungi, and other microorganisms living in the digestive tract. Modulation means influencing this community's composition — promoting beneficial species and suppressing harmful ones — which affects digestion, immunity, mood, and metabolism.",
    "Supplements targeting this mechanism may improve digestive health, support immune function, and influence mood through the gut-brain connection."
  ],
  "Prebiotic fiber effects": [
    "Prebiotics are non-digestible fibers that selectively feed beneficial gut bacteria, helping them grow and thrive. Unlike probiotics (live bacteria), prebiotics are food for the good bacteria already in your gut, supporting their population and metabolic activity.",
    "Supplements targeting this mechanism may promote a healthier gut bacterial community and improve digestive regularity."
  ],
  "Gut barrier integrity support": [
    "The gut barrier is a single-cell-thick layer lining the intestines that must allow nutrients through while keeping bacteria and toxins out. When this barrier becomes 'leaky,' unwanted substances enter the bloodstream, triggering inflammation throughout the body.",
    "Supplements targeting this mechanism may help maintain a healthy intestinal barrier, reducing systemic inflammation caused by gut permeability."
  ],
  "Bile acid metabolism": [
    "Bile acids are produced by the liver to help digest and absorb dietary fats and fat-soluble vitamins. They also act as signaling molecules that regulate cholesterol metabolism, glucose homeostasis, and energy expenditure.",
    "Supplements targeting this mechanism may support fat digestion, cholesterol management, and metabolic regulation."
  ],
};

// ── Apply Descriptions ───────────────────────────────────────────────────────

const mechPath = path.join(__dirname, '..', 'data', 'mechanisms.js');
let src = fs.readFileSync(mechPath, 'utf8');

// Parse the JSON object from the JS file
const jsonMatch = src.match(/const mechanismDatabase = ({[\s\S]*?});/);
if (!jsonMatch) {
  console.error('Could not parse mechanismDatabase from mechanisms.js');
  process.exit(1);
}

const db = JSON.parse(jsonMatch[1]);

let filled = 0;
let skipped = 0;
let already = 0;

for (const mech of db.mechanisms) {
  // Try exact match first, then canonical name
  const desc = DESCRIPTIONS[mech.canonicalName] || DESCRIPTIONS[mech.id];

  if (desc) {
    if (!mech.summary || mech.summary.length < 10) {
      mech.summary = desc[0];
      mech.relevance = desc[1];
      filled++;
    } else {
      already++;
    }
  } else {
    // Generate a generic description based on category and name
    const name = mech.canonicalName;
    const cat = mech.category;

    // Auto-generate based on naming patterns
    let summary = '';
    let relevance = '';

    if (name.toLowerCase().includes('antioxidant')) {
      summary = `${name} involves neutralizing reactive molecules that damage cells through oxidative stress. This protective activity helps maintain cellular integrity across the body's tissues.`;
      relevance = `Supplements targeting this mechanism may provide antioxidant protection to reduce cellular damage.`;
    } else if (name.toLowerCase().includes('anti-inflammatory') || name.toLowerCase().includes('inflammation')) {
      summary = `${name} involves reducing the body's inflammatory responses, which when chronic can damage healthy tissues. This helps maintain a balanced immune state.`;
      relevance = `Supplements targeting this mechanism may help manage inflammation and associated discomfort.`;
    } else if (name.toLowerCase().includes('blood flow') || name.toLowerCase().includes('circulation') || name.toLowerCase().includes('vasodilat')) {
      summary = `${name} works by improving blood circulation, ensuring tissues receive adequate oxygen and nutrients. Better blood flow supports organ function throughout the body.`;
      relevance = `Supplements targeting this mechanism may improve tissue oxygenation and nutrient delivery.`;
    } else if (name.toLowerCase().includes('enzyme') || name.toLowerCase().includes('inhibition')) {
      summary = `${name} involves modulating specific enzyme activity to achieve a beneficial physiological effect. Enzymes are biological catalysts that control the speed of chemical reactions in the body.`;
      relevance = `Supplements targeting this mechanism may help regulate specific metabolic pathways for health benefits.`;
    } else if (name.toLowerCase().includes('synthesis') || name.toLowerCase().includes('production')) {
      summary = `${name} supports the body's ability to produce specific molecules needed for healthy function. Providing raw materials or cofactors ensures these biosynthetic pathways operate efficiently.`;
      relevance = `Supplements targeting this mechanism may ensure adequate production of important biological molecules.`;
    } else if (name.toLowerCase().includes('receptor')) {
      summary = `${name} involves influencing how cell surface receptors respond to their signaling molecules. Receptors act as molecular switches that activate or deactivate cellular responses when triggered.`;
      relevance = `Supplements targeting this mechanism may help fine-tune cellular responses to biological signals.`;
    } else if (name.toLowerCase().includes('muscle') || name.toLowerCase().includes('protein')) {
      summary = `${name} supports musculoskeletal function by influencing protein metabolism, muscle contraction, or tissue repair processes. These processes are essential for maintaining physical strength and recovery.`;
      relevance = `Supplements targeting this mechanism may support muscle function, recovery, and physical performance.`;
    } else if (name.toLowerCase().includes('immune') || name.toLowerCase().includes('antimicrobial')) {
      summary = `${name} supports the body's defense system against pathogens and abnormal cells. A well-functioning immune system identifies and eliminates threats while avoiding damage to healthy tissue.`;
      relevance = `Supplements targeting this mechanism may support immune function and resistance to infection.`;
    } else if (name.toLowerCase().includes('liver') || name.toLowerCase().includes('detox') || name.toLowerCase().includes('hepato')) {
      summary = `${name} supports the liver's ability to process and eliminate toxins, drugs, and metabolic waste products. The liver is the body's primary detoxification organ, filtering blood and neutralizing harmful substances.`;
      relevance = `Supplements targeting this mechanism may support liver health and the body's natural detoxification processes.`;
    } else if (name.toLowerCase().includes('bone') || name.toLowerCase().includes('mineral')) {
      summary = `${name} supports bone tissue health by influencing mineralization, bone cell activity, or calcium metabolism. Bones are living tissue that continuously remodel through a balance of breakdown and rebuilding.`;
      relevance = `Supplements targeting this mechanism may support bone density, strength, and healthy skeletal maintenance.`;
    } else if (name.toLowerCase().includes('insulin') || name.toLowerCase().includes('glucose') || name.toLowerCase().includes('blood sugar') || name.toLowerCase().includes('glycemic')) {
      summary = `${name} helps the body manage blood sugar levels by improving how cells respond to insulin or how glucose is processed. Healthy glucose metabolism is essential for sustained energy and metabolic health.`;
      relevance = `Supplements targeting this mechanism may support healthy blood sugar regulation and metabolic function.`;
    } else {
      // Generic fallback
      summary = `${name} is a biological process that influences health through its effects on cellular function and metabolic pathways. Understanding this mechanism helps explain how certain compounds produce their beneficial effects in the body.`;
      relevance = `Supplements targeting this mechanism may support the related physiological processes for improved health outcomes.`;
    }

    mech.summary = summary;
    mech.relevance = relevance;
    filled++;
    skipped++;
  }
}

// Write back
const header = `// Mechanism Glossary Database — Auto-generated by canvas-mechanisms.js
// ${db.mechanisms.length} canonical mechanisms consolidated from 330 raw strings
// Last generated: ${new Date().toISOString().split('T')[0]}
// Descriptions populated by populate-mechanism-descriptions.js
//
// REVIEW: Auto-generated descriptions may need editorial refinement

const mechanismDatabase = ${JSON.stringify(db, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = mechanismDatabase;
}
if (typeof window !== 'undefined') {
  window.mechanismDatabase = mechanismDatabase;
}
`;

fs.writeFileSync(mechPath, header, 'utf8');

console.log(`\n=== Description Population Complete ===`);
console.log(`Manually written: ${filled - skipped}`);
console.log(`Auto-generated from patterns: ${skipped}`);
console.log(`Already had description: ${already}`);
console.log(`Total with descriptions: ${db.mechanisms.filter(m => m.summary && m.summary.length > 10).length}/${db.mechanisms.length}`);
