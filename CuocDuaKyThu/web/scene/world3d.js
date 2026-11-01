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
    skyTop: 0x162b33,
    fog: 0x243b40,
    ground: 0x1d3633,
    lane: 0xbfa06a,
    sun: 0xf4dca8,
    skyImg: '/assets/sky_vietnam.jpg',
  },
  japan: {
    skyTop: 0x241d2e,
    fog: 0x382b3a,
    ground: 0x29222b,
    lane: 0xc9a39b,
    sun: 0xf5d6cb,
    skyImg: '/assets/sky_japan.jpg',
  },
  egypt: {
    skyTop: 0x332214,
    fog: 0x523821,
    ground: 0x694b2a,
    lane: 0xcfa763,
    sun: 0xf2c278,
    skyImg: '/assets/sky_egypt.jpg',
  },
  france: {
    skyTop: 0x172030,
    fog: 0x253247,
    ground: 0x1d2636,
    lane: 0xb8a98a,
    sun: 0xf2DFB6,
    skyImg: '/assets/sky_europe.jpg',
  },
  usa: {
    skyTop: 0x162436,
    fog: 0x24384d,
    ground: 0x1b2a38,
    lane: 0xb0a48c,
    sun: 0xe8d8b8,
    skyImg: '/assets/sky_europe.jpg',
  },
  cosmos: {
    skyTop: 0x141624,
    fog: 0x212438,
    ground: 0x181a29,
    lane: 0xc4b082,
    sun: 0xe8d5b5,
    skyImg: '/assets/sky_world.jpg',
  },
};

// Realistic Warm Heritage Stone-Paved Walking Trail Texture (`Con Đường Lát Đá Cổ & Cỏ Hoa Ven Đường`)
// Replaces the dark car-highway asphalt & speed chevrons with natural cobblestone/flagstone tiles
function createScenicTrailTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d');

  // Lush mossy grass shoulders on left and right edges (0..38 and 474..512)
  g.fillStyle = '#1f4d36';
  g.fillRect(0, 0, 512, 512);

  // Warm sandstone / cobblestone base mortar in the center walking trail (38..474)
  const mortarGrad = g.createLinearGradient(38, 0, 474, 0);
  mortarGrad.addColorStop(0, '#4a3d31');
  mortarGrad.addColorStop(0.12, '#695846');
  mortarGrad.addColorStop(0.5, '#7a6752');
  mortarGrad.addColorStop(0.88, '#695846');
  mortarGrad.addColorStop(1, '#4a3d31');
  g.fillStyle = mortarGrad;
  g.fillRect(38, 0, 436, 512);

  // Carved stone border kerbs along both sides of the walking trail
  for (let y = 0; y < 512; y += 32) {
    g.fillStyle = (y / 32) % 2 === 0 ? '#d9a75a' : '#c28e42';
    g.fillRect(30, y + 2, 16, 28);
    g.fillRect(466, y + 2, 16, 28);
  }

  // Natural flagstone / cobblestone pavers across the trail width
  const stonePalette = ['#8c765c', '#998266', '#7d6850', '#a38b6d', '#857058', '#917a5f'];
  const rows = 16;
  const rowH = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    const xOffset = (r % 2) * 24;
    let x = 50 - xOffset;
    let colIdx = 0;
    while (x < 460) {
      const w = 44 + ((r * 13 + colIdx * 19) % 22);
      const drawX = Math.max(50, x);
      const drawW = Math.min(460, x + w - 4) - drawX;
      if (drawW > 8) {
        g.fillStyle = stonePalette[(r * 7 + colIdx * 5) % stonePalette.length];
        g.beginPath();
        g.roundRect(drawX, y + 2, drawW, rowH - 4, 6);
        g.fill();
        // Subtle warm top highlight on each stone slab
        g.fillStyle = 'rgba(255, 244, 214, 0.14)';
        g.fillRect(drawX + 3, y + 4, drawW - 6, 3);
      }
      x += w;
      colIdx++;
    }
  }

  // Center heritage medallion mosaic inlay strip (subtle ornamental golden stone pattern)
  g.strokeStyle = 'rgba(255, 218, 128, 0.35)';
  g.lineWidth = 2.5;
  for (let y = 32; y < 512; y += 64) {
    g.beginPath();
    g.arc(256, y, 14, 0, Math.PI * 2);
    g.stroke();
  }

  // Wildflowers & grass tufts along the outer trail shoulders
  const flowerCols = ['#ffd166', '#ff758f', '#ffffff', '#ffb703'];
  for (let i = 0; i < 60; i++) {
    const sideX = i % 2 === 0 ? 6 + ((i * 17) % 20) : 486 + ((i * 19) % 20);
    const fy = (i * 29) % 512;
    g.fillStyle = '#2d6a4f';
    g.beginPath();
    g.arc(sideX, fy, 5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = flowerCols[i % flowerCols.length];
    g.beginPath();
    g.arc(sideX, fy, 2.4, 0, Math.PI * 2);
    g.fill();
  }

  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 10);
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

