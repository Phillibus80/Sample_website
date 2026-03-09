/**
 * Returns true if the component has any content an editor could act on.
 * Structural-marker components (e.g. Email Field — all content arrays empty)
 * return false.
 *
 * @param {Component} component
 * @return {boolean}
 */
export const hasEditableContent = (component) =>
    !!(component?.images?.length
        || component?.textContent?.length
        || component?.links?.length
        || component?.events?.length);

/**
 * Locates a component object inside a section by its component_name.
 * Returns the full Component object (not just its extracted content arrays)
 * so it can be handed to the editor modal.
 *
 * @param {Section} section
 * @param {string} componentName
 * @return {Component|undefined}
 */
export const findComponent = (section, componentName) =>
    section?.components?.find(c => c.component_name === componentName);

/**
 * Returns components that a preview did NOT explicitly handle but which
 * still carry editable content. Catches both dev-drift (preview forgot a
 * component) and DB orphans (content attached to an unexpected component).
 *
 * @param {Section} section
 * @param {Array<string>} handledNames — component_name values the preview already rendered
 * @return {Array<Component>}
 */
export const getOrphans = (section, handledNames) =>
    section?.components?.filter(
        c => !handledNames.includes(c.component_name) && hasEditableContent(c)
    ) ?? [];
