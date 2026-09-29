/* Critically damped motion preserves velocity when a visitor changes direction. */
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const doors = [...document.querySelectorAll('.venue button')].map(button => ({
  button, gap: button.querySelector('#field-gap-rect'), room: button.querySelector('.room'),
  leaves: [...button.querySelectorAll('.door-leaf')].map(leaf => ({
    leaf, shade: leaf.querySelector('.leaf-shade'),
    angle: parseFloat(leaf.style.getPropertyValue('--angle')),
  })),
  position: 0, velocity: 0, target: 0, hovered: false, latched: false, focused: false,
  closeTimer: null,
}));
let frame = 0, lastTime = 0;
function paint(door) {
  const progress = Math.max(0, Math.min(1, door.position));
  for (const {leaf, shade, angle} of door.leaves) {
    leaf.style.transform = `translateZ(0) rotateY(${angle * progress}deg)`;
    shade.style.opacity = String(.16 * progress);
  }
  // Reveal the field from the center as the gate opens. Opaque doors
  // naturally occlude their rooms; no fading or duplicate closed-door layer.
  if (door.gap) {
    const width = 161, perspective = 650;
    const radians = 78 * progress * Math.PI / 180;
    const depth = width * Math.sin(radians) / perspective;
    const edge = (width * Math.cos(radians) + width * .5 * depth) / (1 + depth);
    const inset = edge * (1 - progress);
    door.gap.setAttribute('x', String(144 + inset));
    door.gap.setAttribute('width', String(Math.max(0, 322 - 2 * inset)));
  }
}
function tick(time) {
  const dt = Math.min((time - lastTime) / 1000, .064);
  lastTime = time;
  let active = false;
  for (const door of doors) {
    const offset = door.position - door.target;
    const frequency = door.button.closest('.low') ? (door.target ? 5.0 : 5.6) : (door.target ? 4.8 : 6.2);
    const impulse = door.velocity + frequency * offset;
    const decay = Math.exp(-frequency * dt);
    door.position = door.target + (offset + impulse * dt) * decay;
    door.velocity = (door.velocity - frequency * impulse * dt) * decay;
    if (Math.abs(door.position - door.target) < .001 && Math.abs(door.velocity) < .006) {
      door.position = door.target; door.velocity = 0;
    } else active = true;
    paint(door);
  }
  frame = active ? requestAnimationFrame(tick) : 0;
}
function update(door) {
  door.target = Number(door.hovered || door.latched || door.focused);
  door.button.setAttribute('aria-pressed', String(Boolean(door.target)));
  door.button.setAttribute('aria-label', door.button.getAttribute('aria-label').replace(/^(Open|Close)/, door.target ? 'Close' : 'Open'));
  if (reducedMotion.matches) {
    door.position = door.target; door.velocity = 0; paint(door);
  } else if (!frame) {
    lastTime = performance.now(); frame = requestAnimationFrame(tick);
  }
}
for (const door of doors) {
  const {button} = door;
  button.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch' || !finePointer.matches) return;
    clearTimeout(door.closeTimer); door.hovered = true; update(door);
  });
  button.addEventListener('pointerleave', event => {
    if (event.pointerType === 'touch') return;
    door.closeTimer = setTimeout(() => {
      door.hovered = false; door.latched = false; update(door);
    }, 160);
  });
  button.addEventListener('click', event => {
    if (event.detail && door.hovered) return;
    door.focused = false; door.latched = !door.latched; update(door);
  });
  button.addEventListener('focus', () => {
    if (button.matches(':focus-visible')) { door.focused = true; update(door); }
  });
  button.addEventListener('blur', () => { door.focused = false; door.latched = false; update(door); });
}
reducedMotion.addEventListener('change', () => doors.forEach(update));