// Builds a lush roadside cluster of 3D grass bushes, wildflowers, and stepping stones along the trail border
function buildTrailsideFoliage(side, variant) {
  const g = new THREE.Group();
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x36593e, roughness: 0.88 });
  const flowerColors = [0xe8d59e, 0xdba89a, 0xf2ead8, 0xd4b483];
  const fMat = new THREE.MeshStandardMaterial({
    color: flowerColors[variant % flowerColors.length],
    roughness: 0.75,
  });

  for (let i = 0; i < 3; i++) {
    const zOff = (i - 1) * 1.6;
    const r = 0.38 + ((variant + i) % 3) * 0.12;
    const bush = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), bushMat);
    bush.scale.set(1.2, 0.75, 1.1);
    bush.position.set(side * (0.1 + (i % 2) * 0.35), r * 0.5, zOff);
    g.add(bush);

    const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), fMat);
    blossom.position.set(bush.position.x - side * 0.1, r * 0.85, zOff + 0.1);
    g.add(blossom);
  }
  return g;
}

// Builds a rich multi-part 3D roadside scene with animated sub-parts (`anim` callback)
function buildRoadsideScene(biomeId, side, variant, animList) {
  const g = new THREE.Group();
  const phaseOffset = variant * 1.7 + (side > 0 ? 0.9 : 0);

  // Always add lush trailside bushes & flowers right along the stone border
  g.add(buildTrailsideFoliage(side, variant));

  if (biomeId === 'vietnam') {
    if (variant % 3 === 0) {
      // Scene A: Hoi An Ancient Yellow Heritage House + Swinging Silk Lantern Garland + Bamboo Grove
      const house = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 3.4, 2.6),
        new THREE.MeshStandardMaterial({ color: 0xe8a838, roughness: 0.7 })
      );
      house.position.set(side * 2.9, 1.7, 0);
      g.add(house);
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(2.45, 1.35, 4),
        new THREE.MeshStandardMaterial({ color: 0x9e2a1b, roughness: 0.6 })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.set(side * 2.9, 3.95, 0);
      g.add(roof);
      // Warm glowing doorway
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 1.5, 0.9),
        new THREE.MeshBasicMaterial({ color: 0xffe28a })
      );
      door.position.set(side * 1.5, 0.85, 0);
      g.add(door);
      // Lantern pole with swinging silk lantern near trail edge
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 3.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x4a2210 })
      );
      pole.position.set(side * 0.25, 1.75, 0);
      g.add(pole);
      const lanternPivot = new THREE.Group();
      lanternPivot.position.set(side * 0.25, 3.35, 0);
      const lCol = variant % 2 === 0 ? 0xff2a1a : 0xffaa00;
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 12, 10),
        new THREE.MeshStandardMaterial({ color: lCol, emissive: lCol, emissiveIntensity: 1.2 })
      );
      lantern.scale.set(1, 1.25, 1);
      lantern.position.y = -0.35;
      lanternPivot.add(lantern);
      g.add(lanternPivot);
      animList.push(t => {
        lanternPivot.rotation.z = Math.sin(t * 2.0 + phaseOffset) * 0.16;
      });
    } else if (variant % 3 === 1) {
      // Scene B: Ha Long Wooden Junk Boat (Thuyền Buồm Đỏ) rocking gently in front of Karst Island
      const karst = new THREE.Mesh(
        new THREE.ConeGeometry(2.8, 7.8, 7),
        new THREE.MeshStandardMaterial({ color: 0x1f665a, roughness: 0.85 })
      );
      karst.position.set(side * 4.8, 3.5, -0.8);
      g.add(karst);

      const boat = new THREE.Group();
      boat.position.set(side * 2.2, 0.45, 0.4);
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
        boat.position.y = 0.45 + Math.sin(t * 1.6 + phaseOffset) * 0.14;
        boat.rotation.z = Math.sin(t * 1.3 + phaseOffset) * 0.08;
        boat.rotation.x = Math.cos(t * 1.1 + phaseOffset) * 0.05;
      });
    } else {
      // Scene C: 3-Tier Vietnamese Pagoda Tower (Tháp Chùa Cổ) + Glowing Lotus Pond
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
      // Blooming Multi-Crown Sakura Tree + Traditional Stone Tōrō Lantern
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
        blossomGroup.rotation.z = Math.sin(t * 1.4 + phaseOffset) * 0.05;
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
        cap.rotation.y = t * 1.5 + phaseOffset;
        cap.position.y = 5.2 + Math.sin(t * 2.0 + phaseOffset) * 0.22;
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
    // Illuminated Parisian / New York Heritage Building + Warm Boulevard Streetlamp
    const h = 5.2 + (variant % 3) * 1.6;
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
      new THREE.SphereGeometry(0.26, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xf5deb3 })
    );
    bulb.position.set(side * 0.3, 3.7, 0);
    g.add(bulb);
  } else {
    // Ancient Stone Milestone Obelisk + Warm Lantern
    const obelisk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.45, 3.8, 6),
      new THREE.MeshStandardMaterial({ color: 0x8c7d6b, roughness: 0.85 })
    );
    obelisk.position.set(side * 2.2, 1.9, 0);
    g.add(obelisk);
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xf2d08a, emissive: 0x8c6220, emissiveIntensity: 0.6 })
    );
    lantern.position.set(side * 2.2, 4.1, 0);
    g.add(lantern);
  }
  return g;
}

