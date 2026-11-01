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
    skyBot: 0x176d7a,
    fog: 0x114c5a,
    ground: 0x0b424d,
    road: 0x1c2536,
    lane: 0xffd166,
    sun: 0xffe299,
  },
  japan: {
    skyTop: 0x1a1033,
    skyBot: 0x6e3562,
    fog: 0x4a2448,
    ground: 0x2b192e,
    road: 0x201a30,
    lane: 0xff9ebb,
    sun: 0xffb8d1,
  },
  egypt: {
    skyTop: 0x2e1505,
    skyBot: 0x9c5518,
    fog: 0x6e3a0f,
    ground: 0x8c5820,
    road: 0x2e2116,
    lane: 0xffc857,
    sun: 0xffaa33,
  },
  france: {
    skyTop: 0x09132e,
    skyBot: 0x2c3e75,
    fog: 0x1c2852,
    ground: 0x162238,
    road: 0x1b2234,
    lane: 0x7bdff2,
    sun: 0xffe6a3,
  },
  usa: {
    skyTop: 0x05182e,
    skyBot: 0x154c79,
    fog: 0x0f3659,
    ground: 0x0d2840,
    road: 0x182030,
    lane: 0x48cae4,
    sun: 0x90e0ef,
  },
  cosmos: {
    skyTop: 0x050214,
    skyBot: 0x1d0b42,
    fog: 0x12062c,
    ground: 0x09031a,
    road: 0x160b36,
    lane: 0x00f5d4,
    sun: 0xf15bb5,
  },
};

function createRoadTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#192232';
  g.fillRect(0, 0, 512, 512);

  // Subtle asphalt grain + glowing edge strips
  g.fillStyle = '#f4b942';
  g.fillRect(8, 0, 10, 512);
  g.fillRect(494, 0, 10, 512);

  // Cyan/gold dashed lane dividers
  g.fillStyle = 'rgba(255, 224, 130, 0.55)';
  for (const x of [130, 256, 382]) {
    for (let y = 20; y < 512; y += 64) {
      g.fillRect(x - 3, y, 6, 34);
    }
  }

  // Forward speed chevrons in the center lane
  g.strokeStyle = 'rgba(88, 213, 255, 0.35)';
  g.lineWidth = 6;
  for (let y = 60; y < 512; y += 128) {
    g.beginPath();
    g.moveTo(220, y + 28);
    g.lineTo(256, y);
    g.lineTo(292, y + 28);
    g.stroke();
  }

  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 14);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Builds a roadside prop for a given biome at index i
