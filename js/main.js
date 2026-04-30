const header   = document.querySelector('.fixed-top');
const mmenu    = document.getElementById('mmenu');
const mmenuBtn = document.getElementById('mmenulogo');

const MOBILE_BREAKPOINT = 601;
let menuTimeout;

// On resize: close mobile menu if viewport grows past breakpoint
const onResize = () => {
  if (window.innerWidth >= MOBILE_BREAKPOINT) {
    mmenu.classList.remove('open');
    mmenuBtn.setAttribute('aria-expanded', 'false');
    clearTimeout(menuTimeout);
  }
};

// Mobile hamburger toggle
mmenuBtn.addEventListener('click', () => {
  const opening = !mmenu.classList.contains('open');
  mmenu.classList.toggle('open', opening);
  mmenuBtn.setAttribute('aria-expanded', String(opening));
  clearTimeout(menuTimeout);
  if (opening) {
    menuTimeout = setTimeout(() => {
      mmenu.classList.remove('open');
      mmenuBtn.setAttribute('aria-expanded', 'false');
    }, 3000);
  }
});


// Close mobile menu when a nav link is clicked
mmenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mmenu.classList.remove('open');
    mmenuBtn.setAttribute('aria-expanded', 'false');
    clearTimeout(menuTimeout);
  });
});

window.addEventListener('resize', onResize);

// Header opacity on scroll — rAF-throttled
const SCROLL_END  = 300;
const OPACITY_MIN = 0.15;
const OPACITY_MAX = 1;
const OPACITY_DIFF = OPACITY_MAX - OPACITY_MIN;
const HIDE_AFTER  = 500;

let rafPending = false;

const updateHeader = () => {
  const scrollTop = window.scrollY;
  const progress  = Math.min(1, Math.max(OPACITY_MIN, scrollTop / SCROLL_END));
  const opacity   = OPACITY_MIN + OPACITY_DIFF * progress;
  header.style.backgroundColor = `rgba(0, 102, 193, ${opacity.toFixed(3)})`;
  header.style.display = scrollTop < HIDE_AFTER ? '' : 'none';
  rafPending = false;
};

window.addEventListener('scroll', () => {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(updateHeader);
  }
}, { passive: true });

// ── Globe — Our Clients ───────────────────────────────────

