// =================== //
// NETWORK BACKGROUND - PARTICLE GLOW ONLY //
// =================== //
let particles = [];
let accelerationActive = false;
let accelerationEndTime = 0;
const ACCELERATION_DURATION = 1000;
const NORMAL_SPEED = 0.6;
const ACCELERATED_SPEED = 2.8;

// Simple particle acceleration
function triggerParticleAcceleration() {
    accelerationActive = true;
    accelerationEndTime = Date.now();
}

// Particle system dengan glow hanya di particle
function createBackground() {
    const canvas = document.getElementById('networkCanvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    resizeCanvas();
    
    class Particle {
        constructor(x, y) {
            this.x = x || Math.random() * canvas.width;
            this.y = y || Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * NORMAL_SPEED;
            this.vy = (Math.random() - 0.5) * NORMAL_SPEED;
            this.originalVx = this.vx;
            this.originalVy = this.vy;
            this.radius = Math.random() * 2.0 + 0.7;
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.02;
        }
        
        update() {
            // Efek pulse ringan
            this.pulse += this.pulseSpeed;
            
            if (accelerationActive) {
                const elapsed = Date.now() - accelerationEndTime + ACCELERATION_DURATION;
                const progress = Math.min(elapsed / ACCELERATION_DURATION, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentSpeed = ACCELERATED_SPEED - (ACCELERATED_SPEED - NORMAL_SPEED) * easeOut;
                const directionX = Math.sign(this.originalVx) || 1;
                const directionY = Math.sign(this.originalVy) || 1;
                
                this.vx = directionX * Math.abs(this.originalVx) * (currentSpeed / NORMAL_SPEED);
                this.vy = directionY * Math.abs(this.originalVy) * (currentSpeed / NORMAL_SPEED);
                
                if (elapsed >= ACCELERATION_DURATION) {
                    accelerationActive = false;
                    this.vx = this.originalVx;
                    this.vy = this.originalVy;
                }
            }
            
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            
            this.x = Math.max(0, Math.min(canvas.width, this.x));
            this.y = Math.max(0, Math.min(canvas.height, this.y));
            
            if (!accelerationActive) {
                this.originalVx = this.vx;
                this.originalVy = this.vy;
            }
        }
        
        draw() {
            // Draw glow effect untuk particle saja
            const glowSize = this.radius * 2;
            const pulseFactor = 0.8 + Math.sin(this.pulse) * 0.2;
            
            // Outer glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
            
            let glowOpacity;
            if (accelerationActive) {
                glowOpacity = 0.15 * pulseFactor;
                ctx.fillStyle = `rgba(0, 200, 255, ${glowOpacity})`;
            } else {
                glowOpacity = 0.1 * pulseFactor;
                ctx.fillStyle = `rgba(0, 180, 255, ${glowOpacity})`;
            }
            
            ctx.fill();
            
            // Inner glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
            
            if (accelerationActive) {
                ctx.fillStyle = `rgba(0, 220, 255, ${0.1 * pulseFactor})`;
            } else {
                ctx.fillStyle = `rgba(0, 200, 255, ${0.07 * pulseFactor})`;
            }
            
            ctx.fill();
            
            // Draw particle utama
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            
            if (accelerationActive) {
                ctx.fillStyle = `rgba(0, 230, 255, ${0.8 * pulseFactor})`;
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'rgba(0, 200, 255, 0.6)';
            } else {
                ctx.fillStyle = `rgba(0, 200, 255, ${0.7 * pulseFactor})`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(0, 180, 255, 0.4)';
            }
            
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    function createParticles(count) {
        const newParticles = [];
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const cellWidth = canvas.width / cols;
        const cellHeight = canvas.height / rows;
        
        for (let i = 0; i < count; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = (col * cellWidth) + Math.random() * cellWidth;
            const y = (row * cellHeight) + Math.random() * cellHeight;
            newParticles.push(new Particle(x, y));
        }
        
        return newParticles;
    }
    
    const getParticleCount = () => {
        if (window.innerWidth < 480) return 40;
        if (window.innerWidth < 768) return 55;
        return 95;
    };
    
    particles = createParticles(getParticleCount());
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            particles = createParticles(getParticleCount());
        }, 100);
    });
    
    const getConnectionDistance = () => {
        if (window.innerWidth < 480) return 120;
        if (window.innerWidth < 768) return 140;
        return 160;
    };
    
    function drawConnections() {
        const connectionDistance = getConnectionDistance();
        for (let i = 0; i < particles.length; i++) {
            let connections = 0;
            const maxConnections = 5;
            
            for (let j = i + 1; j < particles.length && connections < maxConnections; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    const opacity = accelerationActive ? 
                        (1 - distance / connectionDistance) * 0.25 : 
                        (1 - distance / connectionDistance) * 0.2;
                    
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    
                    if (accelerationActive) {
                        ctx.strokeStyle = `rgba(0, 200, 255, ${opacity})`;
                        ctx.lineWidth = 1.1;
                        ctx.shadowBlur = 5;
                        ctx.shadowColor = 'rgba(0, 200, 255, 0.3)';
                    } else {
                        ctx.strokeStyle = `rgba(0, 180, 255, ${opacity})`;
                        ctx.lineWidth = 1;
                    }
                    
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    connections++;
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        drawConnections();
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    setInterval(() => {
        if (!accelerationActive && Math.random() > 0.9) {
            triggerParticleAcceleration();
        }
    }, 5000);
}

// =================== //
// ANIMATED MOBILE MENU //
// =================== //
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

// Toggle mobile menu dengan animasi
function toggleMobileMenu() {
    const isActive = !navLinks.classList.contains('active');
    
    // Toggle kelas active
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
    
    // Update aria-expanded
    mobileMenuBtn.setAttribute('aria-expanded', isActive);
    
    // Toggle body scroll
    document.body.style.overflow = isActive ? 'hidden' : '';
    
    // Trigger particle acceleration untuk efek visual
    if (isActive) {
        triggerParticleAcceleration();
        
        // Tambahkan efek ripple
        createRippleEffect(mobileMenuBtn);
    }
}

// Efek ripple untuk button
function createRippleEffect(button) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(0, 168, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Tambahkan style untuk ripple animation
if (!document.querySelector('#ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Event listener untuk hamburger button
mobileMenuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    toggleMobileMenu();
});

// Close menu ketika klik di luar
document.addEventListener('click', function(e) {
    if (navLinks.classList.contains('active') && 
        !navLinks.contains(e.target) && 
        !mobileMenuBtn.contains(e.target)) {
        closeMobileMenu();
    }
});

// Close menu ketika klik link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            // Efek visual ketika menu item diklik
            this.style.backgroundColor = 'rgba(0, 168, 255, 0.2)';
            setTimeout(() => {
                this.style.backgroundColor = '';
            }, 300);
            
            // Tutup menu setelah delay
            setTimeout(() => {
                closeMobileMenu();
            }, 300);
        }
    });
});

