

document.addEventListener('DOMContentLoaded', () => {

  const body = document.body;
  const toggle = document.getElementById('themeToggle');
  const dateEl = document.getElementById('dateDisplay');
  const mainWrapper = document.getElementById('mainWrapper');
  const arrowEl = document.getElementById('arrowProjectile');
  const trailEl = document.getElementById('transitionTrail');
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  if (dateEl) {
    const opts = { year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-US', opts);
  }

  const taglineTicker = document.getElementById('taglineTicker');
  const taglines = [
    "Practice in silence, let the aim speak",
    "No guru, no guide — only will",
    "The forest was my gurukul",
    "Discipline is the sharpest arrow",
    "Focus on the eye, not the bird",
    "Built the bow before anyone gave me one",
    "Still practicing before sunrise",
  ];
  let taglineIndex = 0;

  function runNextTagline() {
    if (!taglineTicker) return;

    taglineTicker.textContent = taglines[taglineIndex];
    taglineIndex = (taglineIndex + 1) % taglines.length;

    const directionClass = Math.random() > 0.5 ? 'run-lr' : 'run-rl';

    taglineTicker.classList.remove('run-lr', 'run-rl');
    void taglineTicker.offsetWidth;
    taglineTicker.classList.add(directionClass);
  }

  if (taglineTicker) {
    taglineTicker.addEventListener('animationend', runNextTagline);

    runNextTagline();
  }

  let audioCtx = null;

  function ensureAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playTransitionSound(toDay) {
    ensureAudioCtx();
    const now = audioCtx.currentTime;

    const len = audioCtx.sampleRate * 0.6;
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;

    const bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 2.5;
    bp.frequency.setValueAtTime(300, now);
    bp.frequency.exponentialRampToValueAtTime(2400, now + 0.15);
    bp.frequency.exponentialRampToValueAtTime(150, now + 0.45);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.06);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    noise.connect(bp);
    bp.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);
    noise.stop(now + 0.55);

    const chime = audioCtx.createOscillator();
    const chimeGain = audioCtx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(toDay ? 523 : 330, now);
    chime.frequency.setValueAtTime(toDay ? 659 : 262, now + 0.12);

    chimeGain.gain.setValueAtTime(0, now);
    chimeGain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    chime.connect(chimeGain);
    chimeGain.connect(audioCtx.destination);
    chime.start(now);
    chime.stop(now + 0.45);
  }

  let isTransitioning = false;

  toggle.addEventListener('click', () => {
    if (isTransitioning) return;
    isTransitioning = true;

    const isNight = body.getAttribute('data-theme') === 'night';
    const toDay = isNight;

    playTransitionSound(toDay);

    arrowEl.classList.remove('flying');
    trailEl.classList.remove('sweeping-fire', 'sweeping-snow');
    void arrowEl.offsetWidth;
    arrowEl.classList.add('flying');

    setTimeout(() => {
      trailEl.classList.add(toDay ? 'sweeping-fire' : 'sweeping-snow');
    }, 100);

    spawnBurst(toDay ? 'fire' : 'snow');

    setTimeout(() => {
      body.setAttribute('data-theme', toDay ? 'day' : 'night');
      toggle.textContent = toDay ? '☀️' : '🌙';
    }, 400);

    setTimeout(() => {
      arrowEl.classList.remove('flying');
      trailEl.classList.remove('sweeping-fire', 'sweeping-snow');
      isTransitioning = false;
    }, 1200);
  });

  let particles = [];
  const maxBackgroundParticles = 25;

  let mouse = { x: null, y: null };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const isNight = body.getAttribute('data-theme') === 'night';
    spawnTrailParticle(mouse.x, mouse.y, isNight ? 'fire-trail' : 'leaf-trail');
  });

  function spawnTrailParticle(x, y, type) {
    if (particles.length > 150) return;
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: type === 'fire-trail' ? -(Math.random() * 1.2 + 0.4) : (Math.random() * 1.2 + 0.4),
      size: type === 'fire-trail' ? Math.random() * 3 + 1 : Math.random() * 6 + 3,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      life: 1.0,
      decay: Math.random() * 0.03 + 0.015,
      type
    });
  }

  function spawnBurst(type) {
    const count = 50;
    for (let i = 0; i < count; i++) {
      const progress = Math.random();
      const startX = canvas.width - (progress * canvas.width * 1.2);
      const startY = progress * canvas.height * 1.2;
      particles.push({
        x: startX + (Math.random() - 0.5) * 80,
        y: startY + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.6) * 3,
        vy: type === 'snow' ? Math.random() * 2 + 1 : -(Math.random() * 2 + 1),
        size: type === 'snow' ? Math.random() * 4 + 2 : Math.random() * 5 + 2,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        life: 1.0,
        decay: Math.random() * 0.012 + 0.006,
        type: type === 'snow' ? 'snow-burst' : 'fire-burst'
      });
    }
  }

  function drawLeaf(ctx, x, y, size, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(size * 0.5, -size * 0.2, size * 0.1, size);
    ctx.quadraticCurveTo(-size * 0.5, -size * 0.2, 0, -size);
    ctx.fill();
    ctx.restore();
  }

  function tickParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isNight = body.getAttribute('data-theme') === 'night';

    let ambientCount = particles.filter(p => p.type === 'ambient-ember' || p.type === 'ambient-leaf').length;
    if (ambientCount < maxBackgroundParticles) {
      particles.push({
        x: Math.random() * canvas.width,
        y: isNight ? canvas.height + 20 : -20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: isNight ? -(Math.random() * 0.8 + 0.4) : (Math.random() * 0.8 + 0.4),
        size: isNight ? Math.random() * 3 + 1.5 : Math.random() * 10 + 6,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        life: 1.0,
        decay: Math.random() * 0.005 + 0.002,
        type: isNight ? 'ambient-ember' : 'ambient-leaf'
      });
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.rotationSpeed || 0;

      if (p.type.startsWith('ambient-')) {

        if (p.y < -30 || p.y > canvas.height + 30 || p.x < -30 || p.x > canvas.width + 30) {
          particles.splice(i, 1);
          continue;
        }
      } else {
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
      }

      const drawLife = p.life || 1.0;
      ctx.globalAlpha = Math.max(0, drawLife);

      if (p.type === 'ambient-ember' || p.type === 'fire-burst' || p.type === 'fire-trail') {

        const isTrail = p.type === 'fire-trail';
        const rad = p.size * (isTrail ? 1.5 : 2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);

        const coreColor = isTrail ? '255, 230, 150' : '255, 160, 40';
        g.addColorStop(0, `rgba(${coreColor}, ${drawLife})`);
        g.addColorStop(1, `rgba(201, 80, 20, 0)`);
        
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();
      } 
      else if (p.type === 'ambient-leaf' || p.type === 'leaf-trail') {

        const isTrail = p.type === 'leaf-trail';
        const leafColor = isTrail 
          ? `rgba(165, 99, 54, ${drawLife * 0.8})`
          : `rgba(90, 140, 75, 0.45)`;
        
        drawLeaf(ctx, p.x, p.y, p.size, p.angle, leafColor);
      } 
      else if (p.type === 'snow-burst') {

        ctx.beginPath();
        ctx.fillStyle = `rgba(220, 235, 255, ${drawLife * 0.85})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1.0;
    requestAnimationFrame(tickParticles);
  }

  tickParticles();

  let activePanel = null;

  function closeAllPanels() {
    document.getElementById('storyPanel').classList.remove('open');
    document.getElementById('clanPanel').classList.remove('open');
    document.getElementById('aboutPanel').classList.remove('open');
    mainWrapper.classList.remove('shift-right', 'shift-left');
    activePanel = null;
  }

  function createFlashcardController(panelId, closeId, prevId, nextId, indicatorId, containerId, data) {
    const panel = document.getElementById(panelId);
    const closeBtn = document.getElementById(closeId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const indicator = document.getElementById(indicatorId);
    const container = document.getElementById(containerId);
    let currentIndex = 0;

    data.forEach((card, i) => {
      const div = document.createElement('div');
      div.className = 'flashcard' + (i === 0 ? ' active' : '');
      div.innerHTML = `<h2>${card.title}</h2>` +
        card.text.split('\n\n').map(p => `<p>${p}</p>`).join('');
      container.appendChild(div);
    });

    const cards = container.querySelectorAll('.flashcard');

    function update() {
      cards.forEach((c, i) => {
        c.classList.remove('active', 'exit-left');
        if (i < currentIndex) c.classList.add('exit-left');
      });
      cards[currentIndex].classList.add('active');
      indicator.textContent = `${currentIndex + 1} / ${data.length}`;
    }

    prevBtn.addEventListener('click', () => { if (currentIndex > 0) { currentIndex--; update(); } });
    nextBtn.addEventListener('click', () => { if (currentIndex < data.length - 1) { currentIndex++; update(); } });

    closeBtn.addEventListener('click', () => { closeAllPanels(); });

    indicator.textContent = `1 / ${data.length}`;

    return {
      open() {
        closeAllPanels();
        currentIndex = 0;
        update();
        panel.classList.add('open');
      }
    };
  }

  const eklavyaStory = [
    { title: "I am Eklavya", text: "I was born to Hiranyadhanus, king of the Nishada — my people, hunters and forest-dwellers, at home in the hills and the deep woods where the Aryan cities never reached. We were not counted among the four varnas. To the courts of Hastinapura, we did not exist at all. But in our forests, we were kings." },
    { title: "Why I sought a teacher", text: "From the time I could hold a bow, I knew archery was mine to master. My own people taught me what they could — hunting, tracking, the patience of stillness. But I had heard of Dronacharya, the greatest archer of the age, teacher to the Kuru princes.\n\nSo I walked north, out of my forests, into Hastinapura." },
    { title: "The refusal", text: "I found him — Drona — training the Pandavas and Kauravas. I bowed before him, touched his feet, and asked to be his student.\n\nHe looked at me the way one looks at something that does not belong. \"A Nishada,\" he said, as though the word itself were the answer. He would not teach me — not because I lacked skill, but because of where I was born.\n\nI left. But I did not leave empty." },
    { title: "What I built in the forest", text: "If he would not be my teacher in body, he would be my teacher in spirit. I shaped his likeness out of river clay with my own hands, and I set it in a clearing in the forest.\n\nEvery morning I bowed to it as if he stood there truly. Every day I practiced before it — the draw, the aim, the release.\n\nYears passed. No one taught me. No one watched. Only the clay, and my discipline, and the forest.\n\nI became something no one expected a Nishada to become." },
    { title: "The day they found me", text: "A dog wandered into my clearing — the Pandavas' hound. It barked at me, at my dark skin and my deerskin clothes.\n\nI loosed seven arrows in the space of a breath, and each one lodged in its open mouth — enough to stop the barking, not enough to draw blood.\n\nThat is how Drona found me again. He followed the astonished princes back to my clearing, and there he saw his own face staring back at him from clay." },
    { title: "What he asked of me", text: "He should have been proud. Instead, I watched something colder cross his face. Arjuna had come to him troubled — how could there be an archer greater than the prince he had sworn to make unrivaled?\n\nDrona asked for his guru-dakshina. His teacher's fee.\n\nHe asked for my thumb.\n\nI did not hesitate. I took my blade and I gave him what he asked, and I felt whatever future I might have had as the world's greatest archer leave with it." },
    { title: "What came after", text: "I did not vanish into the forest. I became king of my people. I stood among the great rulers at Yudhishthira's Rajasuya sacrifice, and I offered him respect as an equal, not a subject. My name outlived the wound.\n\nI am not the hero the courts remember first. But I am the one who built a teacher out of clay and river mud, and became something the world said a Nishada could never be." }
  ];

  const clanStory = [
    { title: "My people, the Nishada", text: "Let me tell you who we were, before you judge us only by the story the court poets chose to remember." },
    { title: "Where we lived", text: "We were not people of the city. Our home was the hill country, the deep forest, the places where rivers ran wild before they reached the temples and courts of men like Drona.\n\nSome called our country the slopes of the Aravallis; others knew us further south, in the shadow of the Vindhyas. Wherever the forest was thick and the hunting was good — that is where you found the Nishada." },
    { title: "How we lived", text: "We did not measure our worth in gold or in temple offerings. We measured it in what the forest gave to those who understood it. My people hunted. We fished the rivers. We knew the hills the way city-dwellers knew their own courtyards.\n\nThe bow was not a luxury to us — it was how we ate, how we survived, how a father taught a son what it meant to be a man.\n\nThat is why archery came easily to me. It was in my blood before I ever heard Dronacharya's name." },
    { title: "How they saw us", text: "The court called us outsiders. Not one of the four varnas claimed us — we were something else entirely. They wrote of us as dark-skinned, wild-haired, living on the fringes.\n\nBut we were not without honor even in their own stories. When Rama wandered in exile, it was a Nishada king, Guha, who received him and helped him cross the river. We were not always the villains — sometimes we were the ones who helped their heroes survive." },
    { title: "My father's kingdom", text: "My father, Hiranyadhanus, ruled our people with the same discipline he raised me with. Ours was said to be the greatest of the Nishada kingdoms in that age.\n\nEven the Kuru armies knew it — when Sahadeva marched south collecting tribute, it was our hills he passed through. We were tributaries, yes. But we were never nothing." },
    { title: "What I carried from them", text: "Everything Drona refused to give me, my people had already given me first — patience, precision, the discipline to sit still for hours in the undergrowth waiting for a single true shot.\n\nThe court taught its princes with silk and ceremony. The forest taught me with hunger and silence. I do not think their way was better. I think it was only louder.\n\nWhen history remembers me, it should remember that I did not rise from nothing. I rose from a people the courts refused to count." }
  ];

  const storyCtrl = createFlashcardController(
    'storyPanel', 'storyClose', 'storyPrev', 'storyNext', 'storyIndicator', 'storyCards', eklavyaStory
  );
  const clanCtrl = createFlashcardController(
    'clanPanel', 'clanClose', 'clanPrev', 'clanNext', 'clanIndicator', 'clanCards', clanStory
  );

  document.getElementById('storyLink').addEventListener('click', (e) => {
    e.preventDefault();
    if (activePanel === 'story') { closeAllPanels(); return; }
    storyCtrl.open();
    mainWrapper.classList.add('shift-right');
    activePanel = 'story';
  });

  document.getElementById('clanLink').addEventListener('click', (e) => {
    e.preventDefault();
    if (activePanel === 'clan') { closeAllPanels(); return; }
    clanCtrl.open();
    mainWrapper.classList.add('shift-left');
    activePanel = 'clan';
  });

  const aboutPanel = document.getElementById('aboutPanel');
  document.getElementById('aboutLink').addEventListener('click', (e) => {
    e.preventDefault();
    if (activePanel === 'about') { closeAllPanels(); return; }
    closeAllPanels();
    aboutPanel.classList.add('open');
    activePanel = 'about';
  });

  document.getElementById('aboutClose').addEventListener('click', () => {
    closeAllPanels();
  });

  document.addEventListener('click', (e) => {
    if (activePanel === 'story' || activePanel === 'clan') {
      const panel = document.getElementById(activePanel === 'story' ? 'storyPanel' : 'clanPanel');
      if (panel && !panel.contains(e.target) && !e.target.closest('#storyLink') && !e.target.closest('#clanLink')) {
        e.preventDefault();
        e.stopPropagation();
        closeAllPanels();
      }
    }
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activePanel) { closeAllPanels(); }
  });

});