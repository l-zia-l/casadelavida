import { buildPath } from '../utils/path.js';

const defaultConfig = {
    heading: '',
    ctaText: 'Shop All',
    ctaLink: 'shop.html',
    products: [
        {
            title: 'The Fertility Wellness Box',
            image: 'assets/images/products/box_1.webp',
            alt: 'Fertility Wellness Box packaged in premium materials',
            actionLink: 'shop/packages/fertility-wellness-box.html'
        },
        {
            title: 'Premium Herbal Infusion',
            image: 'assets/images/products/item_2.2.1.webp',
            alt: 'The Premium Tea Leaves',
            actionLink: 'shop/products/premium-herbal-infusion.html'
        },
        {
            title: 'Honey Infused Tumeric',
            image: 'assets/images/products/item_1.webp',
            alt: 'Glass jar of creamy tumeric paste and black paper',
            actionLink: 'shop/products/honey-infused-tumeric.html'
        },
        {
            title: 'Organic Honey',
            image: 'assets/images/products/item_4.webp',
            alt: 'Premium organic honey',
            actionLink: 'shop/products/organic-honey.html'
        }
    ]
};

function sanitizeHTML(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

export function init(node, customConfig = {}) {
    const config = { ...defaultConfig, ...customConfig };
    const products = customConfig.products || config.products;
    const safeCtaLink = buildPath(config.ctaLink);

    const cardsHTML = products.map((product, index) => {
        const safeImage = buildPath(product.image);
        const safeProductLink = buildPath(product.actionLink || config.ctaLink);
        
        // Eager load only the first 2 visible cards, lazy load the rest
        const isVisible = index < 2;
        const loadingStrategy = isVisible ? 'loading="eager" decoding="sync"' : 'loading="lazy" decoding="async"';
        
        return `
            <article class="cdlv-catalog-slider__card">
                <a href="${sanitizeHTML(safeProductLink)}" class="cdlv-catalog-slider__image-box img-hover-scale u-img-loader" tabindex="-1" aria-hidden="true">
                    <img src="${sanitizeHTML(safeImage)}" 
                        alt="${sanitizeHTML(product.alt)}" 
                        class="u-img-reveal"
                        ${loadingStrategy}>
                </a>
                <div class="cdlv-catalog-slider__info">
                    <h3 class="cdlv-catalog-slider__product-title">
                        <a href="${sanitizeHTML(safeProductLink)}">${sanitizeHTML(product.title)}</a>
                    </h3>
                </div>
            </article>
        `;
    }).join('');

    const html = `
        <section class="cdlv-catalog-slider animate-enter" aria-label="${sanitizeHTML(config.heading)}" data-image-sync>
            <header class="cdlv-catalog-slider__header">
                <h2 class="cdlv-catalog-slider__title">${sanitizeHTML(config.heading)}</h2>
                
                <div class="cdlv-catalog-slider__controls">
                    <button class="cdlv-catalog-slider__arrow cdlv-catalog-slider__arrow--prev" aria-label="Slide to previous items" type="button" disabled>
                        <svg class="cdlv-catalog-slider__arrow-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M15 18l-6-6 6-6" stroke-linecap="square" stroke-linejoin="miter"/>
                        </svg>
                    </button>
                    <button class="cdlv-catalog-slider__arrow cdlv-catalog-slider__arrow--next" aria-label="Slide to next items" type="button">
                        <svg class="cdlv-catalog-slider__arrow-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M9 18l6-6-6-6" stroke-linecap="square" stroke-linejoin="miter"/>
                        </svg>
                    </button>
                </div>
            </header>
            
            <div class="cdlv-catalog-slider__carousel-wrapper">
                <div class="cdlv-catalog-slider__track" role="region" aria-label="Product Slider Track" tabindex="0">
                    ${cardsHTML}
                </div>
            </div>

            <footer class="cdlv-catalog-slider__footer">
                <a href="${sanitizeHTML(safeCtaLink)}" class="cdlv-catalog-slider__shop-all">
                    ${sanitizeHTML(config.ctaText)}
                </a>
            </footer>
        </section>
    `;

    node.innerHTML = html;

    const track = node.querySelector('.cdlv-catalog-slider__track');
    const prevBtn = node.querySelector('.cdlv-catalog-slider__arrow--prev');
    const nextBtn = node.querySelector('.cdlv-catalog-slider__arrow--next');

    if (!track || !prevBtn || !nextBtn) return;

    const getScrollAmount = () => {
        const card = track.querySelector('.cdlv-catalog-slider__card');
        if (!card) return 0;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return card.offsetWidth + gap;
    };

    const updateArrows = () => {
        const scrollLeft = Math.ceil(track.scrollLeft);
        const maxScroll = Math.floor(track.scrollWidth - track.clientWidth);
        
        if (scrollLeft > 5) {
            prevBtn.style.opacity = '1';
            prevBtn.disabled = false;
        } else {
            prevBtn.style.opacity = '0';
            prevBtn.disabled = true;
        }

        if (scrollLeft < maxScroll - 5) {
            nextBtn.style.opacity = '1';
            nextBtn.disabled = false;
        } else {
            nextBtn.style.opacity = '0';
            nextBtn.disabled = true;
        }
    };

    let ticking = false;
    const onScrollOrResize = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateArrows();
                ticking = false;
            });
            ticking = true;
        }
    };

    prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    track.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    
    updateArrows();
}