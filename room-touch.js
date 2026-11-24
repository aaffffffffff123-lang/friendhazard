// 두 실내가 같은 이동 스틱·조준·사격 제스처를 사용한다.
export function bindRoomTouch({ canvas, stickEl, fireEl, input, player, getSensitivity, onTouch, skipIntro, canPlay, fireNow }) {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const TT = { stick: null, sx: 0, sy: 0, look: null, lx: 0, ly: 0, fire: null, fx: 0, fy: 0 };
  const knobEl = stickEl.querySelector('.knob');
  const STICK_R = 56;
  function touchLook(dx, dy) {
    const wide = clamp(640 / window.innerWidth, 1, 1.6);
    const sensitivity = 0.0066 * getSensitivity();
    player.yaw -= dx * sensitivity * wide;
    player.pitch = clamp(player.pitch - dy * sensitivity * (1 + (wide - 1) * 0.4), -1.32, 1.32);
  }
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    onTouch();
    if (skipIntro()) return;
    if (!canPlay()) return;
    const VW = window.innerWidth, VH = window.innerHeight;
    const stickZone = e.clientX < VW * 0.45 && (VW >= VH || e.clientY > VH * 0.42);
    if (stickZone && TT.stick === null) {
      TT.stick = e.pointerId; TT.sx = e.clientX; TT.sy = e.clientY;
      stickEl.hidden = false; stickEl.style.transform = `translate3d(${TT.sx}px, ${TT.sy}px, 0)`; knobEl.style.transform = 'translate(0px, 0px)';
    } else if (TT.look === null) {
      TT.look = e.pointerId; TT.lx = e.clientX; TT.ly = e.clientY;
    } else return;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* 무시 */ }
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerId === TT.stick) {
      let dx = e.clientX - TT.sx, dy = e.clientY - TT.sy;
      const l = Math.hypot(dx, dy);
      if (l > STICK_R) { const over = l - STICK_R; TT.sx += dx / l * over; TT.sy += dy / l * over; dx = e.clientX - TT.sx; dy = e.clientY - TT.sy; stickEl.style.transform = `translate3d(${TT.sx}px, ${TT.sy}px, 0)`; }
      knobEl.style.transform = `translate(${dx}px, ${dy}px)`;
      // 가운데 근처는 무시하고 부드럽게
      const len = Math.hypot(dx, dy), m = len / STICK_R, dead = 0.12;
      const k = m < dead ? 0 : clamp((m - dead) / (1 - dead), 0, 1);
      input.stick.x = len ? dx / len * k : 0;
      input.stick.z = len ? dy / len * k : 0;
      // 앞으로 끝까지 밀면 달리기
      input.stickRun = k > 0.96 && dy < 0 && Math.abs(dx) < -dy * 0.6;
    } else if (e.pointerId === TT.look) {
      touchLook(e.clientX - TT.lx, e.clientY - TT.ly); TT.lx = e.clientX; TT.ly = e.clientY;
    }
  });
  function touchEnd(e) {
    if (e.pointerId === TT.stick) { TT.stick = null; input.stick.x = input.stick.z = 0; input.stickRun = false; stickEl.hidden = true; }
    if (e.pointerId === TT.look) TT.look = null;
  }
  canvas.addEventListener('pointerup', touchEnd);
  canvas.addEventListener('pointercancel', touchEnd);
  canvas.addEventListener('lostpointercapture', touchEnd);
  fireEl.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!canPlay()) return;
    if (TT.fire !== null) return;
    TT.fire = e.pointerId; TT.fx = e.clientX; TT.fy = e.clientY;
    try { fireEl.setPointerCapture(e.pointerId); } catch (err) { /* 무시 */ }
    fireEl.classList.add('down');
    input.fire = true; input.trigger = true;
    fireNow();
    input.trigger = false;
  });
  fireEl.addEventListener('pointermove', (e) => {
    if (e.pointerId !== TT.fire) return;
    // 쏘면서 끌면 조준도 따라간다
    touchLook(e.clientX - TT.fx, e.clientY - TT.fy); TT.fx = e.clientX; TT.fy = e.clientY;
  });
  function fireUp(e) { if (e.pointerId !== TT.fire) return; TT.fire = null; fireEl.classList.remove('down'); input.fire = false; }
  fireEl.addEventListener('pointerup', fireUp); fireEl.addEventListener('pointercancel', fireUp); fireEl.addEventListener('lostpointercapture', fireUp);
  return function release() {
    for (const [el, id] of [[canvas, TT.look], [canvas, TT.stick], [fireEl, TT.fire]]) {
      if (id !== null && el.hasPointerCapture(id)) el.releasePointerCapture(id);
    }
    TT.stick = TT.look = TT.fire = null;
    input.stick.x = input.stick.z = 0;
    input.stickRun = input.fire = input.trigger = false;
    stickEl.hidden = true;
    fireEl.classList.remove('down');
  };
}
