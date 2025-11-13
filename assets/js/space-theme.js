/**
 * Space Engineering Theme JavaScript
 * Provides interactive animations, cursor effects, and starfield background
 */

(function() {
  'use strict';

  // ==================== Starfield Background ====================
  class Starfield {
    constructor() {
      this.canvas = document.getElementById('starfield-canvas');
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'starfield-canvas';
        document.body.insertBefore(this.canvas, document.body.firstChild);
      }
      
      this.ctx = this.canvas.getContext('2d');
      this.stars = [];
      this.shootingStars = [];
      this.nebulaClouds = [];
      this.numStars = 400;
      this.time = 0;
      
      this.resize();
      this.init();
      this.animate();
      
      window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
    
    init() {
      this.stars = [];
      for (let i = 0; i < this.numStars; i++) {
        this.stars.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          radius: Math.random() * 2 + 0.3,
          opacity: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
          driftSpeedX: (Math.random() - 0.5) * 0.1,
          driftSpeedY: (Math.random() - 0.5) * 0.1
        });
      }
      
      // Create nebula clouds
      this.nebulaClouds = [];
      for (let i = 0; i < 8; i++) {
        this.nebulaClouds.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          radius: Math.random() * 150 + 100,
          color: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#8b5cf6' : '#ec4899',
          opacity: Math.random() * 0.08 + 0.03,
          driftSpeedX: (Math.random() - 0.5) * 0.2,
          driftSpeedY: (Math.random() - 0.5) * 0.2
        });
      }
    }
    
    createShootingStar() {
      if (Math.random() > 0.97 && this.shootingStars.length < 5) {
        this.shootingStars.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height * 0.5,
          length: Math.random() * 120 + 60,
          speed: Math.random() * 5 + 3,
          opacity: 1,
          angle: Math.random() * Math.PI / 6 + Math.PI / 6 // 30-60 degrees
        });
      }
    }
    
    drawNebulaClouds() {
      this.nebulaClouds.forEach(cloud => {
        // Drift the clouds
        cloud.x += cloud.driftSpeedX;
        cloud.y += cloud.driftSpeedY;
        
        // Wrap around screen
        if (cloud.x < -cloud.radius) cloud.x = this.canvas.width + cloud.radius;
        if (cloud.x > this.canvas.width + cloud.radius) cloud.x = -cloud.radius;
        if (cloud.y < -cloud.radius) cloud.y = this.canvas.height + cloud.radius;
        if (cloud.y > this.canvas.height + cloud.radius) cloud.y = -cloud.radius;
        
        const gradient = this.ctx.createRadialGradient(
          cloud.x, cloud.y, 0,
          cloud.x, cloud.y, cloud.radius
        );
        gradient.addColorStop(0, cloud.color + Math.floor(cloud.opacity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.5, cloud.color + '10');
        gradient.addColorStop(1, cloud.color + '00');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      });
    }
    
    drawStars() {
      this.stars.forEach(star => {
        // Drift stars slowly
        star.x += star.driftSpeedX;
        star.y += star.driftSpeedY;
        
        // Wrap around screen
        if (star.x < 0) star.x = this.canvas.width;
        if (star.x > this.canvas.width) star.x = 0;
        if (star.y < 0) star.y = this.canvas.height;
        if (star.y > this.canvas.height) star.y = 0;
        
        star.twinklePhase += star.twinkleSpeed;
        const opacity = star.opacity + Math.sin(star.twinklePhase) * 0.3;
        
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.fill();
        
        // Larger stars get a colorful glow
        if (star.radius > 1.5) {
          this.ctx.beginPath();
          this.ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
          const glowColor = Math.sin(this.time * 0.001 + star.twinklePhase) > 0 ? '99, 102, 241' : '139, 92, 246';
          this.ctx.fillStyle = `rgba(${glowColor}, ${opacity * 0.4})`;
          this.ctx.fill();
        }
      });
    }
    
    drawShootingStars() {
      this.shootingStars = this.shootingStars.filter(star => {
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.01;
        
        if (star.opacity <= 0) return false;
        
        const gradient = this.ctx.createLinearGradient(
          star.x, star.y,
          star.x - Math.cos(star.angle) * star.length,
          star.y - Math.sin(star.angle) * star.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(0.5, `rgba(99, 102, 241, ${star.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.moveTo(star.x, star.y);
        this.ctx.lineTo(
          star.x - Math.cos(star.angle) * star.length,
          star.y - Math.sin(star.angle) * star.length
        );
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        return true;
      });
    }
    
    animate() {
      this.time++;
      
      // Create animated gradient background
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      const offset = Math.sin(this.time * 0.0005) * 0.1;
      gradient.addColorStop(0, `hsl(${210 + offset * 20}, 70%, ${8 + offset * 2}%)`);
      gradient.addColorStop(0.5, `hsl(${260 + offset * 20}, 60%, ${10 + offset * 2}%)`);
      gradient.addColorStop(1, `hsl(${270 + offset * 10}, 80%, ${8 + offset * 2}%)`);
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.drawNebulaClouds();
      this.drawStars();
      this.drawShootingStars();
      this.createShootingStar();
      
      requestAnimationFrame(() => this.animate());
    }
  }

  // ==================== Cursor Glow Effect ====================
  class CursorGlow {
    constructor() {
      this.glow = document.createElement('div');
      this.glow.className = 'cursor-glow';
      document.body.appendChild(this.glow);
      
      this.mouseX = 0;
      this.mouseY = 0;
      this.currentX = 0;
      this.currentY = 0;
      
      document.addEventListener('mousemove', (e) => this.onMouseMove(e));
      document.addEventListener('mouseenter', () => this.show());
      document.addEventListener('mouseleave', () => this.hide());
      
      this.animate();
    }
    
    onMouseMove(e) {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }
    
    show() {
      this.glow.classList.add('active');
    }
    
    hide() {
      this.glow.classList.remove('active');
    }
    
    animate() {
      // Smooth following
      this.currentX += (this.mouseX - this.currentX) * 0.1;
      this.currentY += (this.mouseY - this.currentY) * 0.1;
      
      this.glow.style.transform = `translate(${this.currentX - 150}px, ${this.currentY - 150}px)`;
      
      requestAnimationFrame(() => this.animate());
    }
  }

  // ==================== Card Mouse Tracking ====================
  class CardMouseTracker {
    constructor() {
      this.cards = document.querySelectorAll('.project-card, .skill-category');
      this.init();
    }
    
    init() {
      this.cards.forEach(card => {
        card.addEventListener('mousemove', (e) => this.onMouseMove(e, card));
        card.addEventListener('mouseleave', () => this.onMouseLeave(card));
      });
    }
    
    onMouseMove(e, card) {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
      
      // Subtle 3D tilt effect
      const tiltX = ((e.clientY - rect.top - rect.height / 2) / rect.height) * -5;
      const tiltY = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 5;
      
      card.style.transform = `translateY(-8px) scale(1.02) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }
    
    onMouseLeave(card) {
      card.style.transform = '';
    }
  }

  // ==================== Scroll Animations ====================
  class ScrollAnimations {
    constructor() {
      this.observeElements();
    }
    
    observeElements() {
      const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, options);
      
      const elements = document.querySelectorAll('.project-card, .skill-category, .section-header');
      elements.forEach(el => {
        observer.observe(el);
      });
    }
  }

  // ==================== Project Theme Adapter ====================
  class ProjectThemeAdapter {
    constructor() {
      this.applyThemes();
    }
    
    applyThemes() {
      const projects = document.querySelectorAll('.project-card');
      projects.forEach((card, index) => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        
        // Apply theme based on project content
        if (title.includes('space') || title.includes('infrastructure') || title.includes('satellite')) {
          card.classList.add('project-theme-space');
        } else if (title.includes('mars') || title.includes('red planet')) {
          card.classList.add('project-theme-mars');
        } else if (title.includes('drone') || title.includes('aerial') || title.includes('mapping')) {
          card.classList.add('project-theme-drone');
        } else if (title.includes('ai') || title.includes('robot') || title.includes('fact')) {
          card.classList.add('project-theme-ai');
        }
      });
    }
  }

  // ==================== Navigation Active State ====================
  class NavigationHighlighter {
    constructor() {
      this.updateActiveLink();
      window.addEventListener('hashchange', () => this.updateActiveLink());
    }
    
    updateActiveLink() {
      const currentPath = window.location.pathname;
      const navLinks = document.querySelectorAll('nav a');
      
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (currentPath === href || currentPath.includes(href) && href !== '/')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  // ==================== Parallax Hero Effect ====================
  class ParallaxHero {
    constructor() {
      this.hero = document.querySelector('.hero');
      if (!this.hero) return;
      
      window.addEventListener('scroll', () => this.onScroll());
    }
    
    onScroll() {
      const scrolled = window.pageYOffset;
      const heroHeight = this.hero.offsetHeight;
      
      if (scrolled < heroHeight) {
        const opacity = 1 - (scrolled / heroHeight) * 0.5;
        const translateY = scrolled * 0.3;
        
        this.hero.style.opacity = opacity;
        this.hero.querySelector('.hero-content').style.transform = `translateY(${translateY}px)`;
      }
    }
  }

  // ==================== Button Ripple Effect ====================
  class ButtonRipple {
    constructor() {
      this.buttons = document.querySelectorAll('.btn, .project-link, .social-link');
      this.init();
    }
    
    init() {
      this.buttons.forEach(button => {
        button.addEventListener('click', (e) => this.createRipple(e, button));
      });
    }
    
    createRipple(e, button) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: translate(-50%, -50%);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: ripple-animation 0.6s ease-out;
      `;
      
      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    }
  }

  // Add ripple animation CSS dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple-animation {
      to {
        width: 300px;
        height: 300px;
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // ==================== Initialize Everything ====================
  function init() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      new Starfield();
      new CursorGlow();
      new ParallaxHero();
    }
    
    new CardMouseTracker();
    new ScrollAnimations();
    new ProjectThemeAdapter();
    new NavigationHighlighter();
    new ButtonRipple();
    
    console.log('🚀 Space Engineering Theme loaded successfully!');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
