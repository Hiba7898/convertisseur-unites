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
    // Vérifier si un thème est déjà stocké
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
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            updateModeIcons(true);
        } else {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
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

    // Gestionnaire d'événements
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            setActiveTab(this);
            loadUnits(category);
            currentCategory = category;
            convert();
        });
    });

    fromUnitSelect.addEventListener('change', convert);
    toUnitSelect.addEventListener('change', convert);
    fromValueInput.addEventListener('input', convert);
    swapBtn.addEventListener('click', swapUnits);

    // Gestion du bouton de copie
    copyBtn.addEventListener('click', function() {
        const result = document.getElementById('toValue');
        const unitText = toUnitSelect.options[toUnitSelect.selectedIndex].text;
        
        // Créer un texte formaté avec la valeur et l'unité
        const textToCopy = `${result.value} ${unitText}`;
        
        // Copier dans le presse-papiers
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Animation de confirmation
            copyBtn.innerHTML = '<i class="copy-icon">✓</i>';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="copy-icon">📋</i>';
            }, 2000);
        });
    });

    // Gérer le bouton d'effacement
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    clearHistoryBtn.addEventListener('click', function() {
        document.getElementById('historyList').innerHTML = '';
        localStorage.removeItem('conversionHistory');
    });

    // Pour les modals
    const aboutBtn = document.getElementById('aboutBtn');
    const aboutModal = document.getElementById('aboutModal');
    const contactBtn = document.getElementById('contactBtn');
    const contactModal = document.getElementById('contactModal');
    const closeModals = document.querySelectorAll('.close-modal');

    // Gestionnaire pour ouvrir le modal "À propos"
    aboutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        aboutModal.style.display = 'block';
    });

    // Gestionnaire pour ouvrir le modal "Contact"
    contactBtn.addEventListener('click', function(e) {
        e.preventDefault();
        contactModal.style.display = 'block';
    });

    // Gestionnaire pour fermer tous les modals avec le bouton X
    closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            aboutModal.style.display = 'none';
            contactModal.style.display = 'none';
        });
    });

    // Gestionnaire pour fermer les modals en cliquant en dehors
    window.addEventListener('click', function(e) {
        if (e.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
        if (e.target === contactModal) {
            contactModal.style.display = 'none';
        }
    });

    // Fonctions
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
        // Vider les sélecteurs
        fromUnitSelect.innerHTML = '';
        toUnitSelect.innerHTML = '';

        // Remplir avec les nouvelles unités
        units[category].forEach(unit => {
            const fromOption = document.createElement('option');
            fromOption.value = units[category].indexOf(unit);
            fromOption.textContent = unit.name;
            fromUnitSelect.appendChild(fromOption);

            const toOption = document.createElement('option');
            toOption.value = units[category].indexOf(unit);
            toOption.textContent = unit.name;
            toUnitSelect.appendChild(toOption);
        });

        // Définir des valeurs par défaut différentes
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
            // Conversion de température
            result = convertTemperature(fromValue, fromUnit.value, toUnit.value);
            
            // Formule pour la température
            switch(fromUnit.value) {
                case 'C':
                    if (toUnit.value === 'F') {
                        formula = `${fromValue}°C × 9/5 + 32 = ${result.toFixed(2)}°F`;
                    } else if (toUnit.value === 'K') {
                        formula = `${fromValue}°C + 273.15 = ${result.toFixed(2)}K`;
                    } else {
                        formula = `${fromValue}°C = ${result.toFixed(2)}°C`;
                    }
                    break;
                case 'F':
                    if (toUnit.value === 'C') {
                        formula = `(${fromValue}°F - 32) × 5/9 = ${result.toFixed(2)}°C`;
                    } else if (toUnit.value === 'K') {
                        formula = `(${fromValue}°F - 32) × 5/9 + 273.15 = ${result.toFixed(2)}K`;
                    } else {
                        formula = `${fromValue}°F = ${result.toFixed(2)}°F`;
                    }
                    break;
                case 'K':
                    if (toUnit.value === 'C') {
                        formula = `${fromValue}K - 273.15 = ${result.toFixed(2)}°C`;
                    } else if (toUnit.value === 'F') {
                        formula = `(${fromValue}K - 273.15) × 9/5 + 32 = ${result.toFixed(2)}°F`;
                    } else {
                        formula = `${fromValue}K = ${result.toFixed(2)}K`;
                    }
                    break;
            }
        } else {
            // Conversion standard
            result = (fromValue * fromUnit.value) / toUnit.value;
            
            // Format de la formule
            const unitNameFrom = fromUnit.name.split(' ')[0];
            const unitNameTo = toUnit.name.split(' ')[0];
            
            if (fromUnit.value === toUnit.value) {
                formula = `${fromValue} ${unitNameFrom} = ${result.toFixed(4)} ${unitNameTo}`;
            } else {
                formula = `${fromValue} ${unitNameFrom} × ${fromUnit.value} ÷ ${toUnit.value} = ${result.toFixed(4)} ${unitNameTo}`;
            }
        }

        toValueInput.value = result.toFixed(4);
        formulaText.textContent = formula;

        // Mise à jour de la visualisation
        updateVisualization(fromValue, result, fromUnit, toUnit);
        
        // Ajouter à l'historique seulement si la valeur d'entrée est valide
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
        
        // Conversion en Celsius comme intermédiaire
        let celsius;
        
        switch(fromScale) {
            case 'C': celsius = value; break;
            case 'F': celsius = (value - 32) * 5/9; break;
            case 'K': celsius = value - 273.15; break;
        }
        
        // Conversion de Celsius vers l'échelle cible
        switch(toScale) {
            case 'C': return celsius;
            case 'F': return celsius * 9/5 + 32;
            case 'K': return celsius + 273.15;
        }
    }

    function swapUnits() {
        const tempIndex = fromUnitSelect.value;
        fromUnitSelect.value = toUnitSelect.value;
        toUnitSelect.value = tempIndex;
        convert();
    }

    function updateVisualization(fromValue, toValue, fromUnit, toUnit) {
        // Vider la visualisation
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

    function createLengthVisualization(fromValue, toValue, fromUnit, toUnit) {
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.height = '100%';
        container.style.padding = '20px';
        
        // Calculer la largeur maximale disponible
        const maxWidth = 600;
        
        // Première barre
        const fromBarContainer = document.createElement('div');
        fromBarContainer.style.width = '100%';
        fromBarContainer.style.position = 'relative';
        fromBarContainer.style.marginBottom = '40px';
        
        const fromBar = document.createElement('div');
        fromBar.className = 'length-bar';
        
        // Limiter la largeur pour les valeurs extrêmes
        const fromWidthPercent = Math.min(90, Math.max(10, 50));
        fromBar.style.width = `${fromWidthPercent}%`;
        
        const fromLabel = document.createElement('div');
        fromLabel.className = 'length-label';
        fromLabel.textContent = `${fromValue} ${fromUnit.name.split(' ')[0]}`;
        fromLabel.style.left = '0';
        fromBar.appendChild(fromLabel);
        
        fromBarContainer.appendChild(fromBar);
        
        // Deuxième barre
        const toBarContainer = document.createElement('div');
        toBarContainer.style.width = '100%';
        toBarContainer.style.position = 'relative';
        
        const toBar = document.createElement('div');
        toBar.className = 'length-bar';
        
        // Calculer la largeur relative de la deuxième barre
        const ratio = (fromValue * fromUnit.value) / (toValue * toUnit.value);
        const toWidthPercent = Math.min(90, Math.max(10, fromWidthPercent / ratio));
        toBar.style.width = `${toWidthPercent}%`;
        
        const toLabel = document.createElement('div');
        toLabel.className = 'length-label';
        toLabel.textContent = `${toValue.toFixed(2)} ${toUnit.name.split(' ')[0]}`;
        toLabel.style.left = '0';
        toBar.appendChild(toLabel);
        
        toBarContainer.appendChild(toBar);
        
        container.appendChild(fromBarContainer);
        container.appendChild(toBarContainer);
        visualization.appendChild(container);
    }

    function createWeightVisualization(fromValue, toValue, fromUnit, toUnit) {
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        
        // Création de la balance
        const balanceContainer = document.createElement('div');
        balanceContainer.className = 'weight-balance';
        
        // Support central
        const balanceStand = document.createElement('div');
        balanceStand.className = 'balance-stand';
        
        // Barre de la balance
        const balanceBeam = document.createElement('div');
        balanceBeam.className = 'balance-beam';
        
        // Conversion en valeurs de base (g ou kg) pour comparaison
        const fromValueBase = fromValue * fromUnit.value;
        const toValueBase = toValue * toUnit.value;
        
        // Calculer l'angle de rotation de la balance (limité à +/- 20 degrés)
        const balanceRatio = fromValueBase / toValueBase;
        const angle = Math.min(20, Math.max(-20, 10 * Math.log2(balanceRatio)));
        balanceBeam.style.transform = `rotate(${angle}deg)`;
        
        // Premier plateau (gauche)
        const leftScale = document.createElement('div');
        leftScale.className = 'weight-scale left';
        leftScale.style.transform = `translateY(${angle}px)`;
        
        const leftLabel = document.createElement('div');
        leftLabel.className = 'weight-label';
        leftLabel.textContent = `${fromValue} ${fromUnit.name.split(' ')[0]}`;
        leftScale.appendChild(leftLabel);
        
        // Deuxième plateau (droite)
        const rightScale = document.createElement('div');
        rightScale.className = 'weight-scale right';
        rightScale.style.transform = `translateY(${-angle}px)`;
        
        const rightLabel = document.createElement('div');
        rightLabel.className = 'weight-label';
        rightLabel.textContent = `${toValue.toFixed(2)} ${toUnit.name.split(' ')[0]}`;
        rightScale.appendChild(rightLabel);
        
        // Assemblage de la balance
        balanceContainer.appendChild(balanceBeam);
        balanceContainer.appendChild(balanceStand);
        balanceContainer.appendChild(leftScale);
        balanceContainer.appendChild(rightScale);
        
        container.appendChild(balanceContainer);
        visualization.appendChild(container);
    }

    function createCurrencyVisualization(fromValue, toValue, fromUnit, toUnit) {
        const container = document.createElement('div');
        container.className = 'currency-container';
        
        // Premier groupe de pièces/billets
        const fromStack = document.createElement('div');
        fromStack.className = 'currency-stack';
        
        const fromLabel = document.createElement('div');
        fromLabel.className = 'currency-label';
        fromLabel.textContent = `${fromValue} ${fromUnit.name.split(' ')[0]}`;
        fromStack.appendChild(fromLabel);
        
        // Représentation visuelle du montant
        const fromMoney = createMoneyElements(fromValue, fromUnit.name.split(' ')[0]);
        fromMoney.forEach(element => fromStack.appendChild(element));
        
        // Deuxième groupe de pièces/billets
        const toStack = document.createElement('div');
        toStack.className = 'currency-stack';
        
        const toLabel = document.createElement('div');
        toLabel.className = 'currency-label';
        toLabel.textContent = `${toValue.toFixed(2)} ${toUnit.name.split(' ')[0]}`;
        toStack.appendChild(toLabel);
        
        // Représentation visuelle du montant converti
        const toMoney = createMoneyElements(toValue, toUnit.name.split(' ')[0]);
        toMoney.forEach(element => toStack.appendChild(element));
        
        // Flèche entre les deux piles
        const arrow = document.createElement('div');
        arrow.style.fontSize = '24px';
        arrow.style.margin = '0 20px';
        arrow.style.color = '#3498db';
        arrow.innerHTML = '&#8646;';
        
        container.appendChild(fromStack);
        container.appendChild(arrow);
        container.appendChild(toStack);
        visualization.appendChild(container);
    }
    
    function createMoneyElements(value, currencyCode) {
        const elements = [];
        let remainingValue = value;
        
        // Déterminer si on utilise des billets ou des pièces
        if (remainingValue >= 5) {
            // Créer des billets pour les grandes valeurs
            const billCount = Math.min(5, Math.floor(remainingValue / 5));
            for (let i = 0; i < billCount; i++) {
                const bill = document.createElement('div');
                bill.className = 'bill';
                
                // Couleurs différentes selon la devise
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
        
        // Ajouter des pièces pour le reste
        const coinCount = Math.min(10, Math.ceil(remainingValue));
        for (let i = 0; i < coinCount; i++) {
            const coin = document.createElement('div');
            coin.className = 'coin';
            
            // Différentes couleurs selon la devise
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
        container.className = 'thermometer-container';
        
        // Fonction pour créer un thermomètre
        function createThermometer(value, unit, label) {
            const thermometerColumn = document.createElement('div');
            thermometerColumn.style.display = 'flex';
            thermometerColumn.style.flexDirection = 'column';
            thermometerColumn.style.alignItems = 'center';
            
            // Thermomètre
            const thermometer = document.createElement('div');
            thermometer.className = 'thermometer';
            
            // Cercle du bas du thermomètre
            const thermometerCircle = document.createElement('div');
            thermometerCircle.className = 'thermometer-circle';
            thermometer.appendChild(thermometerCircle);
            
            // Tube du thermomètre
            const thermometerFill = document.createElement('div');
            thermometerFill.className = 'thermometer-fill';
            
            // Calculer la hauteur du remplissage (en %)
            let fillHeight;
            let celsiusValue;
            
            switch (unit.value) {
                case 'C':
                    celsiusValue = value;
                    break;
                case 'F':
                    celsiusValue = (value - 32) * 5/9;
                    break;
                case 'K':
                    celsiusValue = value - 273.15;
                    break;
            }
            
            // Limiter l'affichage entre -50°C et 150°C sur l'échelle complète
            fillHeight = ((celsiusValue + 50) / 200) * 100;
            fillHeight = Math.max(0, Math.min(100, fillHeight));
            
            thermometerFill.style.height = `${fillHeight}%`;
            thermometer.appendChild(thermometerFill);
            
            // Étiquette pour le thermomètre
            const thermometerLabel = document.createElement('div');
            thermometerLabel.className = 'thermometer-label';
            thermometerLabel.textContent = `${value.toFixed(1)} ${unit.name.split(' ')[0]}`;
            
            // Ajouter des marques d'échelle
            const labelsContainer = document.createElement('div');
            labelsContainer.className = 'temperature-labels';
            
            // Créer des marques d'échelle pour -50, 0, 50, 100, 150
            const tempMarks = [-50, 0, 50, 100, 150];
            
            tempMarks.forEach(temp => {
                const markContainer = document.createElement('div');
                markContainer.style.display = 'flex';
                markContainer.style.alignItems = 'center';
                
                const mark = document.createElement('div');
                mark.className = 'temperature-mark';
                
                const markValue = document.createElement('span');
                markValue.className = 'temperature-value';
                
                // Convertir la marque en l'unité affichée
                let displayValue;
                switch (unit.value) {
                    case 'C':
                        displayValue = temp;
                        break;
                    case 'F':
                        displayValue = (temp * 9/5) + 32;
                        break;
                    case 'K':
                        displayValue = temp + 273.15;
                        break;
                }
                
                markValue.textContent = `${displayValue}`;
                
                markContainer.appendChild(mark);
                markContainer.appendChild(markValue);
                labelsContainer.appendChild(markContainer);
            });
            
            thermometerColumn.appendChild(thermometer);
            thermometerColumn.appendChild(thermometerLabel);
            
            const column = document.createElement('div');
            column.style.display = 'flex';
            column.appendChild(thermometerColumn);
            column.appendChild(labelsContainer);
            
            return column;
        }
        
        // Créer les deux thermomètres
        const fromThermometer = createThermometer(fromValue, fromUnit, fromUnit.name);
        const toThermometer = createThermometer(toValue, toUnit, toUnit.name);
        
        // Ajouter les deux thermomètres au conteneur
        container.appendChild(fromThermometer);
        container.appendChild(toThermometer);
        
        visualization.appendChild(container);
    }

    function createTimeVisualization(fromValue, toValue, fromUnit, toUnit) {
        const container = document.createElement('div');
        container.className = 'time-container';
        
        // Conteneur pour les horloges
        const clockContainer = document.createElement('div');
        clockContainer.className = 'clock-container';
        
        // Première horloge représentant la valeur d'origine
        const fromClockDiv = document.createElement('div');
        fromClockDiv.style.display = 'flex';
        fromClockDiv.style.flexDirection = 'column';
        fromClockDiv.style.alignItems = 'center';
        
        const fromClock = document.createElement('div');
        fromClock.className = 'clock';
        
        const fromClockCenter = document.createElement('div');
        fromClockCenter.className = 'clock-center';
        fromClock.appendChild(fromClockCenter);
        
        // Aiguilles de l'horloge
        const hourHandFrom = document.createElement('div');
        hourHandFrom.className = 'clock-hand hour-hand';
        hourHandFrom.style.transform = 'rotate(0deg)';
        
        const minuteHandFrom = document.createElement('div');
        minuteHandFrom.className = 'clock-hand minute-hand';
        minuteHandFrom.style.transform = 'rotate(90deg)';
        
        fromClock.appendChild(hourHandFrom);
        fromClock.appendChild(minuteHandFrom);
        
        const fromLabel = document.createElement('div');
        fromLabel.className = 'time-label';
        fromLabel.textContent = `${fromValue} ${fromUnit.name.split(' ')[0]}`;
        
        fromClockDiv.appendChild(fromClock);
        fromClockDiv.appendChild(fromLabel);
        
        // Deuxième horloge représentant la valeur convertie
        const toClockDiv = document.createElement('div');
        toClockDiv.style.display = 'flex';
        toClockDiv.style.flexDirection = 'column';
        toClockDiv.style.alignItems = 'center';
        
        const toClock = document.createElement('div');
        toClock.className = 'clock';
        
        const toClockCenter = document.createElement('div');
        toClockCenter.className = 'clock-center';
        toClock.appendChild(toClockCenter);
        
        // Aiguilles de l'horloge
        const hourHandTo = document.createElement('div');
        hourHandTo.className = 'clock-hand hour-hand';
        
        const minuteHandTo = document.createElement('div');
        minuteHandTo.className = 'clock-hand minute-hand';
        
        // Calculer la rotation des aiguilles basée sur le ratio de conversion
        const ratio = fromUnit.value / toUnit.value;
        // Rotation plus rapide pour illustrer la différence
        const rotationHour = (ratio * 30) % 360; // 30 degrés par heure
        const rotationMinute = (ratio * 6) % 360; // 6 degrés par minute
        
        hourHandTo.style.transform = `rotate(${rotationHour}deg)`;
        minuteHandTo.style.transform = `rotate(${rotationMinute}deg)`;
        
        toClock.appendChild(hourHandTo);
        toClock.appendChild(minuteHandTo);
        
        const toLabel = document.createElement('div');
        toLabel.className = 'time-label';
        toLabel.textContent = `${toValue.toFixed(2)} ${toUnit.name.split(' ')[0]}`;
        
        toClockDiv.appendChild(toClock);
        toClockDiv.appendChild(toLabel);
        
        // Texte explicatif du ratio
        const timeRatio = document.createElement('div');
        timeRatio.className = 'time-ratio';
        
        // Simplifier le ratio pour le rendre plus lisible
        let gcd = function(a, b) {
            if (!b) return a;
            return gcd(b, a % b);
        };
        
        const fromUnitValue = fromUnit.value;
        const toUnitValue = toUnit.value;
        const divisor = gcd(fromUnitValue, toUnitValue);
        
        const simplifiedFromValue = fromUnitValue / divisor;
        const simplifiedToValue = toUnitValue / divisor;
        
        timeRatio.textContent = `Ratio: 1 ${fromUnit.name.split(' ')[0]} = ${(fromUnitValue/toUnitValue).toFixed(2)} ${toUnit.name.split(' ')[0]}`;
        
        clockContainer.appendChild(fromClockDiv);
        clockContainer.appendChild(toClockDiv);
        
        container.appendChild(clockContainer);
        container.appendChild(timeRatio);
        
        visualization.appendChild(container);
    }

    // Fonction pour ajouter à l'historique
    function addToHistory(fromValue, fromUnitText, toValue, toUnitText, category) {
        // Vérifier si la valeur d'entrée est valide
        if (isNaN(parseFloat(fromValue))) {
            return;
        }
        
        // Créer l'élément d'historique
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
            // Changer de catégorie si nécessaire
            if (this.dataset.category !== currentCategory) {
                const targetTab = document.querySelector(`.tab-btn[data-category="${this.dataset.category}"]`);
                targetTab.click();
            }
            
            // Définir les valeurs
            fromValueInput.value = this.dataset.from;
            fromUnitSelect.value = this.dataset.fromUnit;
            toUnitSelect.value = this.dataset.toUnit;
            
            // Convertir
            convert();
        });
        
        historyItem.appendChild(historyText);
        historyItem.appendChild(reuseBtn);
        
        // Ajouter au début de la liste
        const historyList = document.getElementById('historyList');
        
        // Vérifier s'il existe déjà une conversion identique
        let isDuplicate = false;
        Array.from(historyList.children).forEach(item => {
            const itemText = item.querySelector('.history-text').textContent;
            if (itemText === historyText.textContent) {
                isDuplicate = true;
                // Déplacer l'élément existant au début de la liste
                historyList.insertBefore(item, historyList.firstChild);
            }
        });
        
        // Ajouter uniquement s'il n'y a pas de doublon
        if (!isDuplicate) {
            historyList.insertBefore(historyItem, historyList.firstChild);
            
            // Limiter l'historique à 10 éléments
            if (historyList.children.length > 10) {
                historyList.removeChild(historyList.lastChild);
            }
            
            // Sauvegarder l'historique dans localStorage
            saveHistoryToLocalStorage();
        }
    }

    // Fonction pour sauvegarder l'historique
    function saveHistoryToLocalStorage() {
        const historyList = document.getElementById('historyList');
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

    // Fonction pour charger l'historique
    function loadHistoryFromLocalStorage() {
        const savedHistory = localStorage.getItem('conversionHistory');
        if (savedHistory) {
            const historyItems = JSON.parse(savedHistory);
            const historyList = document.getElementById('historyList');
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
                        targetTab.click();
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
});