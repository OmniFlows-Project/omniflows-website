document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.demo-slide');
    const pipsContainer = document.getElementById('slide-pips');
    const nextBtn = document.getElementById('next-slide');
    const prevBtn = document.getElementById('prev-slide');
    let currentSlide = 0;
    let autoPlayInterval;
    let isTheaterMode = false;

    const heroDemo = document.getElementById('demo');
    const demoWindow = document.getElementById('demo-window');
    const theaterClose = document.getElementById('theater-close');

    // Create dots (pips)
    slides.forEach((_, i) => {
        const pip = document.createElement('span');
        if (i === 0) pip.classList.add('active');
        pip.addEventListener('click', () => goToSlide(i, 'pip_click'));
        pipsContainer.appendChild(pip);
    });

    const pips = pipsContainer.querySelectorAll('span');
    const controlCaptions = document.querySelectorAll('.control-caption');

    function goToSlide(n, method = 'direct') {
        slides[currentSlide].classList.remove('active');
        pips[currentSlide].classList.remove('active');
        if (controlCaptions.length > 0) controlCaptions[currentSlide].classList.remove('active');
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        pips[currentSlide].classList.add('active');
        if (controlCaptions.length > 0) controlCaptions[currentSlide].classList.add('active');
        
        // Track slide change
        if (window.trackEvent) {
            window.trackEvent('demo_slide_nav', { 
                slide_index: currentSlide,
                slide_label: controlCaptions.length > 0 ? controlCaptions[currentSlide].innerText : `Slide ${currentSlide + 1}`,
                method: method
            });
        }

        resetAutoPlay();
    }

    function nextSlide(method = 'auto') {
        goToSlide(currentSlide + 1, method);
    }

    function prevSlide(method = 'auto') {
        goToSlide(currentSlide - 1, method);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 6000); // 6 seconds per slide
    }

    function toggleTheaterMode(active) {
        isTheaterMode = active;
        if (active) {
            document.body.classList.add('theater-mode-active');
            // Explicitly kill inline styles from the entrance animation script
            heroDemo.style.transform = 'none';
            heroDemo.style.transition = 'none';
        } else {
            document.body.classList.remove('theater-mode-active');
            // Restore animation styles properties if needed, 
            // but the scroll observer will likely re-apply them if we just clear them.
            heroDemo.style.transform = '';
            heroDemo.style.transition = '';
        }

        // Track theater mode toggle
        if (window.trackEvent) {
            window.trackEvent('demo_theater_mode', { action: active ? 'enter' : 'exit' });
        }
    }

    // Toggle theater mode on demo window click
    demoWindow.addEventListener('click', (e) => {
        // Don't toggle if clicking controls or close button
        if (e.target.closest('.demo-controls') || e.target.closest('.theater-close')) return;
        if (!isTheaterMode) toggleTheaterMode(true);
    });

    theaterClose.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTheaterMode(false);
    });

    document.addEventListener('keydown', (e) => {
        if (!isTheaterMode) return;
        
        if (e.key === 'Escape') toggleTheaterMode(false);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            nextSlide('keyboard');
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
            prevSlide('keyboard');
        }
    });

    // Handle clicks on theater overlay for navigation
    heroDemo.addEventListener('click', (e) => {
        if (!isTheaterMode) return;
        
        // Ignore clicks on controls or close button
        if (e.target.closest('.demo-controls') || e.target.closest('.theater-close')) return;
        
        // Navigation by screen half
        const width = window.innerWidth;
        if (e.clientX < width / 2) {
            prevSlide('theater_click');
        } else {
            nextSlide('theater_click');
        }
    });

    // Handle physical right-click for 'Previous' button
    document.addEventListener('contextmenu', (e) => {
        if (isTheaterMode) {
            e.preventDefault();
            prevSlide('theater_right_click');
        }
    });

    nextBtn.addEventListener('click', () => nextSlide('button_click'));
    prevBtn.addEventListener('click', () => prevSlide('button_click'));

    // Gesture Detection
    let wheelCooldown = false;
    let touchStartX = 0;
    let touchStartY = 0;
    const GESTURE_THRESHOLD = 30; // Lowered from 50

    // Trackpad swipe detection (using deltaX)
    demoWindow.addEventListener('wheel', (e) => {
        // If we are definitely scrolling horizontally
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
            // Prevent browser back/forward navigation
            if (e.cancelable) e.preventDefault();
            
            if (!wheelCooldown && Math.abs(e.deltaX) > GESTURE_THRESHOLD) {
                if (e.deltaX > 0) {
                    nextSlide('trackpad_swipe');
                } else {
                    prevSlide('trackpad_swipe');
                }
                triggerWheelCooldown();
            }
        }
    }, { passive: false });

    function triggerWheelCooldown() {
        wheelCooldown = true;
        setTimeout(() => {
            wheelCooldown = false;
        }, 600); // Slightly reduced cooldown
    }

    // Touch swipe detection
    demoWindow.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    demoWindow.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        // Ensure it's mostly a horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > GESTURE_THRESHOLD) {
            if (diffX > 0) {
                nextSlide('touch_swipe');
            } else {
                prevSlide('touch_swipe');
            }
        }
    }, { passive: true });

    // Initial autoplay
    resetAutoPlay();

    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-fade-in').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });

    // Handle scroll for sticky nav glass effect
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.sticky-nav');
        if (window.scrollY > 50) {
            nav.style.padding = '8px 0';
            nav.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
        } else {
            nav.style.padding = '12px 0';
            nav.style.backgroundColor = 'rgba(255, 255, 255, 0.72)';
            nav.style.boxShadow = 'none';
        }
    });
});
