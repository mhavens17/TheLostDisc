import * as THREE from 'three';

export function createTwigs(scene, validatePosition = null) {
    const twigCount = 3;
    const spawnRadius = 100;

    for (let i = 0; i < twigCount; i++) {
        const position = new THREE.Vector3(
            (Math.random() - 0.5) * spawnRadius * 2,
            0,
            (Math.random() - 0.5) * spawnRadius * 2
        );

        // Skip this position if it fails validation
        if (validatePosition && !validatePosition(position)) {
            continue;
        }

        // Placeholder twigs
        function createTwigPile(x, z) {
            const twigGroup = new THREE.Group();
            const baseColor = 0x4A4A3C; // Darker color for twigs
            
            // Create multiple thin, elongated boxes (twigs)
            const numTwigs = 6 + Math.floor(Math.random() * 4); // 6-9 twigs per pile
            
            for (let i = 0; i < numTwigs; i++) {
                const length = 0.7 + Math.random() * 0.8; // Longer length between 0.7 and 1.5
                const geometry = new THREE.BoxGeometry(0.08, length, 0.08); // Thin boxes for twigs
                
                // Slightly vary the twig colors
                const twigColor = new THREE.Color(baseColor).offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
                const material = new THREE.MeshLambertMaterial({ color: twigColor });
                const twig = new THREE.Mesh(geometry, material);
                
                // Position twigs to sprout from ground level
                const angleY = (i / numTwigs) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
                const angleFromVertical = 0.3 + Math.random() * Math.PI * 0.25; // More angled from vertical, min 17 degrees
                
                // Move pivot point to bottom of twig and position at ground level
                twig.position.y = 0;
                
                // Apply rotations to create sprouting effect
                twig.rotation.order = 'YXZ';
                twig.rotation.y = angleY;
                twig.rotation.x = angleFromVertical;
                
                // Move the twig origin slightly from center for more natural look
                const spreadRadius = 0.1; // How far from center the twigs can start
                twig.position.x = Math.cos(angleY) * spreadRadius * Math.random();
                twig.position.z = Math.sin(angleY) * spreadRadius * Math.random();
                
                twigGroup.add(twig);
            }
            
            twigGroup.position.set(x, 0, z);
            scene.add(twigGroup);
        }
        
        // Create some random twig piles
        for (let i = 0; i < 50; i++) {
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            createTwigPile(x, z);
        }
    }
} 