// Builds an ornate overhead gateway spanning the walking trail that scrolls gently toward the trekkers
function buildHighwayGateway(biomeId) {
  const g = new THREE.Group();
  const isEast = biomeId === 'vietnam' || biomeId === 'japan';
  const pillarCol = isEast ? 0x7a2e22 : biomeId === 'egypt' ? 0xb5894c : 0x4a5568;
  const roofCol = isEast ? 0xc2964b : 0xb89962;

  const pillarMat = new THREE.MeshStandardMaterial({ color: pillarCol, roughness: 0.72 });
  const roofMat = new THREE.MeshStandardMaterial({ color: roofCol, metalness: 0.25, roughness: 0.55 });

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

  // 4 hanging warm silk lanterns under the gateway arch
  const lanternMat = new THREE.MeshStandardMaterial({ color: 0xe6a145, emissive: 0x995510, emissiveIntensity: 0.75 });
  for (const x of [-3.6, -1.3, 1.3, 3.6]) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10), lanternMat);
    l.scale.set(1, 1.25, 1);
    l.position.set(x, 6.75, 0);
    g.add(l);
  }
  return g;
}

// Builds a 3D Hot-Air Balloon / Heritage Sky Lantern floating in the sky (warm earthy canvas tones)
function buildSkyBalloon(colorHex, accentHex) {
  const g = new THREE.Group();
  const balloon = new THREE.Mesh(
    new THREE.SphereGeometry(1.75, 16, 14),
    new THREE.MeshStandardMaterial({ color: colorHex, emissive: accentHex, emissiveIntensity: 0.22, roughness: 0.7 })
  );
  balloon.scale.set(1, 1.28, 1);
  g.add(balloon);

  const band = new THREE.Mesh(
    new THREE.TorusGeometry(1.72, 0.09, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0xc9a76a, roughness: 0.6 })
  );
  band.rotation.x = Math.PI / 2;
  g.add(band);

  const basket = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.55, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.8 })
  );
  basket.position.y = -2.6;
  g.add(basket);
  return g;
}

