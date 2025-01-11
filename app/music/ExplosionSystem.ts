import * as THREE from 'three';

export class ExplosionSystem {
  private scene: THREE.Scene;
  private parentObject: THREE.Mesh;
  private particles: THREE.Points[] = [];
  private animationFrame: number | null = null;

  constructor(scene: THREE.Scene, parentObject: THREE.Mesh) {
    this.scene = scene;
    this.parentObject = parentObject;
  }

  public explode(position: THREE.Vector3): void {
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: number[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = position.x;
      positions[i3 + 1] = position.y;
      positions[i3 + 2] = position.z;

      const velocity = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize().multiplyScalar(0.2);

      velocities.push(velocity.x, velocity.y, velocity.z);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x00ffcc,
      size: 0.1,
      transparent: true
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.particles.push(points);
    this.parentObject.visible = false;

    let frame = 0;
    const animate = () => {
      frame++;
      const positions = points.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const vi3 = i * 3;
        positions[i3] += velocities[vi3];
        positions[i3 + 1] += velocities[vi3 + 1];
        positions[i3 + 2] += velocities[vi3 + 2];
      }

      points.geometry.attributes.position.needsUpdate = true;
      material.opacity = 1 - (frame / 60);

      if (frame < 60) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.scene.remove(points);
        this.particles = this.particles.filter(p => p !== points);
        this.parentObject.visible = true;
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame);
        }
      }
    };

    animate();
  }

  public update(): void {
    // Update method can be used for continuous particle effects
  }

  public dispose(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.particles.forEach(particles => {
      particles.geometry.dispose();
      (particles.material as THREE.PointsMaterial).dispose();
      this.scene.remove(particles);
    });
  }
}