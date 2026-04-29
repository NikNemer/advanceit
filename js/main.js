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

// ── Hero canvas particle network (tympanus demo-1 style) ──
(function () {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ctx = canvas.getContext('2d');
  var width, height, points, animActive = true;

  // Circular ease-in-out (matches Circ.easeInOut from TweenLite)
  function easeInOut(t) {
    t *= 2;
    if (t < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
    t -= 2;
    return 0.5 * (Math.sqrt(1 - t * t) + 1);
  }

  function sqDist(a, b) {
    return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
  }

  function shiftPoint(p, now) {
    p.tx = p.originX - 50 + Math.random() * 100;
    p.ty = p.originY - 50 + Math.random() * 100;
    p.sx = p.x; p.sy = p.y;
    p.dur = (1 + Math.random()) * 1000;
    p.t0 = now;
  }

  function initPoints() {
    width  = canvas.width  = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    points = [];

    for (var x = 0; x < width; x += width / 20) {
      for (var y = 0; y < height; y += height / 20) {
        var px = x + Math.random() * (width / 20);
        var py = y + Math.random() * (height / 20);
        points.push({ x: px, originX: px, y: py, originY: py,
                      radius: 2 + Math.random() * 2 });
      }
    }

    // Find 5 closest neighbours for each point
    for (var i = 0; i < points.length; i++) {
      var p1 = points[i], closest = [];
      for (var j = 0; j < points.length; j++) {
        var p2 = points[j];
        if (p1 === p2) continue;
        if (closest.length < 5) { closest.push(p2); continue; }
        var d = sqDist(p1, p2), maxD = 0, maxK = 0;
        for (var k = 0; k < 5; k++) {
          var dk = sqDist(p1, closest[k]);
          if (dk > maxD) { maxD = dk; maxK = k; }
        }
        if (d < maxD) closest[maxK] = p2;
      }
      p1.closest = closest;
      shiftPoint(p1, performance.now());
    }
  }

  function draw(now) {
    if (animActive) {
      ctx.clearRect(0, 0, width, height);

      // Update positions
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var prog = Math.min((now - p.t0) / p.dur, 1);
        var e = easeInOut(prog);
        p.x = p.sx + (p.tx - p.sx) * e;
        p.y = p.sy + (p.ty - p.sy) * e;
        if (prog >= 1) shiftPoint(p, now);
      }

      // Draw all lines in one batch
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(16, 25, 130, 0.05)';
      ctx.lineWidth = 1;
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        for (var j = 0; j < p.closest.length; j++) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.closest[j].x, p.closest[j].y);
        }
      }
      ctx.stroke();

      // Draw all dots in one batch
      ctx.beginPath();
      ctx.fillStyle = 'rgba(16, 25, 130, 0.3)';
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        ctx.moveTo(p.x + p.radius, p.y);
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('scroll', function () {
    animActive = window.scrollY <= height;
  }, { passive: true });
  window.addEventListener('resize', initPoints);

  initPoints();
  requestAnimationFrame(draw);
}());