// Builds an articulated 3D Flock of White Cranes / Birds (`Đàn Hạc Trắng Bay Lượn`) with flapping wings
function buildFlockOfCranes() {
  const group = new THREE.Group();
  const birdMat = new THREE.MeshBasicMaterial({ color: 0xfff8eb, side: THREE.DoubleSide });
  const wingGeo = new THREE.BoxGeometry(0.48, 0.03, 0.22);
  const birds = [];

  const offsets = [
    [0, 0, 0],
    [-1.6, 0.4, 1.1],
    [1.6, 0.35, 1.0],
    [-3.1, 0.75, 2.2],
    [3.1, 0.7, 2.1],
  ];

  for (let i = 0; i < offsets.length; i++) {
    const bGroup = new THREE.Group();
    const [ox, oy, oz] = offsets[i];
    bGroup.position.set(ox, oy, oz);

    const body = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 6), birdMat);
    body.rotation.x = -Math.PI / 2;
    bGroup.add(body);

    const leftWing = new THREE.Mesh(wingGeo, birdMat);
    leftWing.position.set(-0.22, 0, 0);
    const rightWing = new THREE.Mesh(wingGeo, birdMat);
    rightWing.position.set(0.22, 0, 0);
    bGroup.add(leftWing, rightWing);

    group.add(bGroup);
    birds.push({ bGroup, leftWing, rightWing, phase: i * 0.7 });
  }

  return {
    group,
    update(t) {
      // Gentle circular soaring across the upper sky
      group.position.set(
        Math.cos(t * 0.28) * 12,
        10.5 + Math.sin(t * 0.55) * 1.4,
        -22 + Math.sin(t * 0.28) * 6
      );
      group.rotation.y = -t * 0.28;
      for (const b of birds) {
        const flap = Math.sin(t * 5.2 + b.phase) * 0.55;
        b.leftWing.rotation.z = flap;
        b.rightWing.rotation.z = -flap;
      }
    },
  };
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
      for (let i = 0; i < segments.length; i++) {
        const lag = t - i * 0.14;
        const s = segments[i];
        s.position.set(
          Math.sin(lag * 0.36) * 14,
          13.2 + Math.cos(lag * 0.72) * 2.0 + Math.sin(lag * 2.8) * 0.32,
          -30 + Math.sin(lag * 0.72) * 5
        );
      }
    },
  };
}

// Builds the grand centerpiece horizon landmark for each biome at z = -42
function buildHorizonLandmark(biomeId, animList) {
  const g = new THREE.Group();
  g.position.set(0, 0, -42);

  if (biomeId === 'vietnam') {
    const karstMat = new THREE.MeshStandardMaterial({ color: 0x1b5e55, roughness: 0.8 });
    for (const [x, h, r] of [[-14, 15, 5.5], [15, 17, 6], [-23, 12, 4.5], [23, 14, 5]]) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), karstMat);
      m.position.set(x, h / 2 - 1, -6);
      g.add(m);
    }
  } else if (biomeId === 'japan') {
    const fuji = new THREE.Mesh(
      new THREE.ConeGeometry(22, 18, 24),
      new THREE.MeshStandardMaterial({ color: 0x3b4d7a, roughness: 0.7 })
    );
    fuji.position.set(0, 8.0, -15);
    g.add(fuji);
    const snow = new THREE.Mesh(
      new THREE.ConeGeometry(9.2, 7.5, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    snow.position.set(0, 13.6, -14.9);
    g.add(snow);
  } else if (biomeId === 'egypt') {
    const pyrMat = new THREE.MeshStandardMaterial({ color: 0xe0a43b, emissive: 0x2e1a03, roughness: 0.6 });
    for (const [x, s, z] of [[0, 15, -13], [-16, 12, -8], [16, 13, -9]]) {
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
      beamPivot.rotation.y = t * 0.75;
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
      ring.rotation.z = t * 0.35;
    });
  }
  return g;
}

