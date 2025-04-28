import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

/**
 * Creates a border of low-poly spikes around the perimeter of a ground plane
 * @param {THREE.Scene} scene - The scene to add the spikes to
 * @param {THREE.Mesh} ground - The ground plane mesh
 */
export function createSpikeBorder(scene, ground) {
    // Extract ground dimensions
    const groundSize = {
        width: ground.geometry.parameters.width,
        height: ground.geometry.parameters.height
    };
    
    // IMPORTANT: We want to keep the spikes at the original boundary location (±50)
    // even though the ground is now 150x150
    // So we'll override the ground dimensions with the original values
    const originalGroundSize = {
        width: 100,  // Original width
        height: 100  // Original height
    };
    
    // Calculate border positions (slightly outside the ground perimeter)
    // Using the original 100x100 dimensions
    const borderOffset = 2; // Distance beyond the edge of the ground
    const halfWidth = originalGroundSize.width / 2 + borderOffset;
    const halfHeight = originalGroundSize.height / 2 + borderOffset;
    
    // Configuration for front row spikes (increased by 25%)
    const spikeCount = 240; // Doubled from 120 to 240 total spikes
    const spikeHeight = { min: 5, max: 10 }; // Increased from 4-8
    const spikeWidth = { min: 0.875, max: 1.875 }; // Increased from 0.7-1.5
    const embeddingDepth = 0.5; // How deep spikes are embedded in ground
    const positionJitter = 1.5; // Random variation in position
    
    // Configuration for the outer row (taller spikes) - increased by 25%
    const outerRowOffset = 4; // Distance beyond the inner row
    const outerRowSpikeHeight = { min: 12.5, max: 22.5 }; // Increased from 10-18
    const outerRowSpikeWidth = { min: 1.5, max: 2.75 }; // Increased from 1.2-2.2
    const outerRowCount = Math.floor(spikeCount * 0.7); // More spikes in outer row
    
    // Create a single geometry to be reused for all spikes
    const spikeGeometry = createSpikeGeometry();
    
    // Create material with a dull, dark color and double-sided rendering
    const spikeMaterial = new THREE.MeshLambertMaterial({
        color: 0x454545,
        flatShading: true,
        side: THREE.DoubleSide // Render both sides of faces
    });
    
    // Create a slightly different material for outer row (darker)
    const outerRowMaterial = new THREE.MeshLambertMaterial({
        color: 0x353535,
        flatShading: true,
        side: THREE.DoubleSide
    });
    
    // Place outer row of taller spikes FIRST (so inner row appears in front)
    placeOuterRowSpikes(scene, spikeGeometry, outerRowMaterial, {
        halfWidth: halfWidth + outerRowOffset,
        halfHeight: halfHeight + outerRowOffset,
        spikeCount: outerRowCount,
        spikeHeight: outerRowSpikeHeight,
        spikeWidth: outerRowSpikeWidth,
        embeddingDepth: embeddingDepth * 1.5, // Embed slightly deeper
        positionJitter: positionJitter * 0.7 // Less jitter for outer row
    });
    
    // Place inner row spikes around the perimeter
    placeBorderSpikes(scene, spikeGeometry, spikeMaterial, {
        halfWidth,
        halfHeight,
        spikeCount,
        spikeHeight,
        spikeWidth,
        embeddingDepth,
        positionJitter
    });
}

/**
 * Creates a low-poly spike geometry
 * @returns {THREE.BufferGeometry} The spike geometry
 */
function createSpikeGeometry() {
    // Create a triangular pyramid (tetrahedron) with 4 vertices and 4 faces
    const geometry = new THREE.BufferGeometry();
    
    // Define vertices (base triangle + peak)
    const vertices = new Float32Array([
        // Base triangle
        -0.5, 0, -0.5,    // bottom left
        0.5, 0, -0.5,     // bottom right
        0, 0, 0.5,        // bottom front
        
        // Peak
        0, 1, 0           // top
    ]);
    
    // Define face indices with inverted winding order to flip normals
    const indices = [
        // Face 1 (base to peak) - reversed winding
        0, 3, 1,
        // Face 2 - reversed winding
        1, 3, 2,
        // Face 3 - reversed winding
        2, 3, 0,
        // Face 4 (base - optional, makes it solid) - reversed winding
        0, 1, 2
    ];
    
    // Set attributes
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    
    // Calculate normals
    geometry.computeVertexNormals();
    
    return geometry;
}

/**
 * Places spikes around the border of the ground
 * @param {THREE.Scene} scene - The scene to add spikes to
 * @param {THREE.BufferGeometry} geometry - The spike geometry
 * @param {THREE.Material} material - The spike material
 * @param {Object} config - Configuration options
 */
