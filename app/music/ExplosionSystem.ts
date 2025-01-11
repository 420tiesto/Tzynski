import * as THREE from 'three';

export class ExplosionSystem {
  private fragments: THREE.Mesh[] = [];
  private scene: THREE.Scene;
  private geometry: THREE.BufferGeometry;
  private material: THREE.MeshPhysicalMaterial;
  private originalPosition: THREE.Vector3;
  private isReforming: boolean = false;
  private mesh: THREE.Mesh;
  
  constructor(scene: THREE.Scene, mesh: THREE.Mesh, fragmentCount: number = 30) {
    this.scene = scene;
    this.mesh = mesh;
    this.originalPosition = mesh.position.clone();
    
    // Create fragment geometry
    this.geometry = new THREE.TetrahedronGeometry(0.1);
    
    // Clone the letter's material for fragments
    this.material = (mesh.material as THREE.MeshPhysicalMaterial).clone();
    this.material.emissiveIntensity = 1;
    
    // Create fragments
    for (let i = 0; i < fragmentCount; i++) {
      const fragment = new THREE.Mesh(this.geometry, this.material);
      fragment.userData.velocity = new THREE.Vector3();
      fragment.userData.rotationVelocity = new THREE.Vector3(
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.1 - 0.05
      );
      fragment.userData.originalPosition = new THREE.Vector3();
      this.fragments.push(fragment);
    }
  }

  explode(position: THREE.Vector3) {
    this.mesh.visible = false;
    this.isReforming = false;
    
    this.fragments.forEach(fragment => {
      // Store original position for reforming
      fragment.userData.originalPosition.copy(position);
      
      // Reset fragment to explosion center
      fragment.position.copy(position);
      fragment.scale.set(1, 1, 1);
      
      // Random explosion velocity
      const velocity = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize().multiplyScalar(0.2);
      
      fragment.userData.velocity.copy(velocity);
      this.scene.add(fragment);
    });

    // Start reform after delay
    setTimeout(() => {
      this.isReforming = true;
    }, 2000);
  }

  update(delta: number) {
    if (this.isReforming) {
      let allReformed = true;
      
      this.fragments.forEach(fragment => {
        if (!fragment.parent) return;
        
        const targetPos = fragment.userData.originalPosition;
        const distance = fragment.position.distanceTo(targetPos);
        
        if (distance > 0.01) {
          fragment.position.lerp(targetPos, 0.1);
          fragment.scale.multiplyScalar(0.95);
          allReformed = false;
        } else {
          this.scene.remove(fragment);
        }
      });
      
      if (allReformed) {
        this.mesh.visible = true;
        this.isReforming = false;
      }
      
      return !allReformed;
    }
    
    let active = false;
    
    this.fragments.forEach(fragment => {
      if (!fragment.parent) return;
      
      // Update position
      fragment.position.add(fragment.userData.velocity);
      
      // Update rotation
      fragment.rotation.x += fragment.userData.rotationVelocity.x;
      fragment.rotation.y += fragment.userData.rotationVelocity.y;
      fragment.rotation.z += fragment.userData.rotationVelocity.z;
      
      // Apply gravity
      fragment.userData.velocity.y -= 0.01;
      
      // Remove if too far
      if (fragment.position.y < -10) {
        this.scene.remove(fragment);
      } else {
        active = true;
      }
    });
    
    return active;
  }
  
  dispose() {
    this.fragments.forEach(fragment => {
      if (fragment.parent) this.scene.remove(fragment);
    });
    this.geometry.dispose();
    this.material.dispose();
  }
}