export function buildRaceWorld(scene) {
  scene.background = new THREE.Color(0x0a2c3d);
  scene.fog = new THREE.FogExp2(0x124554, 0.0095);

  const hemi = new THREE.HemisphereLight(0xfff4e0, 0x1d3244, 1.55);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xfff0cc, 1.9);
  dir.position.set(8, 18, 12);
  dir.castShadow = true;
  scene.add(dir);

  // Nano Banana Panoramic Sky Backdrop Plane on the distant horizon (fog-exempt so every landmark painting shines)
  const texLoader = new THREE.TextureLoader();
  const skyTextures = {};
  for (const url of [
    '/assets/sky_vietnam.jpg',
    '/assets/sky_japan.jpg',
    '/assets/sky_egypt.jpg',
    '/assets/sky_europe.jpg',
    '/assets/sky_world.jpg',
  ]) {
    const t = texLoader.load(url);
    t.colorSpace = THREE.SRGBColorSpace;
    skyTextures[url] = t;
  }
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTextures['/assets/sky_vietnam.jpg'],
    fog: false,
    transparent: true,
    opacity: 0.96,
  });
  const skyBackdrop = new THREE.Mesh(new THREE.PlaneGeometry(104, 46), skyMat);
  skyBackdrop.position.set(0, 16.0, -56);
  scene.add(skyBackdrop);

  // Glowing sun/moon halo
  const sunOrb = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, color: 0xffe299, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  sunOrb.scale.setScalar(20);
  sunOrb.position.set(0, 15, -52);
  scene.add(sunOrb);

  // Ground / Water plane flanking the walking trail
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0b424d, roughness: 0.65, metalness: 0.22 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.05, -20);
  scene.add(ground);

  // Endless Scenic Stone-Paved Heritage Walking Trail (width 9.6m, length 95m)
  const roadTex = createScenicTrailTexture();
  const roadMat = new THREE.MeshStandardMaterial({
    map: roadTex,
    roughness: 0.78,
    metalness: 0.06,
  });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 95), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.01, -18);
  road.receiveShadow = true;
  scene.add(road);

  // Warm carved stone border rails along the walking trail
  const railMat = new THREE.MeshStandardMaterial({ color: 0xe0a952, roughness: 0.6, metalness: 0.15 });
  for (const x of [-4.85, 4.85]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 95), railMat);
    rail.position.set(x, 0.08, -18);
    scene.add(rail);
  }

  // Persistent Animated 3D Sky Actors: Soaring Golden Dragon + Flock of White Cranes + 4 Floating Hot-Air Balloons
  const dragon = buildSkyDragon();
  scene.add(dragon.group);

  const cranes = buildFlockOfCranes();
  scene.add(cranes.group);

  const balloons = [
    { mesh: buildSkyBalloon(0xc46d46, 0x8c4220), baseX: -14, baseY: 11.5, baseZ: -26, speed: 0.6, phase: 0.2 },
    { mesh: buildSkyBalloon(0x52796f, 0x2f4f4f), baseX: 15, baseY: 13.0, baseZ: -32, speed: 0.5, phase: 1.8 },
    { mesh: buildSkyBalloon(0xd4a359, 0x8c6220), baseX: -9, baseY: 15.2, baseZ: -38, speed: 0.55, phase: 3.4 },
    { mesh: buildSkyBalloon(0xa8584c, 0x6e3228), baseX: 11, baseY: 10.2, baseZ: -20, speed: 0.68, phase: 4.7 },
  ];
  for (const b of balloons) {
    b.mesh.position.set(b.baseX, b.baseY, b.baseZ);
    scene.add(b.mesh);
  }

  // Scrolling roadside props & overhead archways
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

    // Update top header card background image to match the current destination's Nano Banana painting
    const worldCard = document.getElementById('world-card');
    if (worldCard && pal.skyImg) {
      worldCard.style.backgroundImage = `linear-gradient(180deg, rgba(26, 22, 18, .74), rgba(14, 12, 10, .86)), url('${pal.skyImg}')`;
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
      leftProp.position.x = -5.4;
      const rightProp = buildRoadsideScene(biomeId, 1, i + 1, animCallbacks);
      rightProp.position.x = 5.4;
      row.add(leftProp, rightProp);
      propsGroup.add(row);
      propRows.push(row);
    }

    // 2 grand overhead heritage gateways scrolling gently over the trail
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
      // Gentle, realistic human cross-country walking speed (~1.75 m/s) so viewers can savor every landmark!
      const scroll = dt * 1.75 * speedMult;
      roadTex.offset.y -= scroll * 0.105;

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

      // Update soaring 3D Golden Dragon, Flock of White Cranes, Hot-Air Balloons, and animated biome props
      dragon.update(elapsed);
      cranes.update(elapsed);
      for (const b of balloons) {
        b.mesh.position.y = b.baseY + Math.sin(elapsed * b.speed + b.phase) * 0.85;
        b.mesh.position.x = b.baseX + Math.cos(elapsed * b.speed * 0.6 + b.phase) * 1.3;
        b.mesh.rotation.y = elapsed * 0.3 + b.phase;
      }
      for (const fn of animCallbacks) fn(elapsed);
    },
  };
}