function placeBorderSpikes(scene, geometry, material, config) {
    const {
        halfWidth,
        halfHeight,
        spikeCount,
        spikeHeight,
        spikeWidth,
        embeddingDepth,
        positionJitter
    } = config;
    
    // Calculate spikes per side (proportional to length)
    const perimeter = 2 * (halfWidth * 2 + halfHeight * 2);
    const spikesPerUnit = spikeCount / perimeter;
    
    const spikesTopBottom = Math.floor(halfWidth * 2 * spikesPerUnit);
    const spikesLeftRight = Math.floor(halfHeight * 2 * spikesPerUnit);
    
    // Create spikes along each edge with slight randomization
    
    // Top edge
    createEdgeSpikes(scene, geometry, material, 
        -halfWidth, halfHeight, halfWidth, halfHeight, 
        spikesTopBottom, spikeHeight, spikeWidth, embeddingDepth, positionJitter, Math.PI);
    
    // Bottom edge
    createEdgeSpikes(scene, geometry, material, 
        -halfWidth, -halfHeight, halfWidth, -halfHeight, 
        spikesTopBottom, spikeHeight, spikeWidth, embeddingDepth, positionJitter, 0);
    
    // Left edge
    createEdgeSpikes(scene, geometry, material, 
        -halfWidth, -halfHeight, -halfWidth, halfHeight, 
        spikesLeftRight, spikeHeight, spikeWidth, embeddingDepth, positionJitter, Math.PI * 1.5);
    
    // Right edge
    createEdgeSpikes(scene, geometry, material, 
        halfWidth, -halfHeight, halfWidth, halfHeight, 
        spikesLeftRight, spikeHeight, spikeWidth, embeddingDepth, positionJitter, Math.PI * 0.5);
}

/**
 * Creates spikes along a single edge
 * @param {THREE.Scene} scene - The scene to add spikes to
 * @param {THREE.BufferGeometry} geometry - The spike geometry
 * @param {THREE.Material} material - The spike material
 * @param {number} startX - Starting X coordinate
 * @param {number} startZ - Starting Z coordinate
 * @param {number} endX - Ending X coordinate
 * @param {number} endZ - Ending Z coordinate
 * @param {number} count - Number of spikes to place
 * @param {Object} heightRange - Min/max height of spikes
 * @param {Object} widthRange - Min/max width of spikes
 * @param {number} embeddingDepth - How deep to embed in ground
 * @param {number} jitter - Random position variation
 * @param {number} baseRotation - Base rotation for this edge
 */
function createEdgeSpikes(
    scene, geometry, material, 
    startX, startZ, endX, endZ, 
    count, heightRange, widthRange, 
    embeddingDepth, jitter, baseRotation
) {
    for (let i = 0; i <= count * 2; i++) {
        // Interpolate position along the edge with double frequency
        const t = i / (count * 2);
        let x = startX + (endX - startX) * t;
        let z = startZ + (endZ - startZ) * t;
        
        // Create alternating pattern
        const isEvenSpike = i % 2 === 0;
        
        // Add random jitter perpendicular to edge
        const angle = Math.atan2(endZ - startZ, endX - startX) + Math.PI / 2;
        
        // Different jitter amounts for primary vs. secondary spikes
        let jitterAmount;
        if (isEvenSpike) {
            // Primary spikes - original jitter
            jitterAmount = (Math.random() - 0.5) * jitter;
        } else {
            // Secondary spikes - slightly different jitter
            jitterAmount = (Math.random() - 0.5) * (jitter * 0.8) + (jitter * 0.3);
        }
        
        x += Math.cos(angle) * jitterAmount;
        z += Math.sin(angle) * jitterAmount;
        
        // Create spike with random height and width
        // Alternate between slightly larger primary spikes and smaller secondary spikes
        let height, width;
        if (isEvenSpike) {
            // Primary spikes - full size range
            height = Math.random() * (heightRange.max - heightRange.min) + heightRange.min;
            width = Math.random() * (widthRange.max - widthRange.min) + widthRange.min;
        } else {
            // Secondary spikes - slightly smaller
            height = Math.random() * (heightRange.max - heightRange.min) * 0.7 + heightRange.min * 0.9;
            width = Math.random() * (widthRange.max - widthRange.min) * 0.7 + widthRange.min * 0.9;
        }
        
        // Create mesh
        const spike = new THREE.Mesh(geometry, material);
        
        // Position and scale
        spike.position.set(x, -embeddingDepth, z);
        spike.scale.set(width, height, width);
        
        // Rotate spike to point outward with slight variation
        const rotationY = baseRotation + (Math.random() - 0.5) * 0.5;
        spike.rotation.y = rotationY;
        
        // Add slight random tilt for more natural look
        spike.rotation.x = (Math.random() - 0.5) * 0.2;
        spike.rotation.z = (Math.random() - 0.5) * 0.2;
        
        // Add to scene
        scene.add(spike);
    }
}

/**
 * Places a second row of taller spikes around the main border
 * @param {THREE.Scene} scene - The scene to add spikes to
 * @param {THREE.BufferGeometry} geometry - The spike geometry
 * @param {THREE.Material} material - The spike material
 * @param {Object} config - Configuration options
 */
