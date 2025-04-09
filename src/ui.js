export function setupUI() {
    // Create UI container
    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'absolute';
    uiContainer.style.top = '20px';
    uiContainer.style.left = '20px';
    uiContainer.style.color = '#ffffff';
    uiContainer.style.fontFamily = 'monospace';
    uiContainer.style.fontSize = '16px';
    uiContainer.style.textShadow = '2px 2px 2px rgba(0,0,0,0.5)';
    document.body.appendChild(uiContainer);
    
    // Create instructions
    const instructions = document.createElement('div');
    instructions.innerHTML = 'Click to play<br>WASD = Move<br>ESC = Pause';
    instructions.style.position = 'absolute';
    instructions.style.top = '50%';
    instructions.style.left = '50%';
    instructions.style.transform = 'translate(-50%, -50%)';
    instructions.style.color = '#ffffff';
    instructions.style.fontFamily = 'monospace';
    instructions.style.fontSize = '24px';
    instructions.style.textAlign = 'center';
    instructions.style.textShadow = '2px 2px 2px rgba(0,0,0,0.5)';
    document.body.appendChild(instructions);
    
    return {
        uiContainer,
        instructions
    };
} 