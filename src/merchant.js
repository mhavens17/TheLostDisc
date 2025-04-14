class MerchantUI {
    constructor() {
        this.element = null;
        this.totalChars = 39;
        this.minHyphens = 2;
        this.baseFontSize = 18;
        this.setupStyles();
    }

    setupStyles() {
        // Add custom fonts
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Tahoma';
                src: url('assets/fonts/tahoma.ttf') format('truetype');
            }
            @font-face {
                font-family: 'Tahoma Bold';
                src: url('assets/fonts/tahomabd.ttf') format('truetype');
            }

            .merchant-ui {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 750px;
                height: 500px;
                background: none;
                color: white;
                z-index: 2000;
            }

            .merchant-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                z-index: -1;
            }

            .merchant-background.has-discs {
                background-image: url('assets/textures/Nexus Codec.png');
            }

            .merchant-background.no-discs {
                background-image: url('assets/textures/Nexus Codec 2.png');
            }

            .merchant-content-container {
                position: absolute;
                top: 145px;
                left: 315px;
                width: 260px;
                z-index: 1;
            }

            .measurement-box {
                position: absolute;
                top: 145px;
                left: 315px;
                width: 260px;
                height: 200px;
                background-color: rgba(0, 255, 0, 0.3);
                border: 1px solid #00ff00;
                z-index: 2;
                pointer-events: none;
            }

            .merchant-content {
                display: grid;
                grid-template-columns: 1fr;
                gap: 4px;
                position: relative;
            }

            .merchant-row {
                display: flex;
                align-items: center;
            }

            .merchant-label {
                font-family: monospace;
                color: white;
                text-align: left;
                font-size: 12px;
                white-space: nowrap;
            }

            .merchant-value {
                font-family: monospace;
                color: white;
                font-size: 18px;
                font-weight: bold;
                white-space: nowrap;
            }

            .merchant-quote {
                font-family: 'Tahoma Bold', sans-serif;
                color: #FFD700;
                margin-top: 15px;
                font-style: italic;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
    }

    show(discData = null) {
        if (this.element) {
            this.hide();
        }

        this.element = document.createElement('div');
        this.element.className = 'merchant-ui';

        // Add background image container
        const background = document.createElement('div');
        background.className = 'merchant-background ' + (discData ? 'has-discs' : 'no-discs');
        this.element.appendChild(background);

        if (discData) {
            // Create content container for disc data
            const contentContainer = document.createElement('div');
            contentContainer.className = 'merchant-content-container';

            const content = document.createElement('div');
            content.className = 'merchant-content';

            const fields = [
                ['Title', discData.title],
                ['Artist', discData.artist],
                ['Genre', discData.genre],
                ['Value', discData.value],
                ['Condition', discData.condition],
                ['Rarity', discData.rarity]
            ];

            fields.forEach(([label, value]) => {
                const rowContainer = document.createElement('div');
                rowContainer.className = 'merchant-row';
                
                const labelElement = document.createElement('span');
                const valueElement = document.createElement('span');
                
                labelElement.className = 'merchant-label';
                valueElement.className = 'merchant-value';

                // Calculate space needed
                const labelLength = label.length;
                const valueLength = value.length;
                const spacesNeeded = 4; // Total spaces needed

                // Calculate the space available for the value text
                // Account for the fact that 18px font takes about 1.5x the space of 12px font
                const valueSpaceNeeded = Math.ceil(valueLength * 1.5); // Each 18px character takes ~1.5x space
                const availableSpace = this.totalChars - labelLength - this.minHyphens - spacesNeeded;

                // If we need to adjust the font size
                if (valueSpaceNeeded > availableSpace) {
                    // Calculate how much we need to scale down
                    const scaleFactor = availableSpace / valueSpaceNeeded;
                    // Scale down from baseFontSize (18px)
                    const newFontSize = Math.max(10, Math.floor(this.baseFontSize * scaleFactor));
                    valueElement.style.fontSize = `${newFontSize}px`;
                }

                // Calculate hyphens based on the scaled length
                const effectiveValueLength = valueElement.style.fontSize ? 
                    Math.ceil(valueLength * (parseInt(valueElement.style.fontSize) / 12)) : 
                    Math.ceil(valueLength * 1.5);

                const hyphenCount = Math.max(
                    this.minHyphens,
                    this.totalChars - labelLength - effectiveValueLength - spacesNeeded
                );

                // Format with explicit spaces
                labelElement.textContent = label + ' ' + '-'.repeat(hyphenCount) + '  ';
                valueElement.textContent = value;

                rowContainer.appendChild(labelElement);
                rowContainer.appendChild(valueElement);
                content.appendChild(rowContainer);
            });

            contentContainer.appendChild(content);

            if (discData.quote) {
                const quote = document.createElement('div');
                quote.className = 'merchant-quote';
                quote.textContent = discData.quote;
                contentContainer.appendChild(quote);
            }

            this.element.appendChild(contentContainer);
        }

        document.body.appendChild(this.element);
    }

    hide() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }

    update(discData) {
        if (this.element) {
            this.show(discData);
        }
    }
}

export default MerchantUI; 