document.addEventListener('DOMContentLoaded', function() {
    // Définition des unités par catégorie
    const units = {
        longueur: [
            { name: 'Millimètre (mm)', value: 0.001 },
            { name: 'Centimètre (cm)', value: 0.01 },
            { name: 'Mètre (m)', value: 1 },
            { name: 'Kilomètre (km)', value: 1000 },
            { name: 'Pouce (in)', value: 0.0254 },
            { name: 'Pied (ft)', value: 0.3048 },
            { name: 'Yard (yd)', value: 0.9144 },
            { name: 'Mile (mi)', value: 1609.34 }
        ],
        poids: [
            { name: 'Milligramme (mg)', value: 0.001 },
            { name: 'Gramme (g)', value: 1 },
            { name: 'Kilogramme (kg)', value: 1000 },
            { name: 'Tonne (t)', value: 1000000 },
            { name: 'Once (oz)', value: 28.3495 },
            { name: 'Livre (lb)', value: 453.592 }
        ],
        devise: [
            { name: 'Dirham Marocain (MAD)', value: 0.092 },
            { name: 'Euro (EUR)', value: 1 },
            { name: 'Dollar US (USD)', value: 0.92 },
            { name: 'Livre Sterling (GBP)', value: 1.17 },
            { name: 'Yen Japonais (JPY)', value: 0.0061 },
            { name: 'Franc Suisse (CHF)', value: 0.96 },
            { name: 'Dollar Canadien (CAD)', value: 0.68 }
        ],
        temperature: [
            { name: 'Celsius (°C)', value: 'C' },
            { name: 'Fahrenheit (°F)', value: 'F' },
            { name: 'Kelvin (K)', value: 'K' }
        ],
        temps: [
            { name: 'Millisecondes (ms)', value: 0.001 },
            { name: 'Secondes (s)', value: 1 },
            { name: 'Minutes (min)', value: 60 },
            { name: 'Heures (h)', value: 3600 },
            { name: 'Jours (j)', value: 86400 },
            { name: 'Semaines (sem)', value: 604800 },
            { name: 'Mois (30j)', value: 2592000 },
            { name: 'Années (365j)', value: 31536000 }
        ]
    };

    // Éléments DOM
    const tabButtons = document.querySelectorAll('.tab-btn');
    const fromUnitSelect = document.getElementById('fromUnit');
    const toUnitSelect = document.getElementById('toUnit');
    const fromValueInput = document.getElementById('fromValue');
    const toValueInput = document.getElementById('toValue');
    const swapBtn = document.getElementById('swapBtn');
    const visualization = document.getElementById('visualization');
    const formulaText = document.getElementById('formulaText');
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const modeIcons = document.querySelectorAll('.mode-icon');
    const copyBtn = document.getElementById('copyBtn');

    // Variable pour stocker la catégorie actuelle
    let currentCategory = 'longueur';

    // Gestionnaire du mode sombre
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.checked = true;
        updateModeIcons(true);
    }

    // Fonction pour mettre à jour les icônes du mode
    function updateModeIcons(isDark) {
        if (isDark) {
            modeIcons[0].style.opacity = '0.5';
            modeIcons[1].style.opacity = '1';
        } else {
            modeIcons[0].style.opacity = '1';
            modeIcons[1].style.opacity = '0.5';
        }
    }

    // Mise à jour initiale des icônes
    updateModeIcons(themeToggle.checked);

    // Gestionnaire d'événement pour le changement de thème
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            updateModeIcons(true);
        } else {
            body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
            updateModeIcons(false);
        }
        
        // Mettre à jour les visualisations avec les nouvelles couleurs du thème
        if (fromValueInput.value) {
            convert();
        }
    });

    // Initialisation
    initTabs();
    loadUnits('longueur');
    convert();
    loadHistoryFromLocalStorage();

    // Gestionnaire d'événements pour les onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            setActiveTab(this);
            loadUnits(category);
            currentCategory = category;
            convert();
            
            // Effet ripple
            addRippleEffect(this);
        });
    });

    // Event listeners
    fromUnitSelect.addEventListener('change', convert);
    toUnitSelect.addEventListener('change', convert);
    fromValueInput.addEventListener('input', convert);
    swapBtn.addEventListener('click', swapUnits);

    // Gestion du bouton de copie
    copyBtn.addEventListener('click', function() {
        const result = toValueInput.value;
        const unitText = toUnitSelect.options[toUnitSelect.selectedIndex].text;
        const textToCopy = `${result} ${unitText}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            this.innerHTML = '✅';
            this.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            setTimeout(() => {
                this.innerHTML = '📋';
                this.style.background = 'var(--accent-gradient)';
            }, 2000);
        });
    });

    // Gérer le bouton d'effacement
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            const historyList = document.getElementById('historyList');
            if (historyList) {
                historyList.innerHTML = '';
            }
            localStorage.removeItem('conversionHistory');
        });
    }

    // Gestion des modals
    setupModals();

    // Fonctions principales
    function initTabs() {
        tabButtons.forEach(button => {
            if (button.dataset.category === currentCategory) {
                button.classList.add('active');
            }
        });
    }

    function setActiveTab(activeTab) {
        tabButtons.forEach(button => button.classList.remove('active'));
        activeTab.classList.add('active');
    }

    function loadUnits(category) {
        fromUnitSelect.innerHTML = '';
        toUnitSelect.innerHTML = '';

        units[category].forEach((unit, index) => {
            const fromOption = document.createElement('option');
            fromOption.value = index;
            fromOption.textContent = unit.name;
            fromUnitSelect.appendChild(fromOption);

            const toOption = document.createElement('option');
            toOption.value = index;
            toOption.textContent = unit.name;
            toUnitSelect.appendChild(toOption);
        });

        if (fromUnitSelect.options.length > 0) {
            fromUnitSelect.selectedIndex = 0;
        }
        
        if (toUnitSelect.options.length > 1) {
            toUnitSelect.selectedIndex = 1;
        }
    }

    function convert() {
        const fromValue = parseFloat(fromValueInput.value);
        if (isNaN(fromValue)) {
            toValueInput.value = '';
            visualization.innerHTML = '';
            formulaText.textContent = '';
            return;
        }

        const fromUnitIndex = parseInt(fromUnitSelect.value);
        const toUnitIndex = parseInt(toUnitSelect.value);

        const fromUnit = units[currentCategory][fromUnitIndex];
        const toUnit = units[currentCategory][toUnitIndex];

        let result;
        let formula = '';

        if (currentCategory === 'temperature') {
            result = convertTemperature(fromValue, fromUnit.value, toUnit.value);
            formula = getTemperatureFormula(fromValue, result, fromUnit, toUnit);
        } else {
            result = (fromValue * fromUnit.value) / toUnit.value;
            formula = getStandardFormula(fromValue, result, fromUnit, toUnit);
        }

        toValueInput.value = result.toFixed(4);
        formulaText.textContent = formula;

        updateVisualization(fromValue, result, fromUnit, toUnit);
        
        const fromUnitText = fromUnitSelect.options[fromUnitSelect.selectedIndex].text.split(' ')[0];
        const toUnitText = toUnitSelect.options[toUnitSelect.selectedIndex].text.split(' ')[0];
        
        addToHistory(
            fromValueInput.value, 
            fromUnitText, 
            toValueInput.value, 
            toUnitText,
            currentCategory
        );
    }

    function convertTemperature(value, fromScale, toScale) {
        if (fromScale === toScale) return value;
        
        let celsius;
        switch(fromScale) {
            case 'C': celsius = value; break;
            case 'F': celsius = (value - 32) * 5/9; break;
            case 'K': celsius = value - 273.15; break;
        }
        
        switch(toScale) {
            case 'C': return celsius;
            case 'F': return celsius * 9/5 + 32;
            case 'K': return celsius + 273.15;
        }
    }

    function getTemperatureFormula(fromValue, result, fromUnit, toUnit) {
        switch(fromUnit.value) {
            case 'C':
                if (toUnit.value === 'F') {
                    return `${fromValue}°C × 9/5 + 32 = ${result.toFixed(2)}°F`;
                } else if (toUnit.value === 'K') {
                    return `${fromValue}°C + 273.15 = ${result.toFixed(2)}K`;
                } else {
                    return `${fromValue}°C = ${result.toFixed(2)}°C`;
                }
            case 'F':
                if (toUnit.value === 'C') {
                    return `(${fromValue}°F - 32) × 5/9 = ${result.toFixed(2)}°C`;
                } else if (toUnit.value === 'K') {
                    return `(${fromValue}°F - 32) × 5/9 + 273.15 = ${result.toFixed(2)}K`;
                } else {
                    return `${fromValue}°F = ${result.toFixed(2)}°F`;
                }
            case 'K':
                if (toUnit.value === 'C') {
                    return `${fromValue}K - 273.15 = ${result.toFixed(2)}°C`;
                } else if (toUnit.value === 'F') {
                    return `(${fromValue}K - 273.15) × 9/5 + 32 = ${result.toFixed(2)}°F`;
                } else {
                    return `${fromValue}K = ${result.toFixed(2)}K`;
                }
        }
    }

    function getStandardFormula(fromValue, result, fromUnit, toUnit) {
        const unitNameFrom = fromUnit.name.split(' ')[0];
        const unitNameTo = toUnit.name.split(' ')[0];
        
        if (fromUnit.value === toUnit.value) {
            return `${fromValue} ${unitNameFrom} = ${result.toFixed(4)} ${unitNameTo}`;
        } else {
            return `${fromValue} ${unitNameFrom} × ${fromUnit.value} ÷ ${toUnit.value} = ${result.toFixed(4)} ${unitNameTo}`;
        }
    }

    function swapUnits() {
        const tempIndex = fromUnitSelect.value;
        fromUnitSelect.value = toUnitSelect.value;
        toUnitSelect.value = tempIndex;
        convert();
    }

    function updateVisualization(fromValue, toValue, fromUnit, toUnit) {
        visualization.innerHTML = '';
        
        switch(currentCategory) {
            case 'longueur':
                createLengthVisualization(fromValue, toValue, fromUnit, toUnit);
                break;
            case 'poids':
                createWeightVisualization(fromValue, toValue, fromUnit, toUnit);
                break;
            case 'devise':
                createCurrencyVisualization(fromValue, toValue, fromUnit, toUnit);
                break;
            case 'temperature':
                createTemperatureVisualization(fromValue, toValue, fromUnit, toUnit);
                break;
            case 'temps':
                createTimeVisualization(fromValue, toValue, fromUnit, toUnit);
                break;
        }
    }

    // Visualisations
    function createLengthVisualization(fromValue, toValue, fromUnit, toUnit) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = 'space-around';
        container.style.alignItems = 'center';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.padding = '20px';

        // Première barre
        const fromBar = document.createElement('div');
        fromBar.className = 'length-bar';
        fromBar.style.width = '200px';
        fromBar.innerHTML = `<div class="length-label">${fromValue} ${fromUnit.name.split(' ')[0]}</div>`;

        // Deuxième barre
        const toBar = document.createElement('div');
        toBar.className = 'length-bar';
        const ratio = (fromValue * fromUnit.value) / (toValue * toUnit.value);
        const toWidth = Math.min(300, Math.max(50, 200 / ratio));
        toBar.style.width = `${toWidth}px`;
        toBar.innerHTML = `<div class="length-label">${toValue.toFixed(2)} ${toUnit.name.split(' ')[0]}</div>`;

        container.appendChild(fromBar);
        container.appendChild(toBar);
        visualization.appendChild(container);
    }

    function createWeightVisualization(fromValue, toValue, fromUnit, toUnit) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'relative';

        // Structure principale de la balance moderne
        const balanceStructure = document.createElement('div');
        balanceStructure.style.position = 'relative';
        balanceStructure.style.width = '400px';
        balanceStructure.style.height = '200px';

        // Calculer l'inclinaison
        const fromWeight = fromValue * fromUnit.value;
        const toWeight = toValue * toUnit.value;
        const ratio = fromWeight / toWeight;
        const angle = Math.min(12, Math.max(-12, 6 * Math.log2(ratio)));

        // Base elliptique (gris bleu)
        const base = document.createElement('div');
        base.style.width = '140px';
        base.style.height = '30px';
        base.style.background = 'linear-gradient(135deg, #5D6D7E, #4A5568)';
        base.style.borderRadius = '70px';
        base.style.position = 'absolute';
        base.style.left = '50%';
        base.style.bottom = '10px';
        base.style.transform = 'translateX(-50%)';
        base.style.boxShadow = '0 6px 20px rgba(77, 85, 104, 0.4)';

        // Support principal (bleu marine)
        const mainSupport = document.createElement('div');
        mainSupport.style.width = '50px';
        mainSupport.style.height = '90px';
        mainSupport.style.background = 'linear-gradient(135deg, #2E4057, #3D5A80)';
        mainSupport.style.borderRadius = '25px 25px 10px 10px';
        mainSupport.style.position = 'absolute';
        mainSupport.style.left = '50%';
        mainSupport.style.bottom = '40px';
        mainSupport.style.transform = 'translateX(-50%)';
        mainSupport.style.boxShadow = '0 4px 15px rgba(46, 64, 87, 0.3)';

        // Partie haute du support (bleu plus clair)
        const topSupport = document.createElement('div');
        topSupport.style.width = '35px';
        topSupport.style.height = '25px';
        topSupport.style.background = 'linear-gradient(135deg, #3D5A80, #4A90E2)';
        topSupport.style.borderRadius = '17px';
        topSupport.style.position = 'absolute';
        topSupport.style.left = '50%';
        topSupport.style.top = '55px';
        topSupport.style.transform = 'translateX(-50%)';
        topSupport.style.boxShadow = '0 3px 10px rgba(61, 90, 128, 0.3)';

        // Barre principale (gris clair)
        const mainBeam = document.createElement('div');
        mainBeam.style.width = '300px';
        mainBeam.style.height = '6px';
        mainBeam.style.background = 'linear-gradient(135deg, #E5E7EB, #D1D5DB)';
        mainBeam.style.borderRadius = '3px';
        mainBeam.style.position = 'absolute';
        mainBeam.style.left = '50%';
        mainBeam.style.top = '67px';
        mainBeam.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        mainBeam.style.transformOrigin = 'center';
        mainBeam.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        mainBeam.style.boxShadow = '0 2px 6px rgba(209, 213, 219, 0.4)';

        // Point de pivot central (orange doré)
        const pivot = document.createElement('div');
        pivot.style.width = '18px';
        pivot.style.height = '18px';
        pivot.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
        pivot.style.borderRadius = '50%';
        pivot.style.position = 'absolute';
        pivot.style.left = '50%';
        pivot.style.top = '61px';
        pivot.style.transform = 'translateX(-50%)';
        pivot.style.boxShadow = '0 3px 8px rgba(245, 158, 11, 0.4)';
        pivot.style.border = '2px solid #92400E';
        pivot.style.zIndex = '10';

        // Connexion plateau gauche (orange)
        const leftConnection = document.createElement('div');
        leftConnection.style.width = '14px';
        leftConnection.style.height = '14px';
        leftConnection.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
        leftConnection.style.borderRadius = '50%';
        leftConnection.style.position = 'absolute';
        leftConnection.style.left = '65px';
        leftConnection.style.top = `${67 + angle * 1.5}px`;
        leftConnection.style.boxShadow = '0 2px 6px rgba(245, 158, 11, 0.4)';
        leftConnection.style.transition = 'top 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        leftConnection.style.border = '1px solid #92400E';

        // Connexion plateau droit (orange)
        const rightConnection = document.createElement('div');
        rightConnection.style.width = '14px';
        rightConnection.style.height = '14px';
        rightConnection.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
        rightConnection.style.borderRadius = '50%';
        rightConnection.style.position = 'absolute';
        rightConnection.style.right = '65px';
        rightConnection.style.top = `${67 - angle * 1.5}px`;
        rightConnection.style.boxShadow = '0 2px 6px rgba(245, 158, 11, 0.4)';
        rightConnection.style.transition = 'top 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        rightConnection.style.border = '1px solid #92400E';

        // Plateau gauche (jaune doré)
        const leftPlate = document.createElement('div');
        leftPlate.style.width = '100px';
        leftPlate.style.height = '25px';
        leftPlate.style.background = 'linear-gradient(135deg, #FCD34D, #F59E0B)';
        leftPlate.style.borderRadius = '50px';
        leftPlate.style.position = 'absolute';
        leftPlate.style.left = '15px';
        leftPlate.style.top = `${85 + angle * 3}px`;
        leftPlate.style.boxShadow = '0 8px 25px rgba(252, 211, 77, 0.4)';
        leftPlate.style.transition = 'top 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        leftPlate.style.border = '3px solid #D97706';

        // Effet de brillance sur le plateau gauche
        const leftShine = document.createElement('div');
        leftShine.style.width = '60px';
        leftShine.style.height = '8px';
        leftShine.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)';
        leftShine.style.borderRadius = '4px';
        leftShine.style.position = 'absolute';
        leftShine.style.top = '6px';
        leftShine.style.left = '20px';
        leftPlate.appendChild(leftShine);

        // Plateau droit (jaune doré)
        const rightPlate = document.createElement('div');
        rightPlate.style.width = '100px';
        rightPlate.style.height = '25px';
        rightPlate.style.background = 'linear-gradient(135deg, #FCD34D, #F59E0B)';
        rightPlate.style.borderRadius = '50px';
        rightPlate.style.position = 'absolute';
        rightPlate.style.right = '15px';
        rightPlate.style.top = `${85 - angle * 3}px`;
        rightPlate.style.boxShadow = '0 8px 25px rgba(252, 211, 77, 0.4)';
        rightPlate.style.transition = 'top 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        rightPlate.style.border = '3px solid #D97706';

        // Effet de brillance sur le plateau droit
        const rightShine = document.createElement('div');
        rightShine.style.width = '60px';
        rightShine.style.height = '8px';
        rightShine.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)';
        rightShine.style.borderRadius = '4px';
        rightShine.style.position = 'absolute';
        rightShine.style.top = '6px';
        rightShine.style.left = '20px';
        rightPlate.appendChild(rightShine);

        // Labels au-dessus des plateaux
        const leftLabel = document.createElement('div');
        leftLabel.style.position = 'absolute';
        leftLabel.style.left = '15px';
        leftLabel.style.top = `${55 + angle * 3}px`;
        leftLabel.style.width = '100px';
        leftLabel.style.textAlign = 'center';
        leftLabel.style.color = 'var(--text-light)';
        leftLabel.style.fontWeight = '700';
        leftLabel.style.fontSize = '0.95rem';
        leftLabel.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
        leftLabel.style.transition = 'top 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        leftLabel.innerHTML = `
            <div style="margin-bottom: 3px; color: #FCD34D;">${fromValue}</div>
            <div style="font-size: 0.8rem; font-weight: 600; opacity: 0.9;">${fromUnit.name.split(' ')[0]}</div>
        `;

        const rightLabel = document.createElement('div');
        rightLabel.style.position = 'absolute';
        rightLabel.style.right = '15px';
        rightLabel.style.top = `${55 - angle * 3}px`;
        rightLabel.style.width = '100px';
        rightLabel.style.textAlign = 'center';
        rightLabel.style.color = 'var(--text-light)';
        rightLabel.style.fontWeight = '700';
        rightLabel.style.fontSize = '0.95rem';
        rightLabel.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
        rightLabel.style.transition = 'top 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        rightLabel.innerHTML = `
            <div style="margin-bottom: 3px; color: #FCD34D;">${toValue.toFixed(3)}</div>
            <div style="font-size: 0.8rem; font-weight: 600; opacity: 0.9;">${toUnit.name.split(' ')[0]}</div>
        `;

        // Assemblage de la balance moderne
        balanceStructure.appendChild(base);
        balanceStructure.appendChild(mainSupport);
        balanceStructure.appendChild(topSupport);
        balanceStructure.appendChild(mainBeam);
        balanceStructure.appendChild(pivot);
        balanceStructure.appendChild(leftConnection);
        balanceStructure.appendChild(rightConnection);
        balanceStructure.appendChild(leftPlate);
        balanceStructure.appendChild(rightPlate);
        balanceStructure.appendChild(leftLabel);
        balanceStructure.appendChild(rightLabel);

        container.appendChild(balanceStructure);
        visualization.appendChild(container);
    }

    function createCurrencyVisualization(fromValue, toValue, fromUnit, toUnit) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = 'space-around';
        container.style.alignItems = 'center';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.padding = '20px';
        
        // Premier groupe de devises
        const fromCurrencyContainer = document.createElement('div');
        fromCurrencyContainer.style.display = 'flex';
        fromCurrencyContainer.style.flexDirection = 'column';
        fromCurrencyContainer.style.alignItems = 'center';
        fromCurrencyContainer.style.gap = '10px';

        const fromStack = document.createElement('div');
        fromStack.className = 'currency-stack';
        fromStack.style.display = 'flex';
        fromStack.style.flexWrap = 'wrap';
        fromStack.style.justifyContent = 'center';
        fromStack.style.maxWidth = '120px';
        
        const fromLabel = document.createElement('div');
        fromLabel.className = 'currency-label';
        fromLabel.textContent = `${fromValue} ${fromUnit.name.split(' ')[0]}`;
        fromLabel.style.marginBottom = '10px';
        
        const fromMoney = createMoneyElements(fromValue, fromUnit.name.split(' ')[0]);
        fromMoney.forEach(element => fromStack.appendChild(element));
        
        fromCurrencyContainer.appendChild(fromLabel);
        fromCurrencyContainer.appendChild(fromStack);
        
        // Deuxième groupe de devises
        const toCurrencyContainer = document.createElement('div');
        toCurrencyContainer.style.display = 'flex';
        toCurrencyContainer.style.flexDirection = 'column';
        toCurrencyContainer.style.alignItems = 'center';
        toCurrencyContainer.style.gap = '10px';

        const toStack = document.createElement('div');
        toStack.className = 'currency-stack';
        toStack.style.display = 'flex';
        toStack.style.flexWrap = 'wrap';
        toStack.style.justifyContent = 'center';
        toStack.style.maxWidth = '120px';
        
        const toLabel = document.createElement('div');
        toLabel.className = 'currency-label';
        toLabel.textContent = `${toValue.toFixed(2)} ${toUnit.name.split(' ')[0]}`;
        toLabel.style.marginBottom = '10px';
        
        const toMoney = createMoneyElements(toValue, toUnit.name.split(' ')[0]);
        toMoney.forEach(element => toStack.appendChild(element));
        
        toCurrencyContainer.appendChild(toLabel);
        toCurrencyContainer.appendChild(toStack);
        
        container.appendChild(fromCurrencyContainer);
        container.appendChild(toCurrencyContainer);
        visualization.appendChild(container);
    }
    
    function createMoneyElements(value, currencyCode) {
        const elements = [];
        let remainingValue = value;
        
        if (remainingValue >= 5) {
            const billCount = Math.min(5, Math.floor(remainingValue / 5));
            for (let i = 0; i < billCount; i++) {
                const bill = document.createElement('div');
                bill.className = 'bill';
                
                switch(currencyCode) {
                    case 'EUR': bill.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)'; break;
                    case 'USD': bill.style.background = 'linear-gradient(45deg, #16a085, #1abc9c)'; break;
                    case 'GBP': bill.style.background = 'linear-gradient(45deg, #8e44ad, #9b59b6)'; break;
                    case 'MAD': bill.style.background = 'linear-gradient(45deg, #d35400, #e67e22)'; break;
                    default: bill.style.background = 'linear-gradient(45deg, #2980b9, #3498db)';
                }
                
                bill.textContent = `5 ${currencyCode}`;
                elements.push(bill);
                remainingValue -= 5;
            }
        }
        
        const coinCount = Math.min(10, Math.ceil(remainingValue));
        for (let i = 0; i < coinCount; i++) {
            const coin = document.createElement('div');
            coin.className = 'coin';
            
            switch(currencyCode) {
                case 'EUR': coin.style.background = 'linear-gradient(45deg, #f1c40f, #f39c12)'; break;
                case 'USD': coin.style.background = 'linear-gradient(45deg, #7f8c8d, #95a5a6)'; break;
                case 'GBP': coin.style.background = 'linear-gradient(45deg, #c0392b, #e74c3c)'; break;
                case 'MAD': coin.style.background = 'linear-gradient(45deg, #d35400, #e67e22)'; break;
                default: coin.style.background = 'linear-gradient(45deg, #bdc3c7, #ecf0f1)';
            }
            
            elements.push(coin);
        }
        
        return elements;
    }

    function createTemperatureVisualization(fromValue, toValue, fromUnit, toUnit) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = 'space-around';
        container.style.alignItems = 'center';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.padding = '20px';
        
        function createThermometer(value, unit) {
            const thermometerContainer = document.createElement('div');
            thermometerContainer.style.display = 'flex';
            thermometerContainer.style.flexDirection = 'column';
            thermometerContainer.style.alignItems = 'center';
            thermometerContainer.style.gap = '15px';
            
            const thermometer = document.createElement('div');
            thermometer.className = 'thermometer';
            
            const thermometerBulb = document.createElement('div');
            thermometerBulb.className = 'thermometer-bulb';
            thermometer.appendChild(thermometerBulb);
            
            const thermometerFill = document.createElement('div');
            thermometerFill.className = 'thermometer-fill';
            
            let celsiusValue;
            switch (unit.value) {
                case 'C': celsiusValue = value; break;
                case 'F': celsiusValue = (value - 32) * 5/9; break;
                case 'K': celsiusValue = value - 273.15; break;
            }
            
            // Calculer la hauteur de remplissage basée sur la température
            const fillHeight = Math.max(10, Math.min(90, ((celsiusValue + 50) / 200) * 80 + 10));
            thermometerFill.style.height = `${fillHeight}%`;
            
            // Changer la couleur selon la température
            if (celsiusValue < 0) {
                thermometerFill.style.background = 'linear-gradient(0deg, #3498db, #2980b9)'; // Bleu pour froid
            } else if (celsiusValue < 30) {
                thermometerFill.style.background = 'linear-gradient(0deg, #2ecc71, #27ae60)'; // Vert pour tempéré
            } else {
                thermometerFill.style.background = 'linear-gradient(0deg, #e74c3c, #c0392b)'; // Rouge pour chaud
            }
            
            thermometer.appendChild(thermometerFill);
            
            const thermometerLabel = document.createElement('div');
            thermometerLabel.className = 'temperature-label';
            thermometerLabel.textContent = `${value.toFixed(1)} ${unit.name.split(' ')[0]}`;
            thermometerLabel.style.textAlign = 'center';
            thermometerLabel.style.fontWeight = '600';
            thermometerLabel.style.color = 'var(--text-light)';
            
            thermometerContainer.appendChild(thermometer);
            thermometerContainer.appendChild(thermometerLabel);
            
            return thermometerContainer;
        }
        
        container.appendChild(createThermometer(fromValue, fromUnit));
        container.appendChild(createThermometer(toValue, toUnit));
        visualization.appendChild(container);
    }

    function createTimeVisualization(fromValue, toValue, fromUnit, toUnit) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = 'space-around';
        container.style.alignItems = 'center';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.padding = '20px';
        
        function createClock(value, unit) {
            const clockContainer = document.createElement('div');
            clockContainer.style.display = 'flex';
            clockContainer.style.flexDirection = 'column';
            clockContainer.style.alignItems = 'center';
            clockContainer.style.gap = '15px';
            
            const clock = document.createElement('div');
            clock.className = 'clock';
            
            const clockCenter = document.createElement('div');
            clockCenter.className = 'clock-center';
            clock.appendChild(clockCenter);
            
            const hourHand = document.createElement('div');
            hourHand.className = 'clock-hand hour-hand';
            
            const minuteHand = document.createElement('div');
            minuteHand.className = 'clock-hand minute-hand';
            
            // Calculer la position des aiguilles basée sur la valeur temporelle
            const timeInSeconds = value * unit.value;
            const timeInHours = timeInSeconds / 3600;
            
            // Position des aiguilles
            const hourAngle = (timeInHours % 12) * 30; // 30 degrés par heure
            const minuteAngle = ((timeInHours % 1) * 60) * 6; // 6 degrés par minute
            
            hourHand.style.transform = `rotate(${hourAngle}deg)`;
            minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
            
            // Changer la couleur des aiguilles selon l'unité de temps
            if (unit.value < 60) { // Secondes et millisecondes
                hourHand.style.background = '#e74c3c';
                minuteHand.style.background = '#e74c3c';
            } else if (unit.value < 3600) { // Minutes
                hourHand.style.background = '#f39c12';
                minuteHand.style.background = '#f39c12';
            } else { // Heures et plus
                hourHand.style.background = '#2ecc71';
                minuteHand.style.background = '#2ecc71';
            }
            
            clock.appendChild(hourHand);
            clock.appendChild(minuteHand);
            
            const label = document.createElement('div');
            label.className = 'time-label';
            label.textContent = `${value} ${unit.name.split(' ')[0]}`;
            label.style.textAlign = 'center';
            label.style.fontWeight = '600';
            label.style.color = 'var(--text-light)';
            
            clockContainer.appendChild(clock);
            clockContainer.appendChild(label);
            
            return clockContainer;
        }
        
        container.appendChild(createClock(fromValue, fromUnit));
        container.appendChild(createClock(toValue, toUnit));
        visualization.appendChild(container);
    }

    // Fonctions utilitaires
    function addRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255,255,255,0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        ripple.style.marginLeft = '-50px';
        ripple.style.marginTop = '-50px';
        
        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    function setupModals() {
        const aboutBtn = document.getElementById('aboutBtn');
        const aboutModal = document.getElementById('aboutModal');
        const contactBtn = document.getElementById('contactBtn');
        const contactModal = document.getElementById('contactModal');
        const closeModals = document.querySelectorAll('.close-modal');

        if (aboutBtn && aboutModal) {
            aboutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                aboutModal.style.display = 'block';
            });
        }

        if (contactBtn && contactModal) {
            contactBtn.addEventListener('click', function(e) {
                e.preventDefault();
                contactModal.style.display = 'block';
            });
        }

        closeModals.forEach(btn => {
            btn.addEventListener('click', function() {
                if (aboutModal) aboutModal.style.display = 'none';
                if (contactModal) contactModal.style.display = 'none';
            });
        });

        window.addEventListener('click', function(e) {
            if (e.target === aboutModal) {
                aboutModal.style.display = 'none';
            }
            if (e.target === contactModal) {
                contactModal.style.display = 'none';
            }
        });
    }

    // Historique
    function addToHistory(fromValue, fromUnitText, toValue, toUnitText, category) {
        if (isNaN(parseFloat(fromValue))) {
            return;
        }
        
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const historyText = document.createElement('div');
        historyText.className = 'history-text';
        historyText.textContent = `${fromValue} ${fromUnitText} = ${toValue} ${toUnitText} (${category})`;
        
        const reuseBtn = document.createElement('button');
        reuseBtn.className = 'reuse-btn';
        reuseBtn.textContent = 'Réutiliser';
        reuseBtn.dataset.from = fromValue;
        reuseBtn.dataset.fromUnit = fromUnitSelect.value;
        reuseBtn.dataset.toUnit = toUnitSelect.value;
        reuseBtn.dataset.category = currentCategory;
        
        reuseBtn.addEventListener('click', function() {
            if (this.dataset.category !== currentCategory) {
                const targetTab = document.querySelector(`.tab-btn[data-category="${this.dataset.category}"]`);
                if (targetTab) targetTab.click();
            }
            
            fromValueInput.value = this.dataset.from;
            fromUnitSelect.value = this.dataset.fromUnit;
            toUnitSelect.value = this.dataset.toUnit;
            convert();
        });
        
        historyItem.appendChild(historyText);
        historyItem.appendChild(reuseBtn);
        
        let isDuplicate = false;
        Array.from(historyList.children).forEach(item => {
            const itemText = item.querySelector('.history-text').textContent;
            if (itemText === historyText.textContent) {
                isDuplicate = true;
                historyList.insertBefore(item, historyList.firstChild);
            }
        });
        
        if (!isDuplicate) {
            historyList.insertBefore(historyItem, historyList.firstChild);
            
            if (historyList.children.length > 10) {
                historyList.removeChild(historyList.lastChild);
            }
            
            saveHistoryToLocalStorage();
        }
    }

    function saveHistoryToLocalStorage() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        const historyItems = [];
        
        for (let i = 0; i < historyList.children.length; i++) {
            const item = historyList.children[i];
            const btn = item.querySelector('.reuse-btn');
            
            historyItems.push({
                text: item.querySelector('.history-text').textContent,
                from: btn.dataset.from,
                fromUnit: btn.dataset.fromUnit,
                toUnit: btn.dataset.toUnit,
                category: btn.dataset.category
            });
        }
        
        localStorage.setItem('conversionHistory', JSON.stringify(historyItems));
    }

    function loadHistoryFromLocalStorage() {
        const savedHistory = localStorage.getItem('conversionHistory');
        const historyList = document.getElementById('historyList');
        
        if (savedHistory && historyList) {
            const historyItems = JSON.parse(savedHistory);
            historyList.innerHTML = '';
            
            historyItems.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                const historyText = document.createElement('div');
                historyText.className = 'history-text';
                historyText.textContent = item.text;
                
                const reuseBtn = document.createElement('button');
                reuseBtn.className = 'reuse-btn';
                reuseBtn.textContent = 'Réutiliser';
                reuseBtn.dataset.from = item.from;
                reuseBtn.dataset.fromUnit = item.fromUnit;
                reuseBtn.dataset.toUnit = item.toUnit;
                reuseBtn.dataset.category = item.category;
                
                reuseBtn.addEventListener('click', function() {
                    if (this.dataset.category !== currentCategory) {
                        const targetTab = document.querySelector(`.tab-btn[data-category="${this.dataset.category}"]`);
                        if (targetTab) targetTab.click();
                    }
                    
                    fromValueInput.value = this.dataset.from;
                    fromUnitSelect.value = this.dataset.fromUnit;
                    toUnitSelect.value = this.dataset.toUnit;
                    convert();
                });
                
                historyItem.appendChild(historyText);
                historyItem.appendChild(reuseBtn);
                historyList.appendChild(historyItem);
            });
        }
    }

    // Ajouter les styles CSS pour l'animation ripple
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        /* Styles supplémentaires pour les visualisations */
        .weight-balance {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
        }
        
        .weight-scale {
            width: 80px;
            height: 60px;
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            border-radius: 10px;
            position: absolute;
            top: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
            transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .weight-scale.left {
            left: 20px;
        }
        
        .weight-scale.right {
            right: 20px;
        }
        
        .bill {
            width: 80px;
            height: 40px;
            background: var(--accent-gradient);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.8rem;
            box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
            margin: 2px;
            animation: billFloat 2s ease-in-out infinite;
        }
        
        .coin {
            width: 40px;
            height: 40px;
            background: var(--secondary-gradient);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.7rem;
            box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
            margin: 2px;
            animation: coinSpin 3s linear infinite;
        }
        
        @keyframes billFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
        
        @keyframes coinSpin {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(360deg); }
        }
        
        .thermometer {
            width: 40px;
            height: 150px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px 20px 25px 25px;
            position: relative;
            border: 2px solid var(--border-light);
            overflow: hidden;
        }
        
        .thermometer-bulb {
            width: 50px;
            height: 50px;
            background: var(--accent-gradient);
            border-radius: 50%;
            position: absolute;
            bottom: -15px;
            left: -5px;
            box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
        }
        
        .thermometer-fill {
            width: 30px;
            height: 60%;
            background: var(--accent-gradient);
            position: absolute;
            bottom: 10px;
            left: 5px;
            border-radius: 15px 15px 0 0;
            transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .clock {
            width: 100px;
            height: 100px;
            border: 4px solid var(--accent-gradient);
            border-radius: 50%;
            position: relative;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .clock-center {
            width: 12px;
            height: 12px;
            background: var(--accent-gradient);
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 3;
        }
        
        .clock-hand {
            position: absolute;
            background: var(--text-light);
            transform-origin: bottom center;
            border-radius: 2px;
        }
        
        .hour-hand {
            width: 4px;
            height: 30px;
            top: 20px;
            left: 48px;
        }
        
        .minute-hand {
            width: 3px;
            height: 40px;
            top: 10px;
            left: 48.5px;
        }
    `;
    document.head.appendChild(style);
});