function buildRoadsideProp(biomeId, side) {
  const g = new THREE.Group();
  if (biomeId === 'vietnam') {
    // Ha Long limestone karst + glowing red lantern post
    const karstMat = new THREE.MeshStandardMaterial({ color: 0x2b6e63, roughness: 0.85 });
    const k1 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 6.5, 7), karstMat);
    k1.position.set(side * 4.2, 3.0, 0);
    g.add(k1);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8), new THREE.MeshStandardMaterial({ color: 0x5c2c16 }));
    pole.position.set(side * 0.4, 1.6, 0);
    g.add(pole);
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xff2a1a, emissive: 0xcc1100, emissiveIntensity: 1.4 })
    );
    lantern.scale.set(1, 1.25, 1);
    lantern.position.set(side * 0.4, 3.0, 0);
    g.add(lantern);
  } else if (biomeId === 'japan') {
    // Vermilion Torii pillar or Sakura cherry blossom tree
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xd92b1c, roughness: 0.5 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 4.2, 10), pillarMat);
    post.position.set(0, 2.1, 0);
    g.add(post);
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(1.45, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xff9ebb, emissive: 0x4a1228, roughness: 0.6 })
    );
    crown.position.set(side * 2.2, 3.2, 0);
    g.add(crown);
  } else if (biomeId === 'egypt') {
    // Golden Pyramid + Obelisk
    const pyrMat = new THREE.MeshStandardMaterial({ color: 0xdba142, roughness: 0.65, metalness: 0.15 });
    const pyr = new THREE.Mesh(new THREE.ConeGeometry(3.4, 5.2, 4), pyrMat);
    pyr.rotation.y = Math.PI / 4;
    pyr.position.set(side * 4.5, 2.5, 0);
    g.add(pyr);
    const obelisk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.28, 3.8, 4),
      new THREE.MeshStandardMaterial({ color: 0xf5c869, emissive: 0x3d2604 })
    );
    obelisk.position.set(side * 0.5, 1.9, 0);
    g.add(obelisk);
  } else if (biomeId === 'france') {
    // Parisian golden street lamp + cypress tree
    const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 3.6, 8), new THREE.MeshStandardMaterial({ color: 0x222a38, metalness: 0.7 }));
    lampPost.position.set(side * 0.3, 1.8, 0);
    g.add(lampPost);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffe89e })
    );
    bulb.position.set(side * 0.3, 3.7, 0);
    g.add(bulb);
    const towerMini = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 6.2, 4),
      new THREE.MeshStandardMaterial({ color: 0xc89d54, wireframe: true, emissive: 0x4a3210 })
    );
    towerMini.position.set(side * 4.2, 3.1, 0);
    g.add(towerMini);
  } else if (biomeId === 'usa') {
    // Neon skyscraper + Golden Gate red tower
    const bldg = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 6.8, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x1a3a5c, emissive: 0x0a223d, metalness: 0.5, roughness: 0.3 })
    );
    bldg.position.set(side * 4.2, 3.4, 0);
    g.add(bldg);
    const neon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 4.0, 8),
      new THREE.MeshBasicMaterial({ color: 0x00f5d4 })
    );
    neon.position.set(side * 0.4, 2.0, 0);
    g.add(neon);
  } else {
    // Cosmos: floating glowing crystal & ringed planet
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.1, 0),
      new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x7209b7, emissiveIntensity: 0.9, roughness: 0.2, metalness: 0.8 })
    );
    crystal.position.set(side * 1.8, 2.6, 0);
    g.add(crystal);
  }
  return g;
}

// Builds the grand centerpiece horizon landmark for each biome at z = -42
function buildHorizonLandmark(biomeId) {
  const g = new THREE.Group();
  g.position.set(0, 0, -42);

  if (biomeId === 'vietnam') {
    // Grand Ha Long Bay Arch & Golden Dragon Gate
    const karstMat = new THREE.MeshStandardMaterial({ color: 0x1f5c54, roughness: 0.8 });
    for (const [x, h, r] of [[-12, 16, 5.5], [13, 18, 6], [-22, 12, 4.5], [22, 14, 5]]) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), karstMat);
      m.position.set(x, h / 2 - 1, -6);
      g.add(m);
    }
    // Traditional Vietnamese Tam Quan Welcome Gate over the highway
    const redMat = new THREE.MeshStandardMaterial({ color: 0xb81d13, emissive: 0x3a0502 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5c242, emissive: 0x4a3008, metalness: 0.6, roughness: 0.3 });
    for (const x of [-5.2, 5.2]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 9, 12), redMat);
      p.position.set(x, 4.5, 18);
      g.add(p);
    }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(13.5, 1.1, 1.8), goldMat);
    roof.position.set(0, 9.2, 18);
    g.add(roof);
  } else if (biomeId === 'japan') {
    // Giant snow-capped Mount Fuji on the horizon + Great Torii Gate
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
    // Grand Torii over the highway
    const toriiMat = new THREE.MeshStandardMaterial({ color: 0xe62e1b, emissive: 0x3d0802 });
    for (const x of [-5.2, 5.2]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 9.5, 12), toriiMat);
      p.position.set(x, 4.75, 18);
      g.add(p);
    }
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(14, 0.85, 1.2), toriiMat);
    topBar.position.set(0, 9.5, 18);
    g.add(topBar);
  } else if (biomeId === 'egypt') {
    // Three Great Pyramids of Giza on the horizon
    const pyrMat = new THREE.MeshStandardMaterial({ color: 0xe0a43b, emissive: 0x2e1a03, roughness: 0.6 });
    for (const [x, s, z] of [[0, 16, -12], [-16, 12, -8], [16, 13, -9]]) {
      const p = new THREE.Mesh(new THREE.ConeGeometry(s * 0.85, s, 4), pyrMat);
      p.rotation.y = Math.PI / 4;
      p.position.set(x, s / 2 - 0.5, z);
      g.add(p);
    }
  } else if (biomeId === 'france') {
    // Towering Eiffel Tower at the end of the avenue
    const eiffelMat = new THREE.MeshStandardMaterial({ color: 0xdba858, emissive: 0x4a320a, wireframe: true });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 6.5, 10, 4, 4), eiffelMat);
    base.rotation.y = Math.PI / 4;
    base.position.set(0, 5, -8);
    g.add(base);
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 2.6, 13, 4, 6), eiffelMat);
    spire.rotation.y = Math.PI / 4;
    spire.position.set(0, 16.5, -8);
    g.add(spire);
    const beacon = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe899, blending: THREE.AdditiveBlending }));
    beacon.scale.setScalar(8);
    beacon.position.set(0, 23.5, -8);
    g.add(beacon);
  } else if (biomeId === 'usa') {
    // Golden Gate Suspension Towers + Statue of Liberty Silhouette
    const gateMat = new THREE.MeshStandardMaterial({ color: 0xc93b2b, emissive: 0x330a05 });
    for (const x of [-5.4, 5.4]) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.9, 13, 0.9), gateMat);
      t.position.set(x, 6.5, 14);
      g.add(t);
    }
    for (const y of [6.5, 9.5, 12.2]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.45, 0.6), gateMat);
      beam.position.set(0, y, 14);
      g.add(beam);
    }
  } else {
    // Cosmos: Giant Ringed Planet & Rainbow Portal Arch
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
  }
  return g;
}

