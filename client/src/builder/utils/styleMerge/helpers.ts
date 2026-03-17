/**
 * Style Helper Functions
 */

/**
 * Sanitize style value to prevent injection
 */
export const sanitizeStyleValue=(value: any): string|number => {
    if (typeof value==='number') return value;
    if (typeof value==='string') {
        // Remove any javascript: or expression: prefixes
        if (value.toLowerCase().startsWith('javascript:')||value.toLowerCase().startsWith('expression:')) {
            return '';
        }
        return value;
    }
    return '';
};

/**
 * Deep merge two objects (for combining styles)
 */
export const deepMerge=<T extends Record<string, any>>(
    base: T,
    override: Partial<T>
): T => {
    const result={ ...base };

    for (const [key, value] of Object.entries(override)) {
        if (value===undefined||value===null) {
            result[key as keyof T]=value as any;
        } else if (typeof value==='object'&&!Array.isArray(value)) {
            result[key as keyof T]=deepMerge(
                (result[key as keyof T] as any)||{},
                value
            ) as any;
        } else {
            result[key as keyof T]=value as any;
        }
    }

    return result;
};

/**
 * Remove undefined/null values from object
 */
export const compactObject=<T extends Record<string, any>>(obj: T): Partial<T> => {
    const result: Partial<T>={};

    for (const [key, value] of Object.entries(obj)) {
        if (value!==undefined&&value!==null&&value!=='') {
            result[key as keyof T]=value;
        }
    }

    return result;
};

/**
 * Add unit to value if needed
 */
export const addUnit=(val: any): string|number => {
    if (!val&&val!==0) return '';
    // If it's a number, add px
    if (typeof val==='number') return `${val}px`;
    // If it's a string that looks like a number, add px
    if (typeof val==='string'&&!isNaN(parseFloat(val))&&val.trim()!=='') {
        return `${val}px`;
    }
    // Otherwise return as is (might already have unit)
    return val;
};

/**
 * Convert dimensions object to shorthand
 */
export const toShorthand=(top: any, right: any, bottom: any, left: any): string|null => {
    if (top&&top===right&&top===bottom&&top===left) {
        return top;
    }
    return null;
};
