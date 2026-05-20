/* ========================================
   KOF CHITRADURGA - MAIN JAVASCRIPT
   Advanced UI Interactions & Animations 2026
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // === PRELOADER ===
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('loaded');
            }, 800);
        });
        // Fallback
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 2500);
    }

    // === NAVBAR SCROLL ===
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // === MOBILE MENU ===
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close on link click
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // === SCROLL REVEAL ===
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    scrollRevealElements.forEach(el => {
        revealObserver.observe(el);
    });


    // === SMOOTH NUMBER COUNTER WITH EASING ===
    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function animateCounters() {
        const counters = document.querySelectorAll('[data-count]');
        counters.forEach(counter => {
            if (counter.classList.contains('counted')) return;
            counter.classList.add('counted');
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2500;
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutExpo(progress);
                const current = Math.ceil(easedProgress * target);
                counter.textContent = formatNumber(current);
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = formatNumber(target);
                }
            };

            requestAnimationFrame(updateCounter);
        });
    }

    function formatNumber(num) {
        if (num >= 1000) {
            return num.toLocaleString('en-IN');
        }
        return num;
    }

    // Trigger counters when stats sections are visible
    const statsSection = document.querySelector('.hero-stats') || document.querySelector('.impact-grid');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        statsObserver.observe(statsSection);
    }

    // Also observe impact grid separately if it exists and hero stats exist
    const impactGrid = document.querySelector('.impact-grid');
    if (impactGrid && impactGrid !== statsSection) {
        const impactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    impactObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        impactObserver.observe(impactGrid);
    }

    // === BACK TO TOP ===
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // === WHATSAPP BUTTON SHOW/HIDE ON SCROLL ===
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (whatsappFloat) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 200) {
                whatsappFloat.classList.add('visible');
            } else {
                whatsappFloat.classList.remove('visible');
            }
        });
    }

    // === SOCIAL FLOAT BAR TOGGLE ON SCROLL ===
    const socialFloatBar = document.querySelector('.social-float-bar');
    if (socialFloatBar) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                socialFloatBar.classList.add('visible');
            } else {
                socialFloatBar.classList.remove('visible');
            }
        });
    }

    // === DARK MODE TOGGLE SUPPORT ===
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
    document.body.appendChild(darkModeToggle);

    // Show toggle after scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 200) {
            darkModeToggle.classList.add('visible');
        } else {
            darkModeToggle.classList.remove('visible');
        }
    });

    // Check saved preference
    const savedTheme = localStorage.getItem('kof-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('kof-theme', isDark ? 'dark' : 'light');
    });

    // === TESTIMONIAL SLIDER ===
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dotsContainer = document.getElementById('testimonialDots');
    let currentTestimonial = 0;

    if (testimonialCards.length > 0 && dotsContainer) {
        // Create dots
        testimonialCards.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToTestimonial(index));
            dotsContainer.appendChild(dot);
        });

        function goToTestimonial(index) {
            testimonialCards[currentTestimonial].classList.remove('active');
            dotsContainer.children[currentTestimonial].classList.remove('active');
            currentTestimonial = index;
            testimonialCards[currentTestimonial].classList.add('active');
            dotsContainer.children[currentTestimonial].classList.add('active');
        }

        // Auto-advance
        setInterval(() => {
            const next = (currentTestimonial + 1) % testimonialCards.length;
            goToTestimonial(next);
        }, 5000);
    }


    // === PRODUCT FILTERS WITH ANIMATION ===
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-detail-card');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button with animation
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');
                let delay = 0;

                productCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'grid';
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(30px) scale(0.95)';
                        card.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0) scale(1)';
                        }, delay);
                        delay += 100;
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(-20px) scale(0.95)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // === PARALLAX EFFECT ON HERO SECTION ===
    const hero = document.querySelector('.hero') || document.querySelector('.page-hero');
    const heroContent = document.querySelector('.hero-content') || document.querySelector('.page-hero-content');

    if (hero && heroContent) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroHeight = hero.offsetHeight;
            if (scrolled < heroHeight) {
                const parallaxSpeed = 0.4;
                heroContent.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
                heroContent.style.opacity = 1 - (scrolled / heroHeight) * 0.8;
            }
        });
    }

    // === HERO PARTICLES ===
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const size = Math.random() * 6 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            const colors = [
                'rgba(46, 204, 113, 0.3)',
                'rgba(240, 165, 0, 0.3)',
                'rgba(108, 60, 224, 0.2)',
                'rgba(255, 255, 255, 0.1)'
            ];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 6 + 6) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    // === SMOOTH SCROLL FOR ANCHOR LINKS ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // === FORM HANDLING ===
    const forms = document.querySelectorAll('.modern-form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Submitted Successfully!';
            btn.style.background = 'var(--primary)';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.style.background = '';
                form.reset();
            }, 3000);
        });
    });

    // === NAVBAR ACTIVE LINK (based on current page) ===
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });

    // === STAGGER REVEAL FOR GRIDS ===
    const staggerContainers = document.querySelectorAll('.activities-grid, .benefits-grid, .why-grid, .partners-grid, .crops-grid, .join-steps, .impact-grid');
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    staggerContainers.forEach(container => {
        container.classList.add('stagger-reveal');
        staggerObserver.observe(container);
    });

}); // End DOMContentLoaded
