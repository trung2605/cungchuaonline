import * as THREE from 'three';

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const glowTex = canvasTex(64, 64, (g, w) => {
  const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.35, 'rgba(255,240,190,0.65)');
  r.addColorStop(1, 'rgba(255,200,100,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, w, w);
});

const BIOME_PALETTES = {
  vietnam: {
    skyTop: 0x06243a,
    fog: 0x0d3b49,
    ground: 0x093842,
    lane: 0xffd166,
    sun: 0xffe299,
    skyImg: '/assets/sky_vietnam.jpg',
  },
  japan: {
    skyTop: 0x1a1033,
    fog: 0x351b39,
    ground: 0x241429,
    lane: 0xff9ebb,
    sun: 0xffb8d1,
    skyImg: '/assets/sky_world.jpg',
  },
  egypt: {
    skyTop: 0x2e1505,
    fog: 0x542c0b,
    ground: 0x6e4316,
    lane: 0xffc857,
    sun: 0xffaa33,
    skyImg: '/assets/sky_world.jpg',
  },
  france: {
    skyTop: 0x09132e,
    fog: 0x182347,
    ground: 0x121c30,
    lane: 0x7bdff2,
    sun: 0xffe6a3,
    skyImg: '/assets/sky_world.jpg',
  },
  usa: {
    skyTop: 0x05182e,
    fog: 0x0d2d4a,
    ground: 0x0a2236,
    lane: 0x48cae4,
    sun: 0x90e0ef,
    skyImg: '/assets/sky_world.jpg',
  },
  cosmos: {
    skyTop: 0x050214,
    fog: 0x100526,
    ground: 0x080217,
    lane: 0x00f5d4,
    sun: 0xf15bb5,
    skyImg: '/assets/sky_world.jpg',
  },
};

function createRoadTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#151e2e';
  g.fillRect(0, 0, 512, 512);

  // Golden outer kerbs + cyan inner glow lines
  g.fillStyle = '#f4b942';
  g.fillRect(6, 0, 10, 512);
  g.fillRect(496, 0, 10, 512);
  g.fillStyle = 'rgba(0, 245, 212, 0.5)';
  g.fillRect(20, 0, 3, 512);
  g.fillRect(489, 0, 3, 512);

  // Dashed lane dividers
  g.fillStyle = 'rgba(255, 224, 130, 0.45)';
  for (const x of [132, 256, 380]) {
    for (let y = 24; y < 512; y += 80) {
      g.fillRect(x - 2, y, 4, 32);
    }
  }

  // Subtle forward chevrons in the center lane
  g.strokeStyle = 'rgba(0, 245, 212, 0.28)';
  g.lineWidth = 5;
  for (let y = 80; y < 512; y += 160) {
    g.beginPath();
    g.moveTo(226, y + 24);
    g.lineTo(256, y);
    g.moveTo(286, y + 24);
    g.lineTo(256, y);
    g.stroke();
  }

  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 11);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function createWindowGridTexture(bgHex = '#10243d', litHex = '#ffe28a') {
  return canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = bgHex;
    g.fillRect(0, 0, w, h);
    for (let y = 14; y < h - 18; y += 22) {
      for (let x = 12; x < w - 12; x += 22) {
        g.fillStyle = ((x * 7 + y * 13) % 5 !== 0) ? litHex : 'rgba(255,255,255,0.08)';
        g.fillRect(x, y, 12, 14);
      }
    }
  });
}

const bldgWinTex = createWindowGridTexture('#122844', '#ffd97d');