(function () {
  if (typeof d3 === 'undefined' || typeof topojson === 'undefined') return;
  const container = document.querySelector('.globe-container');
  if (!container) return;

  const CITIES = [
    { name: 'Jakarta',     lon:  106.845, lat:  -6.209 },
    { name: 'Praha',       lon:   14.418, lat:  50.076 },
    { name: 'Moncton',     lon:  -64.778, lat:  46.088 },
    { name: 'Muscat',      lon:   58.383, lat:  23.588 },
    { name: 'Saint John',  lon:  -66.063, lat:  45.273 },
    { name: 'Woodbridge',  lon:  -79.595, lat:  43.787 },
    { name: 'Limassol',    lon:   33.041, lat:  34.679 },
    { name: 'Johor Bahru', lon:  103.741, lat:   1.493 },
    { name: 'London',      lon:   -0.128, lat:  51.507 },
    { name: 'Forbach',     lon:   57.617, lat: -20.283 },
    { name: 'Warsaw',      lon:   21.012, lat:  52.230 },
    { name: 'Dublin',      lon:   -6.260, lat:  53.350 },
    { name: 'Morden',      lon:   -0.195, lat:  51.402 },
    { name: 'Osaka',       lon:  135.502, lat:  34.694 },
    { name: 'Seattle',     lon: -122.332, lat:  47.606 },
    { name: 'Los Angeles', lon: -118.244, lat:  34.052 },
  ];

  const W = 600, R = 260;

  const svg = d3.select('#globe-svg');
  const defs = svg.append('defs');

  // Sphere gradient — light from upper-left
  const grad = defs.append('radialGradient')
    .attr('id', 'g-sphere').attr('cx', '38%').attr('cy', '32%').attr('r', '65%');
  grad.append('stop').attr('offset',   '0%').attr('stop-color', '#ffffff');
  grad.append('stop').attr('offset',  '55%').attr('stop-color', '#e2e2e2');
  grad.append('stop').attr('offset', '100%').attr('stop-color', '#ccc');

  // Clip to sphere circle
  defs.append('clipPath').attr('id', 'g-clip')
    .append('circle').attr('cx', W / 2).attr('cy', R).attr('r', R);

  const projection = d3.geoOrthographic()
    .scale(R - 1)
    .translate([W / 2, R])
    .rotate([20, -30, 0])
    .clipAngle(90);

  const geoPath = d3.geoPath(projection);

  // Sphere fill + border
  svg.append('circle')
    .attr('cx', W / 2).attr('cy', R).attr('r', R)
    .attr('fill', 'url(#g-sphere)')
    .attr('stroke', '#ccc').attr('stroke-width', 1);

  const gMap = svg.append('g').attr('clip-path', 'url(#g-clip)');

  const gratLine = gMap.append('path').datum(d3.geoGraticule()())
    .attr('fill', 'none')
    .attr('stroke', 'rgba(148,148,148,0.22)')
    .attr('stroke-width', 0.5);

  const landShape = gMap.append('path')
    .attr('fill', '#c8c8c8').attr('stroke', 'none');

  const borderLines = gMap.append('path')
    .attr('fill', 'none')
    .attr('stroke', 'rgba(255,255,255,0.7)')
    .attr('stroke-width', 0.6);

  const markersG = svg.append('g').attr('clip-path', 'url(#g-clip)');

  function redraw() {
    gratLine.attr('d', geoPath);
    if (landShape.datum())    landShape.attr('d', geoPath);
    if (borderLines.datum())  borderLines.attr('d', geoPath);
    drawMarkers();
  }

  function drawMarkers() {
    markersG.selectAll('.cm').remove();
    const center = projection.invert([W / 2, R]);
    CITIES.forEach(c => {
      const coords = [c.lon, c.lat];
      if (d3.geoDistance(coords, center) >= Math.PI / 2) return;
      const [x, y] = projection(coords);
      const g = markersG.append('g').attr('class', 'cm')
        .attr('transform', `translate(${x},${y})`);
      g.append('circle').attr('r', 9).attr('fill', 'rgba(255,101,0,0.18)');
      g.append('circle').attr('r', 5)
        .attr('fill', '#ff6500').attr('stroke', '#fff').attr('stroke-width', 1.5);
      g.append('title').text(c.name);
    });
  }

  redraw();

  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(world => {
    landShape.datum(topojson.feature(world, world.objects.land));
    borderLines.datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b));
    redraw();
  }).catch(() => {});

  // Auto-rotation
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let spinning = !reduceMotion;
  let raf = null;

  function spin() {
    const [λ, φ] = projection.rotate();
    projection.rotate([λ + 0.12, φ]);
    redraw();
    raf = requestAnimationFrame(spin);
  }
  if (spinning) raf = requestAnimationFrame(spin);

  // Mouse interaction
  let prevX = null;

  container.addEventListener('mouseenter', () => {
    spinning = false;
    cancelAnimationFrame(raf);
  });
  container.addEventListener('mouseleave', () => {
    prevX = null;
    spinning = !reduceMotion;
    if (spinning) raf = requestAnimationFrame(spin);
  });
  container.addEventListener('mousemove', e => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (prevX !== null) {
      const [λ, φ] = projection.rotate();
      projection.rotate([λ + (x - prevX) * 0.4, φ]);
      redraw();
    }
    prevX = x;
  });

  // Touch
  let prevTX = null;
  container.addEventListener('touchstart', e => {
    spinning = false;
    cancelAnimationFrame(raf);
    prevTX = e.touches[0].clientX;
  }, { passive: true });
  container.addEventListener('touchmove', e => {
    const x = e.touches[0].clientX;
    if (prevTX !== null) {
      const [λ, φ] = projection.rotate();
      projection.rotate([λ + (x - prevTX) * 0.4, φ]);
      redraw();
    }
    prevTX = x;
  }, { passive: true });
  container.addEventListener('touchend', () => {
    prevTX = null;
    spinning = !reduceMotion;
    if (spinning) raf = requestAnimationFrame(spin);
  }, { passive: true });
}());

