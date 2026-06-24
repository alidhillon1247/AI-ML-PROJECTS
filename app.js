/* ==========================================================================
   INTERACTIVE CANVAS BACKGROUND
   ========================================================================== */
const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');

let particlesArray = [];
const baseSpeed = 0.5;
const connectionDistance = 120;
let mouse = {
    x: null,
    y: null,
    radius: 150
};

// Set canvas dimensions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Track mouse position for particle connection and repulsion
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1; // particle size 1px to 3px
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.vx = (Math.random() - 0.5) * baseSpeed;
        this.vy = (Math.random() - 0.5) * baseSpeed;
    }

    draw() {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        // Move particle normally
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

        // Mouse repulsion logic
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density * 0.4;
                let directionY = forceDirectionY * force * this.density * 0.4;

                this.x -= directionX;
                this.y -= directionY;
            }
        }
    }
}

function initParticles() {
    particlesArray = [];
    let numberOfParticles = (canvas.width * canvas.height) / 9000;
    numberOfParticles = Math.min(numberOfParticles, 120); // Cap particles for performance
    
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function connectParticles() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                // Line opacity increases as particles get closer
                let opacity = (1 - (distance / connectionDistance)) * 0.15;
                ctx.strokeStyle = `rgba(189, 0, 255, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    connectParticles();
    requestAnimationFrame(animateParticles);
}

// Re-init particles on screen resize
window.addEventListener('resize', initParticles);
initParticles();
animateParticles();


/* ==========================================================================
   CUSTOM CURSOR LOGIC
   ========================================================================== */
const cursor = document.getElementById('custom-cursor');
const cursorDot = document.getElementById('custom-cursor-dot');

let cursorX = 0, cursorY = 0; // Current position of custom outer cursor
let targetX = 0, targetY = 0; // Target mouse position
let dotX = 0, dotY = 0; // Inner dot coordinates
let isVisible = false;

window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    
    if (!isVisible) {
        cursor.style.opacity = '1';
        cursorDot.style.opacity = '1';
        isVisible = true;
    }
});

// Linear interpolation (lerp) loop for smooth cursor lag
function updateCursor() {
    // Outer cursor has lag (lerp factor 0.12)
    cursorX += (targetX - cursorX) * 0.12;
    cursorY += (targetY - cursorY) * 0.12;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    // Inner dot has almost no lag (lerp factor 0.3)
    dotX += (targetX - dotX) * 0.3;
    dotY += (targetY - dotY) * 0.3;
    cursorDot.style.left = `${dotX}px`;
    cursorDot.style.top = `${dotY}px`;

    requestAnimationFrame(updateCursor);
}
requestAnimationFrame(updateCursor);

// Add hover effect states
const hoverElements = document.querySelectorAll('a, button, .filter-btn, .project-card, input, textarea');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
    });
});

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
    isVisible = false;
});


/* ==========================================================================
   HERO TYPING EFFECT
   ========================================================================== */
const roles = ["AI & ML Enthusiast.", "BSCS Student.", "Web Developer.", "Problem Solver."];
const typingText = document.getElementById('typing-text');

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function type() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
        // Deleting letters
        typingText.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50; // Speed up deleting
    } else {
        // Adding letters
        typingText.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 150; // Normal typing speed
    }

    // Determine state change
    if (!isDeleting && charIndex === currentRole.length) {
        typeSpeed = 2000; // Pause at end of word
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length; // Move to next word
        typeSpeed = 500; // Pause before typing new word
    }

    setTimeout(type, typeSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(type, 1000); // Start typing after brief page load delay
});


/* ==========================================================================
   MOBILE MENU TOGGLE
   ========================================================================== */
const navToggle = document.querySelector('.mobile-nav-toggle');
const primaryNav = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    const visible = primaryNav.getAttribute('data-visible') === 'true';
    
    if (!visible) {
        primaryNav.setAttribute('data-visible', true);
        navToggle.setAttribute('aria-expanded', true);
    } else {
        primaryNav.setAttribute('data-visible', false);
        navToggle.setAttribute('aria-expanded', false);
    }
});

// Close menu when clicking nav link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        primaryNav.setAttribute('data-visible', false);
        navToggle.setAttribute('aria-expanded', false);
    });
});


/* ==========================================================================
   RADIAL GLOW EFFECT FOR CARDS
   ========================================================================== */
const glassPanels = document.querySelectorAll('.glass-panel');

glassPanels.forEach(panel => {
    panel.addEventListener('mousemove', (e) => {
        const rect = panel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        panel.style.setProperty('--x', `${x}px`);
        panel.style.setProperty('--y', `${y}px`);
    });
});


/* ==========================================================================
   INTERSECTION OBSERVER (SCROLL REVEAL & SKILLS INITIATION)
   ========================================================================== */
const scrollElements = document.querySelectorAll('.scroll-reveal');

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            
            // If the section is skills, highlight the skills progress bars
            if (entry.target.id === 'skills') {
                entry.target.classList.add('active');
            }
        }
    });
}, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
});

scrollElements.forEach(el => {
    scrollObserver.observe(el);
});


/* ==========================================================================
   PROJECTS FILTER LOGIC
   ========================================================================== */
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active filter button styling
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            
            if (filterValue === 'all' || category === filterValue) {
                card.classList.remove('hide');
                // Retrigger CSS entry transitions if cards reappear
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9) translateY(10px)';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1) translateY(0)';
                    card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                }, 50);
            } else {
                card.classList.add('hide');
            }
        });
    });
});


/* ==========================================================================
   ACTIVE NAVIGATION SCROLL-SPY
   ========================================================================== */
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.pageYOffset + 200; // Offset for detection triggers

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });

    // Shrink header style on scroll
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});


/* ==========================================================================
   CONTACT FORM HANDLER
   ========================================================================== */
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('form-submit-btn');
const submitSpinner = document.getElementById('submit-spinner');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Show spinner, disable button
    submitSpinner.classList.remove('hidden');
    submitBtn.setAttribute('disabled', true);
    
    // Simulate API Network call
    setTimeout(() => {
        submitSpinner.classList.add('hidden');
        submitBtn.removeAttribute('disabled');
        
        // Reset form
        contactForm.reset();
        
        // Premium Feedback Notification (Simple visual alert styling for now)
        alert('✨ Message sent successfully! Thank you for reaching out, Ali will get back to you shortly.');
    }, 1800);
});
