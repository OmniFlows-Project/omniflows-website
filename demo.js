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
        pip.addEventListener('click', () => goToSlide(i));
        pipsContainer.appendChild(pip);
    });

    const pips = pipsContainer.querySelectorAll('span');
    const controlCaptions = document.querySelectorAll('.control-caption');

    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        pips[currentSlide].classList.remove('active');
        if (controlCaptions.length > 0) controlCaptions[currentSlide].classList.remove('active');
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        pips[currentSlide].classList.add('active');
        if (controlCaptions.length > 0) controlCaptions[currentSlide].classList.add('active');
        
        resetAutoPlay();
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 6000); // 6 seconds per slide
    }

    function toggleTheaterMode(active) {
        isTheaterMode = active;
        if (active) {
            heroDemo.classList.add('theater-mode');
            document.body.style.overflow = 'hidden';
        } else {
            heroDemo.classList.remove('theater-mode');
            document.body.style.overflow = '';
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
        if (e.key === 'Escape' && isTheaterMode) toggleTheaterMode(false);
    });

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

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