// ── Hero spinning orb ─────────────────────────────────────
(function () {
  var canvas = document.getElementById('orb-canvas');
  if (!canvas || !canvas.getContext) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ctx = canvas.getContext('2d');
  var sphereRad = 800;
  var radius_sp = 1;
  var displayWidth, displayHeight;
  var wait = 1, count = 0, numToAddEachFrame = 8;
  var particleList = {}, recycleBin = {};
  var particleAlpha, rgbString;
  var fLen, projCenterX, projCenterY, zMax;
  var turnAngle, turnSpeed;
  var sphereCenterY, sphereCenterZ;
  var particleRad, zeroAlphaDepth;
  var randAccelX, randAccelY, randAccelZ;
  var p, outsideTest, nextParticle, sinAngle, cosAngle;
  var rotX, rotZ, depthAlphaFactor, m, i;
  var theta, phi, x0, y0, z0;

  function resize() {
    displayWidth  = canvas.width  = canvas.offsetWidth;
    displayHeight = canvas.height = canvas.offsetHeight;
    projCenterX = displayWidth  * 0.5;
    projCenterY = displayHeight * 1.0;
  }

  function init() {
    resize();
    rgbString = 'rgba(70,255,140,';
    particleAlpha = 1;
    fLen = 400;
    zMax = fLen - 2;
    particleList = {}; recycleBin = {};
    randAccelX = 0.1; randAccelY = 0.1; randAccelZ = 0.1;
    particleRad = 2.5;
    sphereCenterY = 0;
    sphereCenterZ = -3 - sphereRad;
    zeroAlphaDepth = -750;
    turnSpeed = 2 * Math.PI / 1200;
    turnAngle = 0;
  }

  function addParticle(x0, y0, z0, vx0, vy0, vz0) {
    var np;
    if (recycleBin.first != null) {
      np = recycleBin.first;
      if (np.next != null) { recycleBin.first = np.next; np.next.prev = null; }
      else { recycleBin.first = null; }
    } else {
      np = {};
    }
    if (particleList.first == null) {
      particleList.first = np; np.prev = null; np.next = null;
    } else {
      np.next = particleList.first; particleList.first.prev = np;
      particleList.first = np; np.prev = null;
    }
    np.x = x0; np.y = y0; np.z = z0;
    np.velX = vx0; np.velY = vy0; np.velZ = vz0;
    np.age = 0; np.dead = false;
    return np;
  }

  function recycle(p) {
    if (particleList.first == p) {
      if (p.next != null) { p.next.prev = null; particleList.first = p.next; }
      else { particleList.first = null; }
    } else {
      if (p.next == null) { p.prev.next = null; }
      else { p.prev.next = p.next; p.next.prev = p.prev; }
    }
    if (recycleBin.first == null) {
      recycleBin.first = p; p.prev = null; p.next = null;
    } else {
      p.next = recycleBin.first; recycleBin.first.prev = p;
      recycleBin.first = p; p.prev = null;
    }
  }

  function onFrame() {
    count++;
    if (count >= wait) {
      count = 0;
      for (i = 0; i < numToAddEachFrame; i++) {
        theta = Math.random() * 2 * Math.PI;
        phi   = Math.acos(Math.random() * 2 - 1);
        x0 = sphereRad * Math.sin(phi) * Math.cos(theta);
        y0 = sphereRad * Math.sin(phi) * Math.sin(theta);
        z0 = sphereRad * Math.cos(phi);
        var np = addParticle(x0, sphereCenterY + y0, sphereCenterZ + z0,
                             0.002 * x0, 0.002 * y0, 0.002 * z0);
        np.attack = 50; np.hold = 50; np.decay = 100;
        np.initValue = 0; np.holdValue = particleAlpha; np.lastValue = 0;
        np.stuckTime = 90 + Math.random() * 20;
        np.accelX = 0; np.accelY = 0; np.accelZ = 0;
      }
    }

    turnAngle = (turnAngle + turnSpeed) % (2 * Math.PI);
    sinAngle = Math.sin(turnAngle);
    cosAngle = Math.cos(turnAngle);

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    p = particleList.first;
    while (p != null) {
      nextParticle = p.next;
      p.age++;

      if (p.age > p.stuckTime) {
        p.velX += p.accelX + randAccelX * (Math.random() * 2 - 1);
        p.velY += p.accelY + randAccelY * (Math.random() * 2 - 1);
        p.velZ += p.accelZ + randAccelZ * (Math.random() * 2 - 1);
        p.x += p.velX; p.y += p.velY; p.z += p.velZ;
      }

      rotX = cosAngle * p.x + sinAngle * (p.z - sphereCenterZ);
      rotZ = -sinAngle * p.x + cosAngle * (p.z - sphereCenterZ) + sphereCenterZ;
      m = radius_sp * fLen / (fLen - rotZ);
      p.projX = rotX * m + projCenterX;
      p.projY = p.y  * m + projCenterY;

      if (p.age < p.attack + p.hold + p.decay) {
        if      (p.age < p.attack)              p.alpha = (p.holdValue - p.initValue) / p.attack * p.age + p.initValue;
        else if (p.age < p.attack + p.hold)     p.alpha = p.holdValue;
        else                                    p.alpha = (p.lastValue - p.holdValue) / p.decay * (p.age - p.attack - p.hold) + p.holdValue;
      } else {
        p.dead = true;
      }

      outsideTest = (p.projX > displayWidth || p.projX < 0 ||
                     p.projY < 0 || p.projY > displayHeight || rotZ > zMax);

      if (outsideTest || p.dead) {
        recycle(p);
      } else {
        depthAlphaFactor = 1 - rotZ / zeroAlphaDepth;
        depthAlphaFactor = depthAlphaFactor > 1 ? 1 : (depthAlphaFactor < 0 ? 0 : depthAlphaFactor);
        ctx.fillStyle = rgbString + depthAlphaFactor * p.alpha + ')';
        ctx.beginPath();
        ctx.arc(p.projX, p.projY, m * particleRad, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
      }

      p = nextParticle;
    }

    requestAnimationFrame(onFrame);
  }

  window.addEventListener('resize', resize);

  init();
  requestAnimationFrame(onFrame);
}());
