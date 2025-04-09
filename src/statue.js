import * as THREE from 'three';

// Use a lighter grey for a stone-like appearance
const STATUE_MATERIAL = new THREE.MeshLambertMaterial({ color: 0xAAAAAA }); // Lighter grey, non-shiny

/**
 * Creates a simple low-poly humanoid statue mesh and its height info.
 * The mesh's origin (0,0,0) is at the center of the torso.
 * @returns {{mesh: THREE.Group, heightInfo: {torsoHeight: number, legHeight: number}}} The statue group and its dimensions.
 */
function createSingleStatueMesh() {
    // --- Dimensions ---
    const torsoHeight = THREE.MathUtils.randFloat(1.0, 1.4);
    const torsoWidth = THREE.MathUtils.randFloat(0.6, 0.8);
    const torsoDepth = torsoWidth * 0.5;

    const legHeight = THREE.MathUtils.randFloat(0.9, 1.3);
    const legWidth = torsoWidth * 0.2;
    const legDepth = legWidth;

    const armLength = torsoHeight * 0.8;
    const armWidth = torsoWidth * 0.15;
    const armDepth = armWidth;

    const headSize = THREE.MathUtils.randFloat(0.4, 0.5);
    const neckHeight = 0.15;
    const neckDiameter = headSize * 0.6;

    const shoulderWidth = torsoWidth * 0.2;
    const shoulderHeight = shoulderWidth;
    const shoulderDepth = shoulderHeight;

    // --- Geometries ---
    const torsoGeometry = new THREE.BoxGeometry(torsoWidth, torsoHeight, torsoDepth);
    const headGeometry = new THREE.BoxGeometry(headSize, headSize, headSize);
    const neckGeometry = new THREE.BoxGeometry(neckDiameter, neckHeight, neckDiameter);
    const legGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
    const armGeometry = new THREE.BoxGeometry(armWidth, armLength, armDepth);
    // Translate the arm geometry so its origin (pivot point) is at the top center
    armGeometry.translate(0, armLength / 2, 0);
    const shoulderGeometry = new THREE.BoxGeometry(shoulderWidth, shoulderHeight, shoulderDepth);

    // --- Meshes ---
    const torsoMesh = new THREE.Mesh(torsoGeometry, STATUE_MATERIAL);
    const headMesh = new THREE.Mesh(headGeometry, STATUE_MATERIAL);
    const neckMesh = new THREE.Mesh(neckGeometry, STATUE_MATERIAL);
    const leftLegMesh = new THREE.Mesh(legGeometry, STATUE_MATERIAL);
    const rightLegMesh = new THREE.Mesh(legGeometry, STATUE_MATERIAL);
    const leftArmMesh = new THREE.Mesh(armGeometry, STATUE_MATERIAL);
    const rightArmMesh = new THREE.Mesh(armGeometry, STATUE_MATERIAL);
    const leftShoulderMesh = new THREE.Mesh(shoulderGeometry, STATUE_MATERIAL);
    const rightShoulderMesh = new THREE.Mesh(shoulderGeometry, STATUE_MATERIAL);

    // --- Positioning (Relative to Torso Center at 0,0,0) ---

    // Neck and Head
    neckMesh.position.y = torsoHeight / 2 + neckHeight / 2;
    headMesh.position.y = neckMesh.position.y + neckHeight / 2 + headSize / 2;

    // Shoulders
    const shoulderOffsetX = torsoWidth / 2 + shoulderWidth / 2;
    const shoulderOffsetY = torsoHeight / 2 - shoulderHeight / 2;
    leftShoulderMesh.position.set(-shoulderOffsetX, shoulderOffsetY, 0);
    rightShoulderMesh.position.set(shoulderOffsetX, shoulderOffsetY, 0);

    // --- Arm Positioning (Relative to its Parent Shoulder Mesh Center at 0,0,0) ---
    // Pivot point (arm's origin) is now at its top.
    // Position this pivot point relative to the shoulder's center.
    // Placing it near the bottom-center of the shoulder block.
    const armLocalY = -shoulderHeight / 2; 

    // Add arms to shoulders FIRST
    leftShoulderMesh.add(leftArmMesh);
    rightShoulderMesh.add(rightArmMesh);

    // Position arms RELATIVE to their shoulder parent's origin (using the new pivot point)
    leftArmMesh.position.set(0, armLocalY, 0);
    leftArmMesh.rotation.x = THREE.MathUtils.degToRad(10); // Rotate around X axis for up/down swing
    rightArmMesh.position.set(0, armLocalY, 0);
    rightArmMesh.rotation.x = THREE.MathUtils.degToRad(10); // Rotate around X axis for up/down swing

    // Legs
    const legOffsetX = torsoWidth / 2 - legWidth / 2 - 0.05; // Position legs towards the sides of the torso bottom
    const legOffsetY = -(torsoHeight / 2 + legHeight / 2);
    leftLegMesh.position.set(-legOffsetX, legOffsetY, 0);
    rightLegMesh.position.set(legOffsetX, legOffsetY, 0);

    // --- Grouping ---
    const statueGroup = new THREE.Group();
    statueGroup.add(torsoMesh);
    statueGroup.add(headMesh);
    statueGroup.add(neckMesh);

    // Now add positioned shoulders (containing arms) to the main group
    statueGroup.add(leftShoulderMesh);
    statueGroup.add(rightShoulderMesh);

    statueGroup.add(leftLegMesh);
    statueGroup.add(rightLegMesh);

    // NO group Y position adjustment here. Origin remains torso center.

    return { mesh: statueGroup, heightInfo: { torsoHeight, legHeight } };
}