// Builds a rich multi-part 3D roadside scene with animated sub-parts (`anim` callback)
function buildRoadsideScene(biomeId, side, variant, animList) {
  const g = new THREE.Group();
  const phaseOffset = variant * 1.7 + (side > 0 ? 0.9 : 0);

  if (biomeId === 'vietnam') {
    if (variant % 3 === 0) {
      // Scene A: Hoi An Ancient Yellow Shophouse + Swinging Silk Lantern Garland
      const house = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 3.4, 2.6),
        new THREE.MeshStandardMaterial({ color: 0xe8a838, roughness: 0.7 })
      );
      house.position.set(side * 2.8, 1.7, 0);
      g.add(house);
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(2.4, 1.3, 4),
        new THREE.MeshStandardMaterial({ color: 0x9e2a1b, roughness: 0.6 })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.set(side * 2.8, 3.95, 0);
      g.add(roof);
      // Warm glowing doorway
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 1.5, 0.9),
        new THREE.MeshBasicMaterial({ color: 0xffe28a })
      );
      door.position.set(side * 1.4, 0.85, 0);
      g.add(door);
      // Lantern pole with 2 swinging lanterns near road edge
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 3.6, 8),
        new THREE.MeshStandardMaterial({ color: 0x4a2210 })
      );
      pole.position.set(side * 0.2, 1.8, 0);
      g.add(pole);
      const lanternPivot = new THREE.Group();
      lanternPivot.position.set(side * 0.2, 3.4, 0);
      const lCol = variant % 2 === 0 ? 0xff2a1a : 0xffaa00;
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 12, 10),
        new THREE.MeshStandardMaterial({ color: lCol, emissive: lCol, emissiveIntensity: 1.2 })
      );
      lantern.scale.set(1, 1.25, 1);
      lantern.position.y = -0.35;
      lanternPivot.add(lantern);
      g.add(lanternPivot);
      animList.push(t => {
        lanternPivot.rotation.z = Math.sin(t * 2.2 + phaseOffset) * 0.18;
      });
    } else if (variant % 3 === 1) {
      // Scene B: Ha Long Wooden Junk Boat (Thuyền Buồm Đỏ) rocking gently in front of Karst Island
      const karst = new THREE.Mesh(
        new THREE.ConeGeometry(2.6, 7.5, 7),
        new THREE.MeshStandardMaterial({ color: 0x1f665a, roughness: 0.85 })
      );
      karst.position.set(side * 4.8, 3.4, -0.8);
      g.add(karst);

      const boat = new THREE.Group();
      boat.position.set(side * 2.1, 0.45, 0.4);
      const hull = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.48, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x6e3b1e, roughness: 0.7 })
      );
      boat.add(hull);
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 2.6, 6),
        new THREE.MeshStandardMaterial({ color: 0x4a2510 })
      );
      mast.position.set(0, 1.3, 0);
      boat.add(mast);
      const sail = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 1.8, 1.35),
        new THREE.MeshStandardMaterial({ color: 0xd92b1c, emissive: 0x4a0802, roughness: 0.5 })
      );
      sail.position.set(0, 1.45, 0.1);
      boat.add(sail);
      g.add(boat);
      animList.push(t => {
        boat.position.y = 0.45 + Math.sin(t * 1.8 + phaseOffset) * 0.14;
        boat.rotation.z = Math.sin(t * 1.5 + phaseOffset) * 0.09;
        boat.rotation.x = Math.cos(t * 1.2 + phaseOffset) * 0.06;
      });
    } else {
      // Scene C: 3-Tier Vietnamese Pagoda Tower (Tháp Chùa) + Lotus Lantern
      const tower = new THREE.Group();
      tower.position.set(side * 3.1, 0, 0);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8c2318, roughness: 0.6 });
      const roofMat = new THREE.MeshStandardMaterial({ color: 0xf0be48, emissive: 0x3d2804, metalness: 0.5, roughness: 0.3 });
      for (let tier = 0; tier < 3; tier++) {
        const s = 1.8 - tier * 0.32;
        const y = tier * 1.65;
        const box = new THREE.Mesh(new THREE.BoxGeometry(s, 1.35, s), bodyMat);
        box.position.y = y + 0.68;
        tower.add(box);
        const r = new THREE.Mesh(new THREE.ConeGeometry(s * 0.95, 0.75, 4), roofMat);
        r.rotation.y = Math.PI / 4;
        r.position.y = y + 1.55;
        tower.add(r);
      }
      g.add(tower);
    }
  } else if (biomeId === 'japan') {
    if (variant % 2 === 0) {
      // Blooming Multi-Crown Sakura Tree + Stone Lantern
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.35, 2.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x4a2818 })
      );
      trunk.position.set(side * 2.2, 1.4, 0);
      g.add(trunk);
      const blossomGroup = new THREE.Group();
      blossomGroup.position.set(side * 2.2, 3.2, 0);
      const sakuraMat = new THREE.MeshStandardMaterial({ color: 0xffa6c9, emissive: 0x4a1228, roughness: 0.5 });
      for (const [dx, dy, dz, r] of [[0, 0.3, 0, 1.35], [-0.9, -0.1, 0.4, 1.0], [0.85, 0, -0.3, 1.05]]) {
        const c = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), sakuraMat);
        c.position.set(dx, dy, dz);
        blossomGroup.add(c);
      }
      g.add(blossomGroup);
      animList.push(t => {
        blossomGroup.rotation.z = Math.sin(t * 1.6 + phaseOffset) * 0.06;
      });
    } else {
      // 5-Tier Crimson Kyoto Pagoda
      const pagoda = new THREE.Group();
      pagoda.position.set(side * 3.4, 0, 0);
      const redMat = new THREE.MeshStandardMaterial({ color: 0xc92418 });
      const darkRoof = new THREE.MeshStandardMaterial({ color: 0x262230, emissive: 0x1a0c1e });
      for (let i = 0; i < 4; i++) {
        const w = 2.0 - i * 0.3;
        const y = i * 1.45;
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, 1.15, w), redMat);
        b.position.y = y + 0.58;
        pagoda.add(b);
        const rf = new THREE.Mesh(new THREE.ConeGeometry(w * 0.98, 0.65, 4), darkRoof);
        rf.rotation.y = Math.PI / 4;
        rf.position.y = y + 1.32;
        pagoda.add(rf);
      }
      g.add(pagoda);
    }
  } else if (biomeId === 'egypt') {
    if (variant % 2 === 0) {
      // Pyramid with Floating Spinning Golden Capstone
      const pyr = new THREE.Mesh(
        new THREE.ConeGeometry(3.2, 4.6, 4),
        new THREE.MeshStandardMaterial({ color: 0xdba142, roughness: 0.65 })
      );
      pyr.rotation.y = Math.PI / 4;
      pyr.position.set(side * 4.2, 2.2, 0);
      g.add(pyr);
      const cap = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.65, 0),
        new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xcc8800, emissiveIntensity: 1.1, metalness: 0.8 })
      );
      cap.position.set(side * 4.2, 5.2, 0);
      g.add(cap);
      animList.push(t => {
        cap.rotation.y = t * 1.8 + phaseOffset;
        cap.position.y = 5.2 + Math.sin(t * 2.2 + phaseOffset) * 0.22;
      });
    } else {
      // Oasis Palm Tree + Glowing Obelisk
      const obelisk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.32, 4.2, 4),
        new THREE.MeshStandardMaterial({ color: 0xf5c869, emissive: 0x4a2c04 })
      );
      obelisk.position.set(side * 0.5, 2.1, 0);
      g.add(obelisk);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.22, 3.6, 8),
        new THREE.MeshStandardMaterial({ color: 0x6e4720 })
      );
      trunk.position.set(side * 2.6, 1.8, 0);
      g.add(trunk);
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(1.4, 0.9, 7),
        new THREE.MeshStandardMaterial({ color: 0x2d8a4e })
      );
      crown.position.set(side * 2.6, 3.7, 0);
      g.add(crown);
    }
  } else if (biomeId === 'france' || biomeId === 'usa') {
    // Illuminated City Skyscraper / Parisian Building + Glowing Streetlamp
    const h = 5.5 + (variant % 3) * 1.8;
    const bldg = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, h, 2.5),
      new THREE.MeshStandardMaterial({ map: bldgWinTex, roughness: 0.4, metalness: 0.3 })
    );
    bldg.position.set(side * 3.8, h / 2, 0);
    g.add(bldg);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.1, 3.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x283244 })
    );
    pole.position.set(side * 0.3, 1.8, 0);
    g.add(pole);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 12),
      new THREE.MeshBasicMaterial({ color: biomeId === 'france' ? 0xffe89e : 0x00f5d4 })
    );
    bulb.position.set(side * 0.3, 3.7, 0);
    g.add(bulb);
  } else {
    // Cosmos: Levitating Spinning Crystal + Orbital Ring
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.15, 0),
      new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x7209b7, emissiveIntensity: 1.1, metalness: 0.8, roughness: 0.2 })
    );
    crystal.position.set(side * 2.0, 2.6, 0);
    g.add(crystal);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.06, 8, 28),
      new THREE.MeshBasicMaterial({ color: 0xffd166 })
    );
    ring.position.set(side * 2.0, 2.6, 0);
    g.add(ring);
    animList.push(t => {
      crystal.rotation.y = t * 1.4 + phaseOffset;
      crystal.position.y = 2.6 + Math.sin(t * 2 + phaseOffset) * 0.28;
      ring.rotation.x = t * 1.1 + phaseOffset;
      ring.rotation.y = t * 0.8;
    });
  }
  return g;
}

