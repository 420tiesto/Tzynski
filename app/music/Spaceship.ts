// Spaceship.ts
import * as THREE from 'three';

export class Spaceship {
    mesh: THREE.Group;
    velocity: THREE.Vector3;
    rotationSpeed: THREE.Vector3;
    isExploding: boolean = false;
    private explosionParticles: { mesh: THREE.Points; geometry: THREE.BufferGeometry; material: THREE.PointsMaterial }[] = [];
  
  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.Group();
    this.velocity = new THREE.Vector3();
    this.rotationSpeed = new THREE.Vector3(
      Math.random() * 0.02 - 0.01,
      Math.random() * 0.02 - 0.01,
      Math.random() * 0.02 - 0.01
    );

    // Create UFO body
    const bodyGeometry = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.2,
      transmission: 0.5,
      thickness: 0.5,
      envMapIntensity: 1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Create dome
    const domeGeometry = new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.5,
      envMapIntensity: 1
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 0.3;

    // Create glow ring
    const ringGeometry = new THREE.TorusGeometry(1.2, 0.1, 16, 50);
    const ringMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00ffcc,
      emissive: 0x00ffcc,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI * 0.5;

    this.mesh.add(body, dome, ring);
    this.mesh.scale.set(0.4, 0.4, 0.4);

    this.reset();
    scene.add(this.mesh);
  }

  reset() {
    const side = Math.floor(Math.random() * 4);
    const distance = 30;
    
    switch(side) {
      case 0: // Right
        this.mesh.position.set(distance, Math.random() * 10 - 5, Math.random() * 10 - 5);
        this.velocity.set(-0.1 - Math.random() * 0.1, 0, 0);
        break;
      case 1: // Left
        this.mesh.position.set(-distance, Math.random() * 10 - 5, Math.random() * 10 - 5);
        this.velocity.set(0.1 + Math.random() * 0.1, 0, 0);
        break;
      case 2: // Top
        this.mesh.position.set(Math.random() * 20 - 10, distance, Math.random() * 10 - 5);
        this.velocity.set(0, -0.1 - Math.random() * 0.1, 0);
        break;
      case 3: // Bottom
        this.mesh.position.set(Math.random() * 20 - 10, -distance, Math.random() * 10 - 5);
        this.velocity.set(0, 0.1 + Math.random() * 0.1, 0);
        break;
    }

    this.velocity.y += Math.random() * 0.02 - 0.01;
    this.velocity.z += Math.random() * 0.02 - 0.01;
  }

  explode(scene: THREE.Scene) {
    if (this.isExploding) return;
    this.isExploding = true;
    this.mesh.visible = false;

    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = this.mesh.position.x;
      positions[i3 + 1] = this.mesh.position.y;
      positions[i3 + 2] = this.mesh.position.z;

      velocities[i3] = (Math.random() - 0.5) * 0.3;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.3;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.3;

      colors[i3] = Math.random() * 0.5 + 0.5;
      colors[i3 + 1] = Math.random() * 0.5 + 0.5;
      colors[i3 + 2] = 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    this.explosionParticles.push({
      mesh: particles,
      geometry: geometry,
      material: material
    });

    setTimeout(() => {
      this.isExploding = false;
      this.mesh.visible = true;
      this.reset();
      
      this.explosionParticles.forEach(({ mesh, geometry, material }) => {
        scene.remove(mesh);
        geometry.dispose();
        material.dispose();
      });
      this.explosionParticles = [];
    }, 2000);
  }

  update() {
    if (!this.isExploding) {
      this.mesh.position.add(this.velocity);
      this.mesh.rotation.x += this.rotationSpeed.x;
      this.mesh.rotation.y += this.rotationSpeed.y;
      this.mesh.rotation.z += this.rotationSpeed.z;

      if (Math.abs(this.mesh.position.x) > 40 || 
          Math.abs(this.mesh.position.y) > 40 || 
          Math.abs(this.mesh.position.z) > 40) {
        this.reset();
      }
    }

    this.explosionParticles.forEach(({ mesh }) => {
      const positions = mesh.geometry.attributes.position;
      const velocities = mesh.geometry.attributes.velocity;
      
      for (let i = 0; i < positions.count; i++) {
        positions.setXYZ(
          i,
          positions.getX(i) + velocities.getX(i),
          positions.getY(i) + velocities.getY(i),
          positions.getZ(i) + velocities.getZ(i)
        );
      }
      positions.needsUpdate = true;
    });
  }

  dispose() {
    this.mesh.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        (object.material as THREE.Material).dispose();
      }
    });
    
    this.explosionParticles.forEach(({ mesh, geometry, material }) => {
      geometry.dispose();
      material.dispose();
    });
  }
}