function placeOuterRowSpikes(scene, geometry, material, config) {
    const {
        halfWidth,
        halfHeight,
        spikeCount,
        spikeHeight,
        spikeWidth,
        embeddingDepth,
        positionJitter
    } = config;
    
    // Calculate spikes per side (proportional to length)
    const perimeter = 2 * (halfWidth * 2 + halfHeight * 2);
    const spikesPerUnit = spikeCount / perimeter;
    
    const spikesTopBottom = Math.floor(halfWidth * 2 * spikesPerUnit);
    const spikesLeftRight = Math.floor(halfHeight * 2 * spikesPerUnit);
    
    // Create outer row spikes along each edge
    
    // Top edge - outer row
    createOuterRowEdgeSpikes(scene, geometry, material, 
        -halfWidth, halfHeight, halfWidth, halfHeight, 
        spikesTopBottom, spikeHeight, spikeWidth, embeddingDepth, positionJitter, Math.PI);
    
    // Bottom edge - outer row
    createOuterRowEdgeSpikes(scene, geometry, material, 
        -halfWidth, -halfHeight, halfWidth, -halfHeight, 
        spikesTopBottom, spikeHeight, spikeWidth, embeddingDepth, positionJitter, 0);
    
    // Left edge - outer row
    createOuterRowEdgeSpikes(scene, geometry, material, 
        -halfWidth, -halfHeight, -halfWidth, halfHeight, 
        spikesLeftRight, spikeHeight, spikeWidth, embeddingDepth, positionJitter, Math.PI * 1.5);
    
    // Right edge - outer row
    createOuterRowEdgeSpikes(scene, geometry, material, 
        halfWidth, -halfHeight, halfWidth, halfHeight, 
        spikesLeftRight, spikeHeight, spikeWidth, embeddingDepth, positionJitter, Math.PI * 0.5);
}

/**
 * Creates spikes along a single edge for the outer row (taller spikes)
 * @param {THREE.Scene} scene - The scene to add spikes to
 * @param {THREE.BufferGeometry} geometry - The spike geometry
 * @param {THREE.Material} material - The spike material
 * @param {number} startX - Starting X coordinate
 * @param {number} startZ - Starting Z coordinate
 * @param {number} endX - Ending X coordinate
 * @param {number} endZ - Ending Z coordinate
 * @param {number} count - Number of spikes to place
 * @param {Object} heightRange - Min/max height of spikes
 * @param {Object} widthRange - Min/max width of spikes
 * @param {number} embeddingDepth - How deep to embed in ground
 * @param {number} jitter - Random position variation
 * @param {number} baseRotation - Base rotation for this edge
 */
function createOuterRowEdgeSpikes(
    scene, geometry, material, 
    startX, startZ, endX, endZ, 
    count, heightRange, widthRange, 
    embeddingDepth, jitter, baseRotation
) {
    // Calculate edge direction vector
    const edgeVector = {
        x: endX - startX,
        z: endZ - startZ
    };
    
    // Calculate edge length
    const edgeLength = Math.sqrt(edgeVector.x * edgeVector.x + edgeVector.z * edgeVector.z);
    
    // Normalize edge vector
    const normalizedEdge = {
        x: edgeVector.x / edgeLength,
        z: edgeVector.z / edgeLength
    };
    
    // Calculate perpendicular vector pointing outward from the edge
    const outwardPerp = {
        x: normalizedEdge.z,
        z: -normalizedEdge.x
    };
    
    // Create spikes along the outer edge
    for (let i = 0; i <= count; i++) {
        // Interpolate position along the edge
        const t = i / count;
        
        // Base position on the edge
        const baseX = startX + (endX - startX) * t;
        const baseZ = startZ + (endZ - startZ) * t;
        
        // Move position outward 
        let x = baseX + outwardPerp.x * 3; // Move outward from the edge by fixed amount
        let z = baseZ + outwardPerp.z * 3;
        
        // Add smaller jitter for more controlled placement
        const jitterX = (Math.random() - 0.5) * jitter;
        const jitterZ = (Math.random() - 0.5) * jitter;
        x += jitterX;
        z += jitterZ;
        
        // Create spike with random height and width from the taller range
        const height = Math.random() * (heightRange.max - heightRange.min) + heightRange.min;
        const width = Math.random() * (widthRange.max - widthRange.min) + widthRange.min;
        
        // Create mesh
        const spike = new THREE.Mesh(geometry, material);
        
        // Position and scale
        spike.position.set(x, -embeddingDepth, z);
        spike.scale.set(width, height, width);
        
        // Rotate spike to point outward with slight variation
        const rotationY = baseRotation + (Math.random() - 0.5) * 0.6; // Moderate rotation variation
        spike.rotation.y = rotationY;
        
        // Add slight random tilt
        spike.rotation.x = (Math.random() - 0.5) * 0.2;
        spike.rotation.z = (Math.random() - 0.5) * 0.2;
        
        // Add to scene
        scene.add(spike);
    }
} 