export function buildRaceWorld(scene) {
  scene.background = new THREE.Color(0x06243a);
  scene.fog = new THREE.FogExp2(0x114c5a, 0.018);

  const hemi = new THREE.HemisphereLight(0xffeedd, 0x1a283b, 1.35);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xfff0cc, 1.8);
  dir.position.set(8, 18, 12);
  dir.castShadow = true;
  scene.add(dir);

  // Glowing sun/moon orb on the horizon
  const sunOrb = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, color: 0xffe299, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  sunOrb.scale.setScalar(26);
  sunOrb.position.set(0, 14, -48);
  scene.add(sunOrb);

  // Ground plane
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0b424d, roughness: 0.9 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.05, -20);
  scene.add(ground);

  // Endless 7-lane adventure highway (width 9.6m, length 90m)
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

  // Scrolling roadside props container
  const propsGroup = new THREE.Group();
  scene.add(propsGroup);
  let horizonGroup = null;
  let currentBiomeId = '';
  const propRows = [];

  function rebuildBiomeScenery(biomeId) {
    if (biomeId === currentBiomeId) return;
    currentBiomeId = biomeId;
    const pal = BIOME_PALETTES[biomeId] || BIOME_PALETTES.vietnam;
    scene.background.setHex(pal.skyTop);
    scene.fog.color.setHex(pal.fog);
    groundMat.color.setHex(pal.ground);
    railMat.color.setHex(pal.lane);
    sunOrb.material.color.setHex(pal.sun);

    // Clear old roadside props
    while (propsGroup.children.length) propsGroup.remove(propsGroup.children[0]);
    propRows.length = 0;

    for (let i = 0; i < 10; i++) {
      const row = new THREE.Group();
      const z = 14 - i * 6.5;
      row.position.z = z;
      const leftProp = buildRoadsideProp(biomeId, -1);
      leftProp.position.x = -5.6;
      const rightProp = buildRoadsideProp(biomeId, 1);
      rightProp.position.x = 5.6;
      row.add(leftProp, rightProp);
      propsGroup.add(row);
      propRows.push(row);
    }

    if (horizonGroup) scene.remove(horizonGroup);
    horizonGroup = buildHorizonLandmark(biomeId);
    scene.add(horizonGroup);
  }

  rebuildBiomeScenery('vietnam');

  return {
    setBiome(biomeId) {
      rebuildBiomeScenery(biomeId || 'vietnam');
    },
    update(dt, speedMult = 1.0) {
      const scroll = dt * 11 * speedMult;
      roadTex.offset.y -= scroll * 0.16;
      for (const row of propRows) {
        row.position.z += scroll;
        if (row.position.z > 18) {
          row.position.z -= 65;
        }
      }
    },
  };
}
