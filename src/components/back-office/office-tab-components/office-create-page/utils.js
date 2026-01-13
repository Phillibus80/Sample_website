import {FORM_ERROR_TEXT, PLACEHOLDER_TEXT} from '../../../../constants/constants.js';

export const handleCreatePageSubmit = async (vals, setErrors, createPage, resetForm) => {
    const valueEntries = Object.entries(vals);

    // Check for errors
    const newErrors = valueEntries.reduce((accum, [key, val]) => {
        if (!val || val === PLACEHOLDER_TEXT) {
            accum[key] = FORM_ERROR_TEXT.CREATE_PAGE_SECTION_SELECTION_TEXT;
        }

        return accum;
    }, {});

    setErrors(newErrors);

    // No errors, continue to pass the data to the API
    if (Object.values(newErrors).length === 0) {
        const sections = valueEntries.filter(([key,]) => key !== 'pageName');

        await createPage({pageName: vals.pageName, sections: sections, resetForm});
    }
};