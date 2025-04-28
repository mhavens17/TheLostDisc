class N{constructor(e){if(!e)throw new Error("UIManager instance must be provided to MerchantUI constructor");this.element=null,this.totalChars=39,this.minHyphens=2,this.baseFontSize=18,this.uiManager=e,this.setupStyles()}setupStyles(){const e=document.createElement("style");e.textContent=`
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
        `,document.head.appendChild(e)}async show(e=null){this.element&&this.hide(),this.element=document.createElement("div"),this.element.className="merchant-ui";const h=document.createElement("div");if(h.className="merchant-background "+(e?"has-discs":"no-discs"),this.element.appendChild(h),document.body.appendChild(this.element),e){const s=document.createElement("div");s.className="merchant-content-container";const r=document.createElement("div");r.className="merchant-content";const f=[["Title",e.title],["Artist",e.artist],["Genre",e.genre],["Value",e.value],["Condition",e.condition],["Rarity",e.rarity]].map(([i,l])=>{const t=document.createElement("div");t.className="merchant-row";const o=document.createElement("span"),n=document.createElement("span");o.className="merchant-label",n.className="merchant-value";const m=i.length,c=l.length,p=4,d=Math.ceil(c*1.5),u=this.totalChars-m-this.minHyphens-p;if(d>u){const b=u/d,C=Math.max(10,Math.floor(this.baseFontSize*b));n.style.fontSize=`${C}px`}const y=n.style.fontSize?Math.ceil(c*(parseInt(n.style.fontSize)/12)):Math.ceil(c*1.5),x=Math.max(this.minHyphens,this.totalChars-m-y-p),w=i+" "+"-".repeat(x)+"  ";return t.appendChild(o),t.appendChild(n),r.appendChild(t),{labelElement:o,valueElement:n,labelText:w,value:l}});s.appendChild(r);let a=null;e.quote&&(a=document.createElement("div"),a.className="merchant-quote",s.appendChild(a)),this.element.appendChild(s);const g=f.map(({labelElement:i,valueElement:l,labelText:t,value:o})=>Promise.all([this.uiManager.typewriterEffect(i,t),this.uiManager.typewriterEffect(l,o)]));await Promise.all(g),a&&e.quote&&await this.uiManager.typewriterEffect(a,e.quote)}}hide(){this.element&&this.element.parentNode&&this.element.parentNode.removeChild(this.element),this.element=null}update(e){this.element&&this.show(e)}}export{N as default};
