class BounceEffect {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.active = true;
  }
  
  createBounceEffect(position) {
    const count = 8;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 0.2;
      
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;
      
      const color = new THREE.Color(0xffaa44);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      this.particles.push({
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          speed * 0.5,
          Math.sin(angle) * speed
        ),
        life: 1.0,
        maxLife: 1.0
      });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const points = new THREE.Points(geometry, material);
    points.userData = this.particles.slice(-count);
    
    this.scene.add(points);
    return points;
  }
  
  update(deltaTime) {
    // Обновляем существующие эффекты
    this.scene.children.forEach(child => {
      if (child.isPoints && child.userData && child.userData.length) {
        const positions = child.geometry.attributes.position.array;
        const particles = child.userData;
        
        let allDead = true;
        
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.life -= deltaTime * 2;
          
          if (p.life > 0) {
            allDead = false;
            
            // Обновляем позицию
            positions[i * 3] += p.velocity.x * deltaTime * 20;
            positions[i * 3 + 1] += p.velocity.y * deltaTime * 20;
            positions[i * 3 + 2] += p.velocity.z * deltaTime * 20;
            
            // Замедляем
            p.velocity.multiplyScalar(0.98);
          } else {
            // Прячем мертвые частицы
            positions[i * 3 + 1] = -1000;
          }
        }
        
        child.geometry.attributes.position.needsUpdate = true;
        child.material.opacity = particles[0]?.life || 0;
        
        // Удаляем, если все частицы мертвы
        if (allDead) {
          this.scene.remove(child);
          child.geometry.dispose();
          child.material.dispose();
        }
      }
    });
  }
}