// Fungsi untuk close menu
function closeMobileMenu() {
    mobileMenuBtn.classList.remove('active');
    navLinks.classList.remove('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        // Reset menu state on desktop
        closeMobileMenu();
    }
});

// Inisialisasi: Sembunyikan menu di mobile saat load
window.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= 768) {
        navLinks.style.display = 'none';
        // Set display ke flex setelah sedikit delay untuk animasi
        setTimeout(() => {
            navLinks.style.display = 'flex';
        }, 10);
    }
});

// =================== //
// ACTIVE NAVIGATION //
// =================== //
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    const scrollPos = window.scrollY + 100;
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            currentSection = sectionId;
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// =================== //
// SCROLL ANIMATION //
// =================== //
function checkVisibility() {
    const sections = document.querySelectorAll('section');
    const windowHeight = window.innerHeight;
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        
        if (sectionTop < windowHeight * 0.85) {
            section.classList.add('visible');
        }
    });
}

// =================== //
// SCROLL TO TOP //
// =================== //
const scrollTopBtn = document.getElementById('scrollTop');

function toggleScrollTop() {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    triggerParticleAcceleration();
});

// =================== //
// COPY TO CLIPBOARD //
// =================== //
document.querySelectorAll('.contact-item[data-copy]').forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
        const textToCopy = this.getAttribute('data-copy');
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            this.classList.add('copied');
            setTimeout(() => {
                this.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.classList.add('copied');
                setTimeout(() => {
                    this.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Fallback copy failed:', err);
            }
            document.body.removeChild(textArea);
        });
    });
    
    item.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
});