// Builds an ornate overhead gateway spanning the highway that scrolls slowly toward the runners
function buildHighwayGateway(biomeId) {
  const g = new THREE.Group();
  const isEast = biomeId === 'vietnam' || biomeId === 'japan';
  const pillarCol = isEast ? 0xc92418 : biomeId === 'egypt' ? 0xdba142 : 0x2b4c7e;
  const roofCol = isEast ? 0xf5c242 : biomeId === 'cosmos' ? 0x00f5d4 : 0xffd166;

  const pillarMat = new THREE.MeshStandardMaterial({ color: pillarCol, emissive: 0x240402, roughness: 0.5 });
  const roofMat = new THREE.MeshStandardMaterial({ color: roofCol, emissive: 0x3d2804, metalness: 0.55, roughness: 0.3 });

  for (const x of [-5.1, 5.1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 7.6, 12), pillarMat);
    p.position.set(x, 3.8, 0);
    g.add(p);
  }
  // Double-tiered ornate crossbeam roof
  const beam1 = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.65, 1.1), roofMat);
  beam1.position.set(0, 7.4, 0);
  g.add(beam1);
  const beam2 = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.55, 1.4), pillarMat);
  beam2.position.set(0, 8.2, 0);
  g.add(beam2);

  // 4 hanging glowing lanterns under the gateway arch
  const lanternMat = new THREE.MeshStandardMaterial({ color: 0xff3b1f, emissive: 0xff2200, emissiveIntensity: 1.4 });
  for (const x of [-3.6, -1.3, 1.3, 3.6]) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10), lanternMat);
    l.scale.set(1, 1.25, 1);
    l.position.set(x, 6.75, 0);
    g.add(l);
  }
  return g;
}

