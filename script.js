// #region agent log — debug instrumentation
const _DBG = 'http://127.0.0.1:7243/ingest/3b301dd0-a830-44f4-b550-c5bf47bb52fe';
const _log = (loc, msg, data, hId) => fetch(_DBG,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:loc,message:msg,data:data,timestamp:Date.now(),sessionId:'debug-session',hypothesisId:hId})}).catch(()=>{});

// H-A: Check if scroll-behavior smooth is active
window.addEventListener('load', () => {
    const computed = getComputedStyle(document.documentElement).scrollBehavior;
    const hasFocus = document.querySelector(':focus');
    _log('script.js:HA','scroll-behavior check on load',{scrollBehavior:computed,focusedElement:hasFocus?.tagName||'none',focusWithin:document.documentElement.matches(':focus-within')},'H-A');
});
document.addEventListener('click', () => {
    setTimeout(() => {
        const computed = getComputedStyle(document.documentElement).scrollBehavior;
        _log('script.js:HA-click','scroll-behavior after click',{scrollBehavior:computed,focusWithin:document.documentElement.matches(':focus-within'),focusedEl:document.activeElement?.tagName},'H-A');
    }, 50);
}, {passive:true});

// H-B/C/D/E: Measure frame drops during scroll — log jank frames (>20ms)
let _lastFrame = 0, _scrollY = 0, _jankCount = 0, _frameCount = 0, _scrolling = false, _scrollTimer;
const _sections = ['hero','collage','toc','currently','previously','hobbies','connect'];
function _getSection(y) {
    for (const id of _sections) {
        const el = document.getElementById(id) || document.querySelector('.'+id) || document.querySelector('.'+id+'-section');
        if (el) { const r = el.getBoundingClientRect(); if (r.top <= 200 && r.bottom > 200) return id; }
    }
    return 'unknown';
}
function _frameMeasure(ts) {
    if (_scrolling) {
        _frameCount++;
        if (_lastFrame > 0) {
            const delta = ts - _lastFrame;
            if (delta > 20) { // jank frame: >20ms between frames
                _jankCount++;
                const section = _getSection(window.scrollY);
                _log('script.js:frame','JANK frame detected',{frameDelta:Math.round(delta),scrollY:window.scrollY,section:section,jankCount:_jankCount,frameCount:_frameCount},'H-E');
            }
        }
        _lastFrame = ts;
        requestAnimationFrame(_frameMeasure);
    }
}
window.addEventListener('scroll', () => {
    if (!_scrolling) {
        _scrolling = true;
        _lastFrame = 0;
        requestAnimationFrame(_frameMeasure);
        _log('script.js:scroll-start','Scroll session started',{scrollY:window.scrollY},'H-E');
    }
    clearTimeout(_scrollTimer);
    _scrollTimer = setTimeout(() => {
        _scrolling = false;
        _log('script.js:scroll-end','Scroll session ended',{scrollY:window.scrollY,totalFrames:_frameCount,jankFrames:_jankCount,jankRate:_frameCount>0?(_jankCount/_frameCount*100).toFixed(1)+'%':'n/a'},'H-E');
        _jankCount = 0; _frameCount = 0;
    }, 200);
}, {passive:true});
// #endregion

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

// Scroll reveal via IntersectionObserver (no layout reflows, runs off main thread)
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0,
    rootMargin: '0px 0px -150px 0px'
});

document.querySelectorAll('.reveal, .toc-item').forEach(el => {
    revealObserver.observe(el);
});

// Scroll highlight via IntersectionObserver
const highlightObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('highlighted')) {
            entry.target.classList.add('highlighted');
            // #region agent log
            const r = entry.target.getBoundingClientRect();
            const rects = entry.target.getClientRects();
            const rectArr = Array.from(rects).map(cr => ({x:Math.round(cr.x),y:Math.round(cr.y),w:Math.round(cr.width),h:Math.round(cr.height)}));
            const cs = getComputedStyle(entry.target);
            _log('script.js:highlight','Highlight triggered',{text:entry.target.textContent,boundingRect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},clientRects:rectArr,numLines:rects.length,display:cs.display,position:cs.position,viewport:{w:window.innerWidth,h:window.innerHeight},hasClass:entry.target.classList.contains('highlighted')},'H-HL');
            // #endregion
            highlightObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0,
    rootMargin: '0px 0px -100px 0px'
});

document.querySelectorAll('.scroll-highlight').forEach(el => {
    highlightObserver.observe(el);
});

// Allow page scrolling over iframes on mobile
// Adds a transparent overlay that captures scroll gestures,
// then hides itself on tap so the iframe becomes interactive
if ('ontouchstart' in window) {
    document.querySelectorAll('.spotify-embed, .video-container').forEach(container => {
        container.style.position = 'relative';
        
        const overlay = document.createElement('div');
        overlay.setAttribute('style',
            'position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;'
        );
        container.appendChild(overlay);

        overlay.addEventListener('click', () => {
            overlay.style.display = 'none';
            setTimeout(() => { overlay.style.display = ''; }, 4000);
        }, { passive: true });
    });
}