// =================== //
// SMOOTH SCROLL //
// =================== //
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (!anchor.closest('.nav-links') && !anchor.classList.contains('cta-btn') && !anchor.classList.contains('logo')) {
        return;
    }
    
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const offsetTop = target.offsetTop - navbarHeight;
            
            triggerParticleAcceleration();
            
            // Close mobile menu if open
            if (window.innerWidth <= 768 && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
                mobileMenuBtn.style.transform = 'rotate(0deg)';
            }
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            history.pushState(null, null, href);
        }
    });
});

// =================== //
// TYPING ANIMATION //
// =================== //
function typeText(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// =================== //
// NAVBAR SCROLL EFFECT //
// =================== //
const navbar = document.querySelector('.navbar');
function handleNavbarScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// =================== //
// CERTIFICATE FUNCTIONS //
// =================== //
function previewCertificate(title, issuer, description, imagePath, driveLink) {
    closeCertificateModal();
    
    const modal = document.createElement('div');
    modal.className = 'cert-modal';
    modal.innerHTML = `
        <div class="cert-modal-content">
            <div class="cert-modal-header">
                <div class="cert-modal-title">
                    <h3>${title}</h3>
                    <div class="cert-modal-issuer">${issuer}</div>
                </div>
                <div class="cert-modal-actions">
                    <a href="${driveLink}" class="cert-modal-btn" target="_blank" rel="noopener noreferrer" aria-label="Verify certificate">
                        <i class="fas fa-external-link-alt"></i>
                        Verify
                    </a>
                    <button class="cert-modal-close" aria-label="Close certificate modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="cert-modal-body">
                <div class="cert-modal-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading certificate...</p>
                </div>
                <div class="cert-modal-error" style="display: none;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Unable to load certificate image.</p>
                    <p>Please use the button above to verify.</p>
                </div>
                <img src="${imagePath}" 
                     alt="${title} Certificate" 
                     class="certificate-image"
                     onload="hideCertificateLoading(this)" 
                     onerror="showCertificateError(this)"
                     loading="lazy">
            </div>
            <div class="cert-modal-footer">
                <p class="cert-modal-description">${description}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    const closeBtn = modal.querySelector('.cert-modal-close');
    closeBtn.addEventListener('click', closeCertificateModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCertificateModal();
        }
    });
    
    modal.setAttribute('tabindex', '-1');
    modal.focus();
    
    triggerParticleAcceleration();
    
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeCertificateModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function hideCertificateLoading(imgElement) {
    const loading = imgElement.parentElement.querySelector('.cert-modal-loading');
    const error = imgElement.parentElement.querySelector('.cert-modal-error');
    
    if (loading) loading.style.display = 'none';
    if (error) error.style.display = 'none';
    imgElement.style.display = 'block';
}

function showCertificateError(imgElement) {
    const loading = imgElement.parentElement.querySelector('.cert-modal-loading');
    const error = imgElement.parentElement.querySelector('.cert-modal-error');
    
    if (loading) loading.style.display = 'none';
    if (error) error.style.display = 'flex';
    imgElement.style.display = 'none';
    
    console.error(`Failed to load certificate image: ${imgElement.src}`);
    
    setTimeout(() => {
        const fileName = imgElement.src.split('/').pop();
        const altPath = `sertif/${fileName}`;
        if (imgElement.src !== altPath) {
            imgElement.src = altPath;
        }
    }, 1000);
}

function closeCertificateModal() {
    const modal = document.querySelector('.cert-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            document.body.style.overflow = '';
        }, 300);
    }
}

// =================== //
// DIGITAL CLOCK //
// =================== //

let lastSeconds = -1;
let lastMinutes = -1;
let lastHours = -1;
let clockInterval = null;

function updateClockForNewStructure() {
    const now = new Date();
    
    // UTC+7 untuk WIB
    const utcOffset = 7;
    const localTime = new Date(now.getTime() + (utcOffset * 60 * 60 * 1000));
    
    const hours = String(localTime.getUTCHours()).padStart(2, '0');
    const minutes = String(localTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(localTime.getUTCSeconds()).padStart(2, '0');
    
    updateTimeUnitNew('hours', hours, lastHours);
    updateTimeUnitNew('minutes', minutes, lastMinutes);
    updateTimeUnitNew('seconds', seconds, lastSeconds);
    
    lastHours = hours;
    lastMinutes = minutes;
    lastSeconds = seconds;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                    'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[localTime.getUTCDay()];
    const date = localTime.getUTCDate();
    const monthName = months[localTime.getUTCMonth()];
    const year = localTime.getUTCFullYear();
    
    const dateString = `${dayName}, ${date} ${monthName} ${year}`;
    
    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) {
        dateDisplay.textContent = dateString;
    }
}

function updateTimeUnitNew(unit, newValue, oldValue) {
    const element = document.querySelector(`.time-unit-simple.${unit}`);
    if (!element) return;
    
    const currentDigit = element.querySelector('.digit.current');
    const nextDigit = element.querySelector('.digit.next');
    
    if (newValue !== oldValue) {
        if (nextDigit) nextDigit.textContent = newValue;
        
        element.classList.add('changing');
        
        setTimeout(() => {
            if (currentDigit) currentDigit.textContent = newValue;
            element.classList.remove('changing');
        }, 500);
    }
}

function initializeClockNew() {
    const now = new Date();
    const utcOffset = 7;
    const localTime = new Date(now.getTime() + (utcOffset * 60 * 60 * 1000));
    
    const hours = String(localTime.getUTCHours()).padStart(2, '0');
    const minutes = String(localTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(localTime.getUTCSeconds()).padStart(2, '0');
    
    const hourElements = document.querySelectorAll('.time-unit-simple.hours .digit');
    const minuteElements = document.querySelectorAll('.time-unit-simple.minutes .digit');
    const secondElements = document.querySelectorAll('.time-unit-simple.seconds .digit');
    
    if (hourElements.length >= 2) {
        hourElements[0].textContent = hours;
        hourElements[1].textContent = hours;
    }
    
    if (minuteElements.length >= 2) {
        minuteElements[0].textContent = minutes;
        minuteElements[1].textContent = minutes;
    }
    
    if (secondElements.length >= 2) {
        secondElements[0].textContent = seconds;
        secondElements[1].textContent = seconds;
    }
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                    'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[localTime.getUTCDay()];
    const date = localTime.getUTCDate();
    const monthName = months[localTime.getUTCMonth()];
    const year = localTime.getUTCFullYear();
    
    const dateString = `${dayName}, ${date} ${monthName} ${year}`;
    
    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) {
        dateDisplay.textContent = dateString;
    }
    
    lastHours = hours;
    lastMinutes = minutes;
    lastSeconds = seconds;
    
    if (clockInterval) {
        clearInterval(clockInterval);
    }
    
    clockInterval = setInterval(updateClockForNewStructure, 1000);
}

// =================== //
// INITIALIZATION //
// =================== //
window.addEventListener('DOMContentLoaded', () => {
    createBackground();
    checkVisibility();
    
    const loader = document.getElementById('loader');
    setTimeout(() => {
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 500);
    
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.classList.add('visible');
    }
    
    setTimeout(() => {
        const typingElement = document.getElementById('typingText');
        if (typingElement && typingElement.textContent.trim()) {
            const text = typingElement.textContent.trim();
            typeText(typingElement, text, 80);
        }
    }, 800);
    
    setTimeout(() => {
        triggerParticleAcceleration();
    }, 1000);
    
    initializeClockNew();
    
    updateActiveNav();
    toggleScrollTop();
    handleNavbarScroll();
    
    setTimeout(checkVisibility, 100);
});

// =================== //
// SCROLL EVENT LISTENERS //
// =================== //
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    
    scrollTimeout = window.requestAnimationFrame(() => {
        checkVisibility();
        updateActiveNav();
        toggleScrollTop();
        handleNavbarScroll();
    });
});

// =================== //
// RESIZE HANDLER //
// =================== //
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        initializeClockNew();
        checkVisibility();
    }, 250);
});