// Builds a 3D Hot-Air Balloon / Giant Sky Lantern floating in the sky
function buildSkyBalloon(colorHex, accentHex) {
  const g = new THREE.Group();
  const balloon = new THREE.Mesh(
    new THREE.SphereGeometry(1.9, 16, 14),
    new THREE.MeshStandardMaterial({ color: colorHex, emissive: accentHex, emissiveIntensity: 0.45, roughness: 0.5 })
  );
  balloon.scale.set(1, 1.28, 1);
  g.add(balloon);

  const band = new THREE.Mesh(
    new THREE.TorusGeometry(1.88, 0.12, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xffd166 })
  );
  band.rotation.x = Math.PI / 2;
  g.add(band);

  const basket = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.6, 0.75),
    new THREE.MeshStandardMaterial({ color: 0x8c5220 })
  );
  basket.position.y = -2.8;
  g.add(basket);
  return g;
}

// Builds an articulated 3D Golden Dragon that flies across the sky in a figure-8 wave
function buildSkyDragon() {
  const g = new THREE.Group();
  const segments = [];
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffcf48, emissive: 0x8a4f00, emissiveIntensity: 0.7, metalness: 0.6, roughness: 0.3 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xff2a1a, emissive: 0x990f00, emissiveIntensity: 0.8 });

  for (let i = 0; i < 12; i++) {
    const seg = new THREE.Group();
    const r = i === 0 ? 0.68 : Math.max(0.22, 0.56 - i * 0.032);
    const body = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), goldMat);
    seg.add(body);
    // Dorsal crest fin
    const fin = new THREE.Mesh(new THREE.ConeGeometry(r * 0.45, r * 1.2, 4), redMat);
    fin.position.y = r * 0.85;
    seg.add(fin);
    g.add(seg);
    segments.push(seg);
  }
  return {
    group: g,
    update(t) {
      const centerX = Math.sin(t * 0.42) * 14;
      const centerY = 12.8 + Math.cos(t * 0.84) * 2.2;
      const centerZ = -28 + Math.sin(t * 0.84) * 5;
      for (let i = 0; i < segments.length; i++) {
        const lag = t - i * 0.14;
        const s = segments[i];
        s.position.set(
          Math.sin(lag * 0.42) * 14,
          12.8 + Math.cos(lag * 0.84) * 2.2 + Math.sin(lag * 3.2) * 0.35,
          -28 + Math.sin(lag * 0.84) * 5
        );
      }
      void centerX; void centerY; void centerZ;
    },
  };
}

