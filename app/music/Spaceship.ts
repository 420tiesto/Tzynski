import * as THREE from 'three';

interface SpaceshipConfig {
  speed?: number;
  rotationSpeed?: number;
  size?: number;
  color?: number;
}

export class Spaceship {
  public mesh: THREE.Group;
  private scene: THREE.Scene;
  private speed: number;
  private rotationSpeed: number;
  public isExploding: boolean = false;
  private explosionParticles: THREE.Points[] = [];
  private explosionAnimationFrame: number | null = null;

  constructor(scene: THREE.Scene, config: SpaceshipConfig = {}) {
    this.scene = scene;
    this.speed = config.speed || 0.02;
    this.rotationSpeed = config.rotationSpeed || 0.01;
    
    // Create the spaceship group
    this.mesh = new THREE.Group();
    
    // Create the main body
    const bodyGeometry = new THREE.CylinderGeometry(0, 1.5, 0.5, 32);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: config.color || 0x00ffcc,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    this.mesh.add(body);

    // Create the dome
    const domeGeometry = new THREE.SphereGeometry(0.75, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshPhysicalMaterial({
      color: config.color || 0x00ffcc,
      metalness: 0.9,
      roughness: 0.1,
      transmission: 0.5,
      thickness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 0.25;
    this.mesh.add(dome);

    // Add details (rings)
    const ringGeometry = new THREE.TorusGeometry(0.8, 0.1, 16, 100);
    const ringMaterial = new THREE.MeshPhysicalMaterial({
      color: config.color || 0x00ffcc,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    this.mesh.add(ring);

    // Scale the entire ship
    const size = config.size || 0.5;
    this.mesh.scale.set(size, size, size);

    // Set random initial position
    this.resetPosition();
    
    // Add to scene
    scene.add(this.mesh);
  }

  private resetPosition(): void {
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 10;
    
    this.mesh.position.x = Math.cos(angle) * radius;
    this.mesh.position.y = (Math.random() - 0.5) * 10;
    this.mesh.position.z = Math.sin(angle) * radius;
    
    this.mesh.lookAt(0, 0, 0);
    this.mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  }

  public update(): void {
    if (this.isExploding) return;

    // Move towards center
    this.mesh.position.multiplyScalar(1 - this.speed);

    // Rotate
    this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), this.rotationSpeed);

    // Reset if too close to center
    if (this.mesh.position.length() < 2) {
      this.resetPosition();
    }
  }

  public explode(): void {
    if (this.isExploding) return;
    this.isExploding = true;

    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = this.mesh.position.x;
      positions[i3 + 1] = this.mesh.position.y;
      positions[i3 + 2] = this.mesh.position.z;

      const velocity = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize().multiplyScalar(0.2);

      velocities[i3] = velocity.x;
      velocities[i3 + 1] = velocity.y;
      velocities[i3 + 2] = velocity.z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x00ffcc,
      size: 0.1,
      transparent: true
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    this.explosionParticles.push(particles);

    // Hide the original mesh
    this.mesh.visible = false;

    let frame = 0;
    const animate = () => {
      frame++;
      
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];
      }
      particles.geometry.attributes.position.needsUpdate = true;

      material.opacity = 1 - (frame / 60);

      if (frame < 60) {
        this.explosionAnimationFrame = requestAnimationFrame(animate);
      } else {
        // Clean up
        this.scene.remove(particles);
        this.explosionParticles = this.explosionParticles.filter(p => p !== particles);
        
        // Reset
        this.resetPosition();
        this.mesh.visible = true;
        this.isExploding = false;
      }
    };

    animate();
  }

  public dispose(): void {
    if (this.explosionAnimationFrame) {
      cancelAnimationFrame(this.explosionAnimationFrame);
    }

    this.explosionParticles.forEach(particles => {
      particles.geometry.dispose();
      (particles.material as THREE.PointsMaterial).dispose();
      this.scene.remove(particles);
    });

    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    this.scene.remove(this.mesh);
  }
}