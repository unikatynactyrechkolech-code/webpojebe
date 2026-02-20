/**
 * WebPojede - Main JavaScript
 * Lando Norris inspired smooth interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollAnimations();
    initCounters();
    initFAQ();
    initContactForm();
    initSmoothScroll();
    initMagneticButtons();
    initParallax();
    initTextReveal();
});

/**
 * Navigation
 */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const nav = document.querySelector('.nav');
    
    // Mobile menu toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
    
    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (navLinks && navLinks.classList.contains('active')) {
            if (!e.target.closest('.nav-links') && !e.target.closest('.nav-toggle')) {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        }
    });
    
    // Nav background on scroll
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 10) {
            nav.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
    
    // Mark current page in navigation
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/**
 * Scroll Animations
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
    
    // Also animate elements without data-aos for general fade-in
    document.querySelectorAll('.service-card, .pricing-card, .pricing-card-full, .feature-card, .value-card, .team-card, .tech-card').forEach(el => {
        if (!el.hasAttribute('data-aos')) {
            el.setAttribute('data-aos', 'fade-up');
            observer.observe(el);
        }
    });
}

/**
 * Counter Animation - Numbers jump up with easing
 */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.dataset.count) || 0;
    const suffix = element.dataset.suffix || '';
    const duration = 2000;
    const startTime = performance.now();
    
    // Easing function for smooth animation
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
    
    const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const current = Math.floor(easedProgress * target);
        
        element.innerHTML = current + '<span class="stat-suffix">' + suffix + '</span>';
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.innerHTML = target + '<span class="stat-suffix">' + suffix + '</span>';
        }
    };
    
    requestAnimationFrame(updateCounter);
}

/**
 * FAQ Accordion
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/**
 * Contact Form - Resend API integration
 */
function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    
    // Form validation visual feedback
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.required && !input.value.trim()) {
                input.style.borderColor = '#ff3b30';
            } else {
                input.style.borderColor = '';
            }
        });
        
        input.addEventListener('input', () => {
            input.style.borderColor = '';
        });
    });
    
    // Form submission via Resend API
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Odesílám...';
        submitBtn.disabled = true;
        
        // Collect form data
        const formData = {
            name: form.querySelector('#name').value,
            email: form.querySelector('#email').value,
            phone: form.querySelector('#phone')?.value || '',
            service: form.querySelector('#service')?.value || '',
            tariff: form.querySelector('#tariff')?.value || '',
            message: form.querySelector('#message').value
        };
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                showFormSuccess();
            } else {
                showFormError(result.error || 'Něco se pokazilo. Zkuste to prosím znovu.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormError('Nepodařilo se odeslat zprávu. Zkontrolujte připojení k internetu.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

function showFormSuccess() {
    const formWrapper = document.querySelector('.contact-form-wrapper');
    if (formWrapper) {
        formWrapper.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: #34c759; margin-bottom: 20px; display: block;"></i>
                <h3 style="font-size: 1.5rem; margin-bottom: 12px;">Zpráva odeslána!</h3>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">Děkujeme za vaši zprávu. Ozveme se vám co nejdříve.</p>
                <a href="index.html" class="btn btn-primary">Zpět na hlavní stránku</a>
            </div>
        `;
    }
}

function showFormError(message) {
    // Remove any existing error
    const existingError = document.querySelector('.form-error');
    if (existingError) existingError.remove();
    
    const form = document.querySelector('.contact-form');
    if (form) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = 'background: #ffebee; color: #c62828; padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: center;';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        form.insertBefore(errorDiv, form.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Add loading animation to page
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});



/**
 * Magnetic Buttons Effect
 */
function initMagneticButtons() {
    // Only on devices with hover capability
    if (!window.matchMedia('(hover: hover)').matches) return;
    
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

/**
 * Parallax Effect on Hero
 */
function initParallax() {
    const hero = document.querySelector('.hero');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (!hero || !heroVisual) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        
        if (scrolled < heroHeight) {
            const parallaxValue = scrolled * 0.3;
            heroVisual.style.transform = `translateY(${parallaxValue}px)`;
        }
    });
}

/**
 * Text Reveal Animation
 */
function initTextReveal() {
    const revealElements = document.querySelectorAll('.section-title, .page-title, .hero-title');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    revealElements.forEach(el => {
        el.classList.add('reveal-text');
        observer.observe(el);
    });
}

/**
 * Browser Mockup Slideshow
 * Slideshow se spustí až když někdo najede myší nebo klikne na mockup
 */
function initBrowserSlideshow() {
    const mockup = document.querySelector('.browser-mockup');
    if (!mockup) return;
    
    const slides = mockup.querySelectorAll('.mockup-slide');
    const dots = mockup.querySelectorAll('.browser-dots-nav .dot');
    const urlText = mockup.querySelector('.url-text');
    const urls = urlText ? urlText.dataset.urls.split(',') : [];
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    const interval = 3000; // 3 sekundy
    let isActive = false;
    let autoSlideInterval = null;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        if (urlText && urls[index]) {
            urlText.textContent = urls[index];
        }
    }
    
    function nextSlide() {
        if (!isActive) return;
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }
    
    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, interval);
    }
    
    function activateSlideshow() {
        if (!isActive) {
            isActive = true;
            startAutoSlide();
        }
    }
    
    function deactivateSlideshow() {
        isActive = false;
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
        // Vrátit na první slide (webpojede.cz)
        currentSlide = 0;
        showSlide(0);
    }
    
    // Kliknutí na tečky
    dots.forEach((dot, i) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            currentSlide = i;
            showSlide(currentSlide);
            activateSlideshow();
        });
    });
    
    // Aktivace při interakci s mockupem
    mockup.addEventListener('mouseenter', activateSlideshow);
    mockup.addEventListener('mouseleave', deactivateSlideshow);
    mockup.addEventListener('touchstart', activateSlideshow);
    
    // Na mobilech - deaktivace při kliknutí mimo
    document.addEventListener('click', (e) => {
        if (!mockup.contains(e.target)) {
            deactivateSlideshow();
        }
    });
}

// Spustit slideshow
initBrowserSlideshow();

// Console Easter Egg
console.log('%c🚀 WebPojede', 'font-size: 24px; font-weight: bold; color: #0071e3;');
console.log('%cZajímá vás webový vývoj? Kontaktujte nás!', 'font-size: 14px; color: #86868b;');
console.log('%chttps://webpojede.cz', 'font-size: 14px; color: #0071e3;');