// Builds the grand centerpiece horizon landmark for each biome at z = -42
function buildHorizonLandmark(biomeId, animList) {
  const g = new THREE.Group();
  g.position.set(0, 0, -42);

  if (biomeId === 'vietnam') {
    const karstMat = new THREE.MeshStandardMaterial({ color: 0x1b5e55, roughness: 0.8 });
    for (const [x, h, r] of [[-13, 16, 5.5], [14, 18, 6], [-23, 12, 4.5], [23, 14, 5]]) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), karstMat);
      m.position.set(x, h / 2 - 1, -6);
      g.add(m);
    }
  } else if (biomeId === 'japan') {
    const fuji = new THREE.Mesh(
      new THREE.ConeGeometry(22, 19, 24),
      new THREE.MeshStandardMaterial({ color: 0x3b4d7a, roughness: 0.7 })
    );
    fuji.position.set(0, 8.5, -14);
    g.add(fuji);
    const snow = new THREE.Mesh(
      new THREE.ConeGeometry(9.2, 7.8, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    snow.position.set(0, 14.2, -13.9);
    g.add(snow);
  } else if (biomeId === 'egypt') {
    const pyrMat = new THREE.MeshStandardMaterial({ color: 0xe0a43b, emissive: 0x2e1a03, roughness: 0.6 });
    for (const [x, s, z] of [[0, 16, -12], [-16, 12, -8], [16, 13, -9]]) {
      const p = new THREE.Mesh(new THREE.ConeGeometry(s * 0.85, s, 4), pyrMat);
      p.rotation.y = Math.PI / 4;
      p.position.set(x, s / 2 - 0.5, z);
      g.add(p);
    }
  } else if (biomeId === 'france') {
    const eiffelMat = new THREE.MeshStandardMaterial({ color: 0xdba858, emissive: 0x4a320a, wireframe: true });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 6.5, 10, 4, 4), eiffelMat);
    base.rotation.y = Math.PI / 4;
    base.position.set(0, 5, -8);
    g.add(base);
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 2.6, 13, 4, 6), eiffelMat);
    spire.rotation.y = Math.PI / 4;
    spire.position.set(0, 16.5, -8);
    g.add(spire);
    // Rotating searchlight cone at the top of Eiffel Tower
    const beamPivot = new THREE.Group();
    beamPivot.position.set(0, 22.8, -8);
    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(3.2, 18, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffe899, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })
    );
    beam.rotation.z = Math.PI / 2;
    beam.position.x = 9;
    beamPivot.add(beam);
    g.add(beamPivot);
    animList.push(t => {
      beamPivot.rotation.y = t * 0.85;
    });
  } else if (biomeId === 'usa') {
    const gateMat = new THREE.MeshStandardMaterial({ color: 0xc93b2b, emissive: 0x330a05 });
    for (const x of [-5.4, 5.4]) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.9, 14, 0.9), gateMat);
      t.position.set(x, 7.0, 10);
      g.add(t);
    }
    for (const y of [7.2, 10.2, 13.0]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.45, 0.6), gateMat);
      beam.position.set(0, y, 10);
      g.add(beam);
    }
  } else {
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(9, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x7209b7, emissive: 0x240046, roughness: 0.4 })
    );
    planet.position.set(0, 13, -15);
    g.add(planet);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(11.5, 16, 48),
      new THREE.MeshBasicMaterial({ color: 0x00f5d4, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
    );
    ring.rotation.x = Math.PI / 2.6;
    ring.rotation.y = 0.3;
    ring.position.set(0, 13, -15);
    g.add(ring);
    animList.push(t => {
      ring.rotation.z = t * 0.4;
    });
  }
  return g;
}

