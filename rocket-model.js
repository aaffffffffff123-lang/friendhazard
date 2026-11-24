export function rocketWarheadGeo(THREE, mergeGeos) {
  const parts = [];
  const neck = new THREE.CylinderGeometry(0.028, 0.034, 0.08, 12); neck.rotateX(Math.PI / 2); neck.translate(0, 0, -0.04); parts.push(neck);
  const body = new THREE.CylinderGeometry(0.068, 0.06, 0.16, 16); body.rotateX(Math.PI / 2); body.translate(0, 0, -0.16); parts.push(body);
  const cone = new THREE.CylinderGeometry(0.014, 0.068, 0.22, 16); cone.rotateX(Math.PI / 2); cone.translate(0, 0, -0.35); parts.push(cone);
  return mergeGeos(parts);
}
export function buildRocketModel(THREE, mk, outM, warhead) {
  const g = new THREE.Group();
  const olive = mk(0x56653a), oliveDk = mk(0x3c4728), wood = mk(0x8a4f2a), black = mk(0x232227), steel = mk(0x7c7f86), tip = mk(0x2b2b30), war = mk(0x77843f);
  const part = (geo, mat, x, y, z, outline = true, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); if (outline) m.add(new THREE.Mesh(geo, outM)); return m; };
  const tube = new THREE.CylinderGeometry(0.043, 0.043, 0.96, 16); tube.rotateX(Math.PI / 2);
  part(tube, olive, 0, 0, -0.14);
  const flare = new THREE.CylinderGeometry(0.074, 0.046, 0.2, 16, 1, true); flare.rotateX(-Math.PI / 2);
  part(flare, oliveDk, 0, 0, 0.42);
  const guard = new THREE.CylinderGeometry(0.056, 0.056, 0.3, 14); guard.rotateX(Math.PI / 2);
  part(guard, wood, 0, 0, 0.02);
  for (const z of [-0.13, 0.17]) { const r = new THREE.TorusGeometry(0.057, 0.008, 6, 16); part(r, steel, 0, 0, z, false); }
  const muzzle = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16); muzzle.rotateX(Math.PI / 2);
  part(muzzle, oliveDk, 0, 0, -0.6);
  // 손잡이: 앞(왼손), 방아쇠(오른손)
  const fg = new THREE.BoxGeometry(0.034, 0.12, 0.05); fg.rotateX(0.3); part(fg, black, 0, -0.095, -0.2);
  const tg = new THREE.BoxGeometry(0.036, 0.13, 0.055); tg.rotateX(0.32); part(tg, black, 0, -0.1, 0.12);
  const tgd = new THREE.TorusGeometry(0.03, 0.007, 6, 12, Math.PI); tgd.rotateY(Math.PI / 2); tgd.rotateX(Math.PI); part(tgd, black, 0, -0.045, 0.06, false);
  // 조준경 (왼쪽 위)
  const sb = new THREE.BoxGeometry(0.028, 0.05, 0.09); part(sb, black, -0.06, 0.04, -0.02);
  const lens = new THREE.CylinderGeometry(0.017, 0.017, 0.1, 12); lens.rotateX(Math.PI / 2); part(lens, steel, -0.06, 0.07, -0.02, false);
  // 탄두
  const head = new THREE.Group(); head.position.set(0, 0, -0.62); g.add(head);
  part(warhead, war, 0, 0, 0, true, head);
  const t2 = new THREE.CylinderGeometry(0.004, 0.014, 0.05, 10); t2.rotateX(Math.PI / 2); part(t2, tip, 0, 0, -0.485, false, head);
  g.userData.head = head;
  return g;
}
