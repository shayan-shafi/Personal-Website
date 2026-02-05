// Highlight + fade in
const typewriter = document.querySelector('.typewriter');
const tagline = document.querySelector('.tagline');

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
        setTimeout(() => {
            typewriter.classList.add('highlighted');
            setTimeout(() => {
                tagline.classList.remove('hidden');
            }, 500);
        }, 600);
    }, 100);
});

// Scroll reveal for about sections
const revealElements = document.querySelectorAll('.reveal, .toc-item');

let ticking = false;

const scrollHighlights = document.querySelectorAll('.scroll-highlight');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const revealPoint = 150;
        
        if (elementTop < windowHeight - revealPoint) {
            element.classList.add('visible');
        }
    });

    scrollHighlights.forEach(el => {
        const elTop = el.getBoundingClientRect().top;
        if (elTop < windowHeight - 100 && !el.classList.contains('highlighted')) {
            el.classList.add('highlighted');
        }
    });

    ticking = false;
};

// Optimized scroll with requestAnimationFrame
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(revealOnScroll);
        ticking = true;
    }
}, { passive: true });

window.addEventListener('load', revealOnScroll);