/**
 * Creates and adds randomly placed statues to the scene.
 * @param {THREE.Scene} scene - The scene to add statues to.
 * @param {number} count - The number of statues to create.
 * @param {{minX: number, maxX: number, minZ: number, maxZ: number}} spawnArea - The area where statues can spawn.
 * @param {number} minDistance - The minimum distance between statues and from the origin (0,0,0).
 * @param {number} playerStartY - The player's starting Y position (to avoid spawning statues directly intersecting the player camera).
 */
export function createStatues(scene, count, spawnArea, minDistance, playerStartY = 1.7) {
    const statuePositions = [];
    const origin = new THREE.Vector3(0, playerStartY, 0); // Player start position to avoid

    for (let i = 0; i < count; i++) {
        let positionValid = false;
        let randomPosition;
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loops

        while (!positionValid && attempts < maxAttempts) {
            attempts++;
            const x = THREE.MathUtils.randFloat(spawnArea.minX, spawnArea.maxX);
            const z = THREE.MathUtils.randFloat(spawnArea.minZ, spawnArea.maxZ);
            randomPosition = new THREE.Vector3(x, 0, z); // Base position at y=0

            // Check distance from origin (player start)
            if (randomPosition.distanceTo(origin) < minDistance) {
                continue; // Too close to player start, try again
            }

            // Check distance from other statues
            let tooCloseToOther = false;
            for (const pos of statuePositions) {
                // Check distance in XZ plane only for placement density
                const distanceXZ = Math.sqrt(Math.pow(randomPosition.x - pos.x, 2) + Math.pow(randomPosition.z - pos.z, 2));
                if (distanceXZ < minDistance) {
                    tooCloseToOther = true;
                    break;
                }
            }

            if (!tooCloseToOther) {
                positionValid = true;
            }
        }

        if (positionValid) {
            const statueData = createSingleStatueMesh();
            const statue = statueData.mesh;
            const { torsoHeight, legHeight } = statueData.heightInfo;

            // Set final position
            statue.position.copy(randomPosition);
            // Adjust Y position so the feet are at y=0
            // The mesh origin is torso center. Feet bottom is at -(torsoHeight/2 + legHeight)
            statue.position.y = torsoHeight / 2 + legHeight;

            // Random rotation around Y axis
            statue.rotation.y = Math.random() * Math.PI * 2;

            scene.add(statue);
            statuePositions.push(statue.position); // Store the actual placed position (including Y)
             console.log(`Statue ${i+1} placed at:`, statue.position.x.toFixed(2), statue.position.y.toFixed(2), statue.position.z.toFixed(2));
        } else {
            console.warn(`Could not find a valid position for statue ${i + 1} after ${maxAttempts} attempts.`);
        }
    }
    console.log(`Attempted to create ${count} statues. Successfully placed ${statuePositions.length}.`);
} 