/* ==========================================================================
   MODULE: CATALOG GRID (.cdlv-catalog-grid)
   Purpose: Responsive 2-to-4 column product grid with a sticky left header.
   Architecture: Mobile-first flexbox layout that shifts to a side-by-side 
   configuration on desktop. Strict 0px border radius is enforced.
   ========================================================================== */

.cdlv-catalog-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-block: var(--spacing-xl);
}

.cdlv-catalog-grid__header {
  margin-bottom: var(--spacing-sm);
}

.cdlv-catalog-grid__title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-h2);
  color: var(--color-accent);
  margin-bottom: var(--spacing-xs);
}

.cdlv-catalog-grid__items {
  display: grid;
  /* Baseline mobile: 2 columns */
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  width: 100%;
}

.cdlv-catalog-grid__card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-primary);
  border-radius: var(--radius-strict);
  overflow: hidden;
  transition: transform var(--transition-base);
}

.cdlv-catalog-grid__card:hover {
  transform: translateY(-2px);
}

.cdlv-catalog-grid__img-wrapper {
  aspect-ratio: 4 / 5;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-strict);
}

.cdlv-catalog-grid__img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-strict);
  transition: transform var(--transition-slow);
}

.cdlv-catalog-grid__card:hover .cdlv-catalog-grid__img-wrapper img {
  transform: scale(1.03);
}

.cdlv-catalog-grid__content {
  padding-block: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.cdlv-catalog-grid__item-title {
  font-family: var(--font-family-body);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-dark);
  margin-bottom: calc(var(--spacing-xs) / 2);
}

.cdlv-catalog-grid__price {
  font-size: var(--font-size-small);
  color: var(--color-text-dark);
  margin-bottom: var(--spacing-xs);
}

.cdlv-catalog-grid__divider {
  border: none;
  border-top: 1px solid rgba(26, 26, 26, 0.1);
  margin-block: var(--spacing-xs);
}

.cdlv-catalog-grid__sub-text {
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: var(--color-neutral-bg); /* Mapped to the neutral green variable */
  font-weight: 600;
  margin-bottom: calc(var(--spacing-xs) / 2);
}

.cdlv-catalog-grid__sub-price {
  font-size: var(--font-size-small);
  margin-bottom: var(--spacing-sm);
}

/* Button Extracted as Reusable Component UI if not already existing */
.cdlv-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-family-body);
  font-size: var(--font-size-small);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  border: none;
  cursor: pointer;
  border-radius: var(--radius-strict);
  width: 100%;
  margin-top: auto; /* Pushes button to bottom of card */
  transition: background-color var(--transition-base), color var(--transition-base);
}

.cdlv-btn--primary {
  background-color: var(--color-neutral-bg); /* Assigned neutral green from system */
  color: var(--color-text-dark);
}

.cdlv-btn--primary:hover {
  background-color: var(--color-accent);
  color: var(--color-primary);
}

.cdlv-btn--disabled {
  background-color: #e0e0e0;
  color: #888888;
  cursor: not-allowed;
  pointer-events: none;
}

/* Responsive Scaling to 4 Columns & Side Header Shift */
@media (min-width: 768px) {
  .cdlv-catalog-grid__items {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
  }
}

@media (min-width: 1024px) {
  .cdlv-catalog-grid {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .cdlv-catalog-grid__header {
    flex: 0 0 clamp(200px, 20vw, 300px);
    position: sticky;
    top: var(--header-offset); /* Relies on global token */
  }

  .cdlv-catalog-grid__items {
    flex: 1;
    grid-template-columns: repeat(4, 1fr);
  }
}