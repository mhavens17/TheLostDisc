class MerchantUI {
    constructor(uiManager) {
        if (!uiManager) {
            throw new Error('UIManager instance must be provided to MerchantUI constructor');
        }
        this.element = null;
        this.totalChars = 39;
        this.minHyphens = 2;
        this.baseFontSize = 18;
        this.uiManager = uiManager;
        this.setupStyles();
    }

    setupStyles() {
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
                z-index: 10;
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
                min-height: 1.2em;
            }

            .merchant-value {
                font-family: monospace;
                color: white;
                font-size: 18px;
                font-weight: bold;
                white-space: nowrap;
                min-height: 1.2em;
            }

            .merchant-quote {
                font-family: 'Tahoma Bold', sans-serif;
                color: #FFD700;
                margin-top: 15px;
                font-style: italic;
                font-size: 14px;
                min-height: 1.2em;
            }
        `;
        document.head.appendChild(style);
    }

    async show(discData = null) {
        if (this.element) {
            this.hide();
        }

        this.element = document.createElement('div');
        this.element.className = 'merchant-ui';

        const background = document.createElement('div');
        background.className = 'merchant-background ' + (discData ? 'has-discs' : 'no-discs');
        this.element.appendChild(background);

        document.body.appendChild(this.element);

        if (discData) {
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

            // Create all elements first
            const rowElements = fields.map(([label, value]) => {
                const rowContainer = document.createElement('div');
                rowContainer.className = 'merchant-row';
                
                const labelElement = document.createElement('span');
                const valueElement = document.createElement('span');
                
                labelElement.className = 'merchant-label';
                valueElement.className = 'merchant-value';

                const labelLength = label.length;
                const valueLength = value.length;
                const spacesNeeded = 4;
                const valueSpaceNeeded = Math.ceil(valueLength * 1.5);
                const availableSpace = this.totalChars - labelLength - this.minHyphens - spacesNeeded;

                if (valueSpaceNeeded > availableSpace) {
                    const scaleFactor = availableSpace / valueSpaceNeeded;
                    const newFontSize = Math.max(10, Math.floor(this.baseFontSize * scaleFactor));
                    valueElement.style.fontSize = `${newFontSize}px`;
                }

                const effectiveValueLength = valueElement.style.fontSize ? 
                    Math.ceil(valueLength * (parseInt(valueElement.style.fontSize) / 12)) : 
                    Math.ceil(valueLength * 1.5);

                const hyphenCount = Math.max(
                    this.minHyphens,
                    this.totalChars - labelLength - effectiveValueLength - spacesNeeded
                );

                const labelText = label + ' ' + '-'.repeat(hyphenCount) + '  ';
                rowContainer.appendChild(labelElement);
                rowContainer.appendChild(valueElement);
                content.appendChild(rowContainer);

                return { labelElement, valueElement, labelText, value };
            });

            contentContainer.appendChild(content);

            let quote = null;
            if (discData.quote) {
                quote = document.createElement('div');
                quote.className = 'merchant-quote';
                contentContainer.appendChild(quote);
            }

            this.element.appendChild(contentContainer);

            // Start all typing animations simultaneously
            const typingPromises = rowElements.map(({ labelElement, valueElement, labelText, value }) => {
                return Promise.all([
                    this.uiManager.typewriterEffect(labelElement, labelText),
                    this.uiManager.typewriterEffect(valueElement, value)
                ]);
            });

            // Wait for all row animations to complete
            await Promise.all(typingPromises);

            // Finally, type out the quote if it exists
            if (quote && discData.quote) {
                await this.uiManager.typewriterEffect(quote, discData.quote);
            }
        }
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