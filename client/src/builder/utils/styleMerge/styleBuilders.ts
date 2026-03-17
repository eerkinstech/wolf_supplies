/**
 * Style Builders - Specialized builders for complex style properties
 */

import { addUnit, toShorthand } from './helpers';

/**
 * Build padding style from dimensions value
 */
export const buildPaddingStyle=(
    padding: Record<string, any>
): Record<string, string|number> => {
    if (!padding) return {};

    const top=padding.top!==undefined? addUnit(padding.top):'';
    const right=padding.right!==undefined? addUnit(padding.right):'';
    const bottom=padding.bottom!==undefined? addUnit(padding.bottom):'';
    const left=padding.left!==undefined? addUnit(padding.left):'';

    const shorthand=toShorthand(top, right, bottom, left);
    if (shorthand) {
        return { padding: shorthand };
    }

    return {
        ...(top&&{ paddingTop: top }),
        ...(right&&{ paddingRight: right }),
        ...(bottom&&{ paddingBottom: bottom }),
        ...(left&&{ paddingLeft: left }),
    };
};

/**
 * Build margin style from dimensions value
 */
export const buildMarginStyle=(
    margin: Record<string, any>
): Record<string, string|number> => {
    if (!margin) return {};

    const top=margin.top!==undefined? addUnit(margin.top):'';
    const right=margin.right!==undefined? addUnit(margin.right):'';
    const bottom=margin.bottom!==undefined? addUnit(margin.bottom):'';
    const left=margin.left!==undefined? addUnit(margin.left):'';

    const shorthand=toShorthand(top, right, bottom, left);
    if (shorthand) {
        return { margin: shorthand };
    }

    return {
        ...(top&&{ marginTop: top }),
        ...(right&&{ marginRight: right }),
        ...(bottom&&{ marginBottom: bottom }),
        ...(left&&{ marginLeft: left }),
    };
};

/**
 * Build border style from border value
 */
export const buildBorderStyle=(
    border: Record<string, any>
): Record<string, any> => {
    if (!border||Object.keys(border).length===0) return {};

    let width=border.width!==undefined? border.width:undefined;
    if (width!==undefined&&width!==null&&width!=='') {
        if (typeof width==='number') {
            width=`${width}px`;
        } else if (typeof width==='string'&&!/px|em|rem|%|pt/.test(width)) {
            width=`${width}px`;
        }
    }

    const style=border.style!==undefined? border.style:undefined;
    const color=border.color!==undefined? border.color:undefined;

    let radius=border.radius!==undefined? border.radius:undefined;
    if (radius!==undefined&&radius!==null&&radius!=='') {
        if (typeof radius==='number') {
            radius=`${radius}px`;
        } else if (typeof radius==='string'&&!/px|em|rem|%|pt/.test(radius)) {
            radius=`${radius}px`;
        }
    }

    return {
        ...(width&&{ borderWidth: width }),
        ...(style&&{ borderStyle: style }),
        ...(color&&{ borderColor: color }),
        ...(radius&&{ borderRadius: radius }),
    };
};

/**
 * Build shadow style from shadow value
 */
export const buildShadowStyle=(
    shadow: Record<string, any>
): Record<string, any> => {
    if (!shadow||Object.keys(shadow).length===0) return {};

    const offsetX=Number(shadow.offsetX)||0;
    const offsetY=Number(shadow.offsetY)||0;
    const blur=Number(shadow.blur)||0;
    const spread=Number(shadow.spread)||0;
    const color=shadow.color||'rgba(0, 0, 0, 0.1)';
    const inset=shadow.inset? 'inset ':'';

    const boxShadow=`${inset}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
    return { boxShadow };
};

/**
 * Build typography style from typography value
 */
export const buildTypographyStyle=(
    typography: Record<string, any>
): Record<string, any> => {
    if (!typography) return {};

    return {
        ...(typography.fontFamily&&{ fontFamily: typography.fontFamily }),
        ...(typography.fontSize&&{ fontSize: typography.fontSize }),
        ...(typography.fontWeight&&{ fontWeight: typography.fontWeight }),
        ...(typography.lineHeight&&{ lineHeight: typography.lineHeight }),
        ...(typography.letterSpacing&&{ letterSpacing: typography.letterSpacing }),
        ...(typography.textTransform&&{ textTransform: typography.textTransform }),
    };
};

/**
 * Build background style from style values
 */
export const buildBackgroundStyle=(
    color?: string,
    gradient?: string,
    image?: string,
    size?: string,
    position?: string,
    repeat?: string
): Record<string, any> => {
    const bg: Record<string, any>={};

    if (color) bg.backgroundColor=color;
    if (gradient) bg.backgroundImage=gradient;
    if (image) bg.backgroundImage=`url(${image})`;
    if (size) bg.backgroundSize=size;
    if (position) bg.backgroundPosition=position;
    if (repeat) bg.backgroundRepeat=repeat;

    return bg;
};

/**
 * Build flex layout style
 */
export const buildFlexStyle=(
    display?: string,
    direction?: string,
    justify?: string,
    align?: string,
    gap?: string|number
): Record<string, any> => {
    const flex: Record<string, any>={};

    if (display==='flex') flex.display='flex';
    if (direction) flex.flexDirection=direction;
    if (justify) flex.justifyContent=justify;
    if (align) flex.alignItems=align;
    if (gap!==undefined&&gap!=='') flex.gap=gap;

    return flex;
};

/**
 * Build position style
 */
export const buildPositionStyle=(
    position?: string,
    top?: string|number,
    right?: string|number,
    bottom?: string|number,
    left?: string|number,
    zIndex?: number
): Record<string, any> => {
    const pos: Record<string, any>={};

    if (position) pos.position=position;
    if (top!==undefined&&top!=='') pos.top=top;
    if (right!==undefined&&right!=='') pos.right=right;
    if (bottom!==undefined&&bottom!=='') pos.bottom=bottom;
    if (left!==undefined&&left!=='') pos.left=left;
    if (zIndex!==undefined) pos.zIndex=zIndex;

    return pos;
};