export function buildRaceWorld(scene) {
  scene.background = new THREE.Color(0x06243a);
  scene.fog = new THREE.FogExp2(0x0d3b49, 0.012);

  const hemi = new THREE.HemisphereLight(0xffeedd, 0x1a283b, 1.45);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xfff0cc, 1.85);
  dir.position.set(8, 18, 12);
  dir.castShadow = true;
  scene.add(dir);

  // Nano Banana Panoramic Sky Backdrop Plane on the distant horizon (fog-exempt so it glows vividly)
  const texLoader = new THREE.TextureLoader();
  const skyTextures = {};
  for (const url of ['/assets/sky_vietnam.jpg', '/assets/sky_world.jpg']) {
    const t = texLoader.load(url);
    t.colorSpace = THREE.SRGBColorSpace;
    skyTextures[url] = t;
  }
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTextures['/assets/sky_vietnam.jpg'],
    fog: false,
    transparent: true,
    opacity: 0.92,
  });
  const skyBackdrop = new THREE.Mesh(new THREE.PlaneGeometry(96, 42), skyMat);
  skyBackdrop.position.set(0, 15.5, -58);
  scene.add(skyBackdrop);

  // Glowing sun/moon halo
  const sunOrb = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, color: 0xffe299, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  sunOrb.scale.setScalar(22);
  sunOrb.position.set(0, 15, -52);
  scene.add(sunOrb);

  // Ground / Water plane
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x093842, roughness: 0.75, metalness: 0.15 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.05, -20);
  scene.add(ground);

  // Endless 7-lane adventure highway (width 9.6m, length 95m)
  const roadTex = createRoadTexture();
  const roadMat = new THREE.MeshStandardMaterial({
    map: roadTex,
    roughness: 0.55,
    metalness: 0.15,
  });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 95), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.01, -18);
  road.receiveShadow = true;
  scene.add(road);

  // Glowing side guardrails
  const railMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
  for (const x of [-4.9, 4.9]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 95), railMat);
    rail.position.set(x, 0.1, -18);
    scene.add(rail);
  }

  // Persistent Animated 3D Sky Actors: Soaring Golden Dragon + 4 Floating Hot-Air Balloons
  const dragon = buildSkyDragon();
  scene.add(dragon.group);

  const balloons = [
    { mesh: buildSkyBalloon(0xff3b2f, 0xffaa00), baseX: -14, baseY: 11.5, baseZ: -26, speed: 0.7, phase: 0.2 },
    { mesh: buildSkyBalloon(0x00b4d8, 0x00f5d4), baseX: 15, baseY: 13.0, baseZ: -32, speed: 0.55, phase: 1.8 },
    { mesh: buildSkyBalloon(0xffbe0b, 0xff5400), baseX: -9, baseY: 15.2, baseZ: -38, speed: 0.65, phase: 3.4 },
    { mesh: buildSkyBalloon(0x9b5de5, 0xf15bb5), baseX: 11, baseY: 10.2, baseZ: -20, speed: 0.8, phase: 4.7 },
  ];
  for (const b of balloons) {
    b.mesh.position.set(b.baseX, b.baseY, b.baseZ);
    scene.add(b.mesh);
  }

  // Scrolling roadside props & overhead highway archways
  const propsGroup = new THREE.Group();
  scene.add(propsGroup);
  let horizonGroup = null;
  let currentBiomeId = '';
  const propRows = [];
  const gateRows = [];
  const animCallbacks = [];
  let elapsed = 0;

  function rebuildBiomeScenery(biomeId) {
    if (biomeId === currentBiomeId) return;
    currentBiomeId = biomeId;
    const pal = BIOME_PALETTES[biomeId] || BIOME_PALETTES.vietnam;
    scene.background.setHex(pal.skyTop);
    scene.fog.color.setHex(pal.fog);
    groundMat.color.setHex(pal.ground);
    railMat.color.setHex(pal.lane);
    sunOrb.material.color.setHex(pal.sun);
    if (skyTextures[pal.skyImg]) {
      skyMat.map = skyTextures[pal.skyImg];
      skyMat.needsUpdate = true;
    }

    while (propsGroup.children.length) propsGroup.remove(propsGroup.children[0]);
    propRows.length = 0;
    gateRows.length = 0;
    animCallbacks.length = 0;

    // 12 rich roadside diorama rows spaced every 6.2m
    for (let i = 0; i < 12; i++) {
      const row = new THREE.Group();
      row.position.z = 16 - i * 6.2;
      const leftProp = buildRoadsideScene(biomeId, -1, i, animCallbacks);
      leftProp.position.x = -5.5;
      const rightProp = buildRoadsideScene(biomeId, 1, i + 1, animCallbacks);
      rightProp.position.x = 5.5;
      row.add(leftProp, rightProp);
      propsGroup.add(row);
      propRows.push(row);
    }

    // 2 grand overhead highway gateways scrolling slowly over the road
    for (let gIdx = 0; gIdx < 2; gIdx++) {
      const gate = buildHighwayGateway(biomeId);
      gate.position.z = -6 - gIdx * 36;
      propsGroup.add(gate);
      gateRows.push(gate);
    }

    if (horizonGroup) scene.remove(horizonGroup);
    horizonGroup = buildHorizonLandmark(biomeId, animCallbacks);
    scene.add(horizonGroup);
  }

  rebuildBiomeScenery('vietnam');

  return {
    setBiome(biomeId) {
      rebuildBiomeScenery(biomeId || 'vietnam');
    },
    update(dt, speedMult = 1.0) {
      elapsed += dt;
      // Slower, majestic journey scroll (~3.4x slower than before so 3D scenes can be admired!)
      const scroll = dt * 3.2 * speedMult;
      roadTex.offset.y -= scroll * 0.12;

      for (const row of propRows) {
        row.position.z += scroll;
        if (row.position.z > 19) {
          row.position.z -= 12 * 6.2;
        }
      }
      for (const gate of gateRows) {
        gate.position.z += scroll;
        if (gate.position.z > 19) {
          gate.position.z -= 72;
        }
      }

      // Update soaring 3D Golden Dragon, floating Hot-Air Balloons, and animated biome props
      dragon.update(elapsed);
      for (const b of balloons) {
        b.mesh.position.y = b.baseY + Math.sin(elapsed * b.speed + b.phase) * 0.9;
        b.mesh.position.x = b.baseX + Math.cos(elapsed * b.speed * 0.6 + b.phase) * 1.4;
        b.mesh.rotation.y = elapsed * 0.35 + b.phase;
      }
      for (const fn of animCallbacks) fn(elapsed);
    },
  };
}
