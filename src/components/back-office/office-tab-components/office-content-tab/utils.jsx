/**
 * A function that finds the fields that have changed in the Formik Values object
 * as compared to the initValues object.
 *
 * @param {object} initValues
 * @param {object} currentValues
 * @param {string} namespacePrefix
 * @return {{[link]: Array<object>, [image]: Array<object>, [textContent]: Array<object>, [event]: Array<object>, [location]: Array<object>}}
 */
export const getFormValueChanges = (initValues, currentValues, namespacePrefix) => {
    const changes = [];
    for (const valKey in initValues) {
        if (initValues[valKey] !== currentValues[valKey]) {
            const keyName = valKey
                .replaceAll(`${namespacePrefix}_`, '');
            changes.push({[keyName]: currentValues[valKey]});
        }
    }

    return changes.reduce((accum, current) => {
        Object.entries(current).forEach(
            ([key, value]) => {
                const [
                    contentType,
                    contentId,
                    ...rest
                ] = key.split('_');
                const contentKey = rest.join('_');

                if (!accum[contentType]) accum[contentType] = {};
                if (!accum[contentType][contentId]) accum[contentType][contentId] = {};
                accum[contentType][contentId][contentKey] = value;
            });

        return accum;
    }, {});
};