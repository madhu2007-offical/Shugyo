/* Purely Additive Motion Layer */

(function () {
  // 1. Initialize Scroll Progress Bar
  let scrollBar = document.getElementById('motion-scroll-bar');
  if (!scrollBar) {
    scrollBar = document.createElement('div');
    scrollBar.id = 'motion-scroll-bar';
    document.body.appendChild(scrollBar);
  }

  window.addEventListener('scroll', () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0) {
      const pct = (window.scrollY / totalScroll) * 100;
      scrollBar.style.width = pct + '%';
    } else {
      scrollBar.style.width = '0%';
    }
  });

  // 2. Animated Counters Function (requestAnimationFrame with easeOutCubic)
  function animateCounter(el) {
    if (el.getAttribute('data-animated') === 'true') return;
    el.setAttribute('data-animated', 'true');

    const target = parseFloat(el.getAttribute('data-target'));
    if (isNaN(target)) return;

    let startTimestamp = null;
    const duration = 1100; // 1.1 seconds

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const currentValue = Math.floor(easedProgress * target);
      
      const suffix = el.getAttribute('data-suffix') || '';
      el.innerText = currentValue + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.innerText = target + suffix;
      }
    };
    window.requestAnimationFrame(step);
  }

  // 3. Observers for viewport triggers (scroll-reveal & counters)
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        
        // Handle staggered delays on children if stagger class is active
        if (entry.target.classList.contains('reveal-stagger')) {
          const children = entry.target.children;
          Array.from(children).forEach((child, index) => {
            child.style.transitionDelay = (index * 0.08) + 's';
          });
        }
        
        // If it's a counter, trigger animation
        if (entry.target.classList.contains('motion-counter')) {
          animateCounter(entry.target);
        }
      }
    });
  }, { threshold: 0.02 });

  // 4. Hero cursor glow coordinate binder
  function bindHeroGlow(heroEl) {
    if (heroEl.getAttribute('data-glow-bound') === 'true') return;
    heroEl.setAttribute('data-glow-bound', 'true');

    // Add mouse move listeners
    heroEl.addEventListener('mousemove', (e) => {
      const rect = heroEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      heroEl.style.setProperty('--mouse-x', `${x}px`);
      heroEl.style.setProperty('--mouse-y', `${y}px`);
    });
  }

  // 5. SVG flowchart edge drawer helper
  window.animateFlowchart = function (svg) {
    if (!svg) return;
    const paths = svg.querySelectorAll('.fc-edge');
    paths.forEach(p => {
      // Re-trigger dasharray animation by resetting offset
      p.style.animation = 'none';
      // force reflow
      void p.offsetWidth;
      p.style.animation = 'draw-path 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    });
  };

  // 6. Global binder scanning new DOM elements
  function scanAndBindElements() {
    // Locate reveal targets
    const reveals = document.querySelectorAll('.reveal, .reveal-stagger, .motion-counter');
    reveals.forEach(el => revealObserver.observe(el));

    // Locate hero blocks
    const heroes = document.querySelectorAll('.hero');
    heroes.forEach(h => bindHeroGlow(h));

    // Locate svg flowcharts
    const flowcharts = document.querySelectorAll('#flowchart');
    flowcharts.forEach(svg => {
      if (svg.getAttribute('data-flow-bound') !== 'true') {
        svg.setAttribute('data-flow-bound', 'true');
        window.animateFlowchart(svg);
      }
    });
  }

  // Run scanner on initial script execution
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAndBindElements);
  } else {
    scanAndBindElements();
  }

  // 7. MutationObserver to handle React dynamic route updates cleanly
  const domObserver = new MutationObserver(() => {
    scanAndBindElements();
  });
  domObserver.observe(document.body, { childList: true, subtree